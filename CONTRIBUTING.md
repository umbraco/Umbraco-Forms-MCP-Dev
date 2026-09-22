# Contributing / Development

Working on this repo. If you just want to *use* the MCP server against your own Umbraco
instance, see [README.md](README.md) instead — none of the scripts below exist in the
published npm package.


This repo builds `@umbraco-forms/mcp-dev`, an MCP server for Umbraco Forms built on
`@umbraco-cms/mcp-server-sdk`. It exposes the Forms management APIs as MCP tools, plus the public
Forms Delivery API (see [Forms Delivery API](#forms-delivery-api)).

## Prerequisites

- Node.js 22+
- .NET SDK 10.0 and SQL Server reachable at `localhost:1433` — **only if you're running the
  bundled `demo-site/`** (see below). Pointing this server at an existing Umbraco Forms
  instance instead needs neither.

## Quick Start

> **Already have an Umbraco Forms instance?** This server works against any Umbraco Forms
> install — the `demo-site/` in steps 2–4 below is only there to give you something to run
> against out of the box. If you already have an instance running (locally or remotely), skip
> straight to step 5 and point `.env` at it: set `UMBRACO_BASE_URL` to its URL, and
> `UMBRACO_CLIENT_ID` / `UMBRACO_CLIENT_SECRET` to an API user on *that* instance (create one via
> its backoffice, or run `npm run create-api-user <base-url> <admin-email> <admin-password>`
> against it instead of the demo defaults).

### 1. Install dependencies

```bash
npm install
```

### 2. Start SQL Server and create the database

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=MyStrong!Passw0rd" \
  -p 1433:1433 --name forms-mcp-sql -d mcr.microsoft.com/mssql/server:2022-latest

docker exec forms-mcp-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'MyStrong!Passw0rd' -C -Q "CREATE DATABASE FormsMcpDb"
```

### 3. Start the demo Umbraco + Forms instance

`demo-site/` is a working Umbraco Forms install already checked into this repo.

```bash
npm run start:umbraco
```

The first run performs an unattended install and creates the admin user (`admin@admin.com` / `1234567890`, see `demo-site/appsettings.Development.json`). Leave it running — subsequent steps talk to it at `https://localhost:44390`.

### 4. Create the MCP API user

In a new terminal, once Umbraco is up:

```bash
npm run create-api-user
```

This provisions an API user (Client ID `umbraco-back-office-mcp` / Secret `1234567890`) via the Management API — see `CLAUDE.md` for the manual backoffice alternative and version-specific caveats (e.g. the Swagger OAuth redirect path).

### 5. Configure environment

```bash
cp .env.example .env
```

Fill in (or confirm) these values to match the demo site:

```
UMBRACO_CLIENT_ID=umbraco-back-office-mcp
UMBRACO_CLIENT_SECRET=1234567890
UMBRACO_BASE_URL=https://localhost:44390
NODE_TLS_REJECT_UNAUTHORIZED=0
```

To also use the two Delivery API tools, add the key the demo site is already configured with:

```
UMBRACO_FORMS_API_KEY=test-forms-api-key-1234567890
```

Against your own instance this needs matching Umbraco-side config — see
[Forms Delivery API](#forms-delivery-api).

### 6. Build and try it

```bash
npm run build

# Test with MCP Inspector
npm run inspect
```

Or open this project directory in Claude Code — `.mcp.json` registers the server automatically (it runs `node --env-file=.env ./dist/index.js`, so no secrets leave `.env`).

## Forms Delivery API

Most tools here talk to the Forms **Management** API and authenticate with the OAuth client
credentials from step 4. The `form-submission` collection is the exception: it talks to the public
Forms **Delivery** API, which authenticates with an `Api-Key` header instead of OAuth.

| Tool | Endpoint |
|------|----------|
| `get-form-definition` | `GET /umbraco/forms/delivery/api/v1/definitions/{id}` |
| `submit-form-entry` | `POST /umbraco/forms/delivery/api/v1/entries/{id}` |

`get-form-definition` returns the form as a frontend consumer sees it — pages, fieldsets, and
fields with their **aliases**. Those aliases are the keys `submit-form-entry` expects in `values`,
so the two are normally used in sequence. Use `list-forms` (Management API) to find the form ID
for either.

### What your Umbraco project needs

The Delivery API is **off by default**. In the Umbraco project you're pointing at, add to
`appsettings.json`:

```json
{
  "Umbraco": {
    "Forms": {
      "Options": {
        "EnableFormsApi": true
      },
      "Security": {
        "EnableAntiForgeryTokenForFormsApi": false,
        "FormsApiKey": "<a long random string>"
      }
    }
  }
}
```

- **`EnableFormsApi`** — turns the Delivery API endpoints on at all. This is the master switch;
  it defaults to `false`.
- **`FormsApiKey`** — the shared secret this server sends as the `Api-Key` header.
- **`EnableAntiForgeryTokenForFormsApi: false`** — needed for server-to-server callers. The
  default (`true`) expects a browser-issued antiforgery token that an MCP server has no way to
  obtain, so leaving it on rejects calls that carry a perfectly valid key.

Restart the site after editing `appsettings.json`.

Then set the matching key on the MCP side, in `.env`:

```
UMBRACO_FORMS_API_KEY=<the same value as FormsApiKey>
```

The bundled `demo-site/` already has all three settings (see `demo-site/appsettings.json`), so if
you're following the Quick Start you only need the `.env` line.

> **Treat the key as a credential.** `EnableAntiForgeryTokenForFormsApi: false` turns off CSRF
> protection for the Forms API on that instance, and anyone holding `FormsApiKey` can submit
> entries to any form on it. Keep it out of source control, and consider carefully before
> enabling this configuration on production.

See Umbraco's [Headless/AJAX Forms docs](https://docs.umbraco.com/umbraco-forms/developer/ajaxforms)
for the full Delivery API surface.

### These tools are hidden by `UMBRACO_TOOL_MODES`

`form-submission` is not part of any mode in `src/config/mode-registry.ts` — the modes there cover
the Management API collections only. Setting `UMBRACO_TOOL_MODES` narrows the server to exactly
the collections its modes name, so **any** `UMBRACO_TOOL_MODES` value currently hides
`get-form-definition` and `submit-form-entry`, `forms-management-all` included.

Either leave `UMBRACO_TOOL_MODES` unset, or name the collection alongside your modes:

```
UMBRACO_TOOL_MODES=forms-authoring
UMBRACO_INCLUDE_TOOL_COLLECTIONS=form-submission
```

### Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `403` | `UMBRACO_FORMS_API_KEY` is missing, empty, or doesn't match `FormsApiKey` — or `EnableAntiForgeryTokenForFormsApi` is still `true` |
| `404` for a form ID that exists | `EnableFormsApi` isn't `true`, or the site wasn't restarted after the config change |
| Neither tool appears in `--list-tools` | `UMBRACO_TOOL_MODES` is set — see above |

To check a setup end to end without an MCP client:

```bash
node --env-file=.env dist/index.js --call get-form-definition \
  --call-args '{"id":"<a form id from list-forms>"}'
```

## Project Structure

```
├── src/
│   ├── umbraco-api/
│   │   ├── api/
│   │   │   ├── client.ts              # Management API client (OAuth)
│   │   │   ├── delivery-client.ts     # Delivery API client (Api-Key header)
│   │   │   ├── forms-delivery-swagger.json  # Delivery API spec, checked in
│   │   │   └── generated/             # Orval-generated clients and Zod schemas
│   │   └── tools/
│   │       └── {collection}/          # e.g. form, data-source, record, form-submission...
│   │           ├── index.ts           # ToolCollectionExport
│   │           ├── get/ post/ put/ delete/
│   │           └── __tests__/
│   ├── config/                        # Custom fields, slice/mode registries
│   ├── mocks/                         # MSW handlers for unit tests
│   └── index.ts                       # Server entry point
├── demo-site/                         # Local Umbraco Forms instance for dev/testing
├── scripts/
│   ├── create-api-user.mjs            # Provisions the MCP API user
│   ├── test-changed.mjs               # Runs only tests related to the current diff
│   ├── rerun-failures.mjs             # Reruns only the last run's failures
│   └── start-umbraco.sh / .ps1        # Runs demo-site/
├── umbraco/                            # Composer snippets to copy into YOUR OWN Umbraco project
│   └── McpOAuthComposer.cs            # if self-hosting the MCP server as a Worker
├── tests/evals/                       # LLM-based acceptance tests
├── .github/workflows/                 # CI (test.yml) and release (release-tag.yml)
└── .env.example
```

Full tool conventions, registries, and the Umbraco-version check are documented in `CLAUDE.md`.

## Adding Your Own Tools

1. Create a folder under `src/umbraco-api/tools/` for your tool collection
2. Add tool files in the matching subfolder — `get/`, `post/`, `put/`, `delete/`
3. Add an `index.ts` that exports the collection (`ToolCollectionExport`)
4. Register the collection in `src/collections.ts` and `src/index.ts`

### Tool Pattern Example

```typescript
import { z } from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: z.string().uuid(),
};

const myTool: ToolDefinition<typeof inputSchema> = {
  name: "my-tool",
  description: "Does something useful",
  inputSchema,
  slices: ["read"],
  annotations: { readOnlyHint: true },
  handler: async ({ id }) => {
    return executeGetApiCall((client) =>
      client.getMyItem(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
};

export default withStandardDecorators(myTool);
```

## Testing

Integration tests run against the real Umbraco instance from the Quick Start above (no mocking):

```bash
npm test                      # full integration suite
npm run test:changed          # only tests related to files changed vs dev/main
npm run test:rerun-failures   # re-run only what failed last time (reads test-failures.log)
npm run test:evals            # LLM-based acceptance tests (needs Claude Code subscription or ANTHROPIC_API_KEY)
```

Tests use Jest with the MCP toolkit's testing helpers:

```typescript
import {
  setupTestEnvironment,
  createSnapshotResult,
  createMockRequestHandlerExtra,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("my-tool", () => {
  setupTestEnvironment();

  it("should do something", async () => {
    const result = await myTool.handler({ id: "..." }, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
```

## Regenerating the API Client

If the Umbraco Forms Management API changes, point `orval.config.ts` at your instance and regenerate:

```bash
npm run generate
```

This also re-stamps `src/config/umbraco-target.generated.ts` from your connected instance's actual version — see `CLAUDE.md` for why there's no spec-based fallback.

## CI

- `.github/workflows/test.yml` spins up SQL Server + a real Umbraco instance and runs the integration suite per tool collection on every push/PR to `dev`/`main`.
- `.github/workflows/release-tag.yml` tags `v<version>` and creates a GitHub Release whenever `package.json`'s version changes on `main`.

## Deploying as a Hosted Worker

See `src/worker.ts` and `CLAUDE.md`'s "Hosted Worker" section. The `umbraco/` folder holds Composer snippets to copy into your own Umbraco project so it can authenticate a Worker-hosted MCP server.

## License

MIT
