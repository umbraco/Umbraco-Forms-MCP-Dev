# forms-mcp-server

MCP server for Umbraco Forms, built on `@umbraco-cms/mcp-server-sdk`. Exposes forms, data sources, records, workflows, and related Forms management APIs as MCP tools.

## Prerequisites

- Node.js 22+
- .NET SDK 10.0
- SQL Server reachable at `localhost:1433` (the committed `demo-site/appsettings.local.json` expects `sa` / `MyStrong!Passw0rd`; edit that file if you want different credentials or SQLite)

## Quick Start

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

### 6. Build and try it

```bash
npm run build

# Test with MCP Inspector
npm run inspect
```

Or open this project directory in Claude Code — `.mcp.json` registers the server automatically (it runs `node --env-file=.env ./dist/index.js`, so no secrets leave `.env`).

## Project Structure

```
├── src/
│   ├── umbraco-api/
│   │   ├── api/
│   │   │   ├── client.ts              # API client configuration
│   │   │   └── generated/             # Orval-generated client and Zod schemas
│   │   └── tools/
│   │       └── {collection}/          # e.g. form, data-source, record, workflow-type...
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
