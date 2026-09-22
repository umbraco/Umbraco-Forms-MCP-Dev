# @umbraco-forms/mcp-dev

An [MCP](https://modelcontextprotocol.io) server for **Umbraco Forms**. Point it at an Umbraco
instance and your AI assistant can build forms, manage data sources and prevalue sources, read
submissions, query analytics, and submit entries — 102 tools across 24 collections.

Built on [`@umbraco-cms/mcp-server-sdk`](https://www.npmjs.com/package/@umbraco-cms/mcp-server-sdk).

## Requirements

- **Node.js 22+**
- An **Umbraco instance with Umbraco Forms installed**, reachable over HTTP(S)
- An **API user** on that instance (see below)

This server targets **Umbraco 18**. Connecting to a different major version warns and blocks the
first tool call; set `UMBRACO_EXPECTED_MAJOR` to override if you know what you're doing.

## 1. Create an API user in Umbraco

In the Umbraco backoffice:

1. Go to **Settings → Users**
2. Create a new **API user**
3. Note its **Client ID** and **Client Secret**
4. Grant it permissions for the Forms sections you want the assistant to reach

The server authenticates with those credentials via OAuth client credentials.

## 2. Add it to your MCP client

### Claude Code / Claude Desktop

Add to your `.mcp.json` (or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "umbraco-forms": {
      "command": "npx",
      "args": ["-y", "@umbraco-forms/mcp-dev"],
      "env": {
        "UMBRACO_BASE_URL": "https://your-site.example.com",
        "UMBRACO_CLIENT_ID": "your-client-id",
        "UMBRACO_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

Restart your client and the tools appear.

### Any other MCP client

The server speaks MCP over stdio. Run it however your client spawns servers:

```bash
UMBRACO_BASE_URL=https://your-site.example.com \
UMBRACO_CLIENT_ID=your-client-id \
UMBRACO_CLIENT_SECRET=your-client-secret \
npx -y @umbraco-forms/mcp-dev
```

### Local Umbraco with a self-signed certificate

Add `"NODE_TLS_REJECT_UNAUTHORIZED": "0"` to `env`. Only do this against local development
instances — it disables certificate verification process-wide.

## 3. Check it works

Without wiring up a client:

```bash
# List every tool this server exposes
npx -y @umbraco-forms/mcp-dev --list-tools

# Show resolved configuration and where each value came from
npx -y @umbraco-forms/mcp-dev --debug-config

# Call a tool directly
UMBRACO_BASE_URL=... UMBRACO_CLIENT_ID=... UMBRACO_CLIENT_SECRET=... \
  npx -y @umbraco-forms/mcp-dev --call list-forms --call-args '{}'
```

`--describe-tool <name>` prints a single tool's full input schema.

## Configuration

Every option is an environment variable, and most also have a CLI flag (`--help` lists them).

### Connection

| Variable | Required | Purpose |
|----------|----------|---------|
| `UMBRACO_BASE_URL` | yes | Base URL of your Umbraco instance |
| `UMBRACO_CLIENT_ID` | yes | API user's client ID |
| `UMBRACO_CLIENT_SECRET` | yes | API user's client secret |
| `UMBRACO_FORMS_API_KEY` | no | Forms Delivery API key — see below |
| `UMBRACO_EXPECTED_MAJOR` | no | Override the expected Umbraco major version |

### Limiting the tool surface

102 tools is a lot of context. Narrow it down:

| Variable | Purpose |
|----------|---------|
| `UMBRACO_TOOL_MODES` | Enable named groups of collections (see below) |
| `UMBRACO_INCLUDE_TOOL_COLLECTIONS` | Only these collections |
| `UMBRACO_EXCLUDE_TOOL_COLLECTIONS` | Everything except these |
| `UMBRACO_INCLUDE_TOOLS` / `UMBRACO_EXCLUDE_TOOLS` | Individual tools by name |
| `UMBRACO_INCLUDE_SLICES` / `UMBRACO_EXCLUDE_SLICES` | By operation type, e.g. `delete` |
| `UMBRACO_READONLY` | Block every write operation |
| `UMBRACO_DRY_RUN` | Log writes instead of performing them |

Available modes:

| Mode | Includes |
|------|----------|
| `forms-authoring` | Building forms: forms, templates, field types, pickers, folders, themes |
| `data-sources` | Data sources and prevalue sources |
| `submissions` | Submitted records, analytics, workflow types |
| `admin` | Config, licensing, updates, members, email templates, export/import |
| `forms-management-all` | All 21 Forms management collections |
| `umbraco-server` | Server information only |

```json
"env": {
  "UMBRACO_TOOL_MODES": "forms-authoring,submissions",
  "UMBRACO_READONLY": "true"
}
```

> **Note:** the Delivery API tools (`form-submission`) aren't part of any mode. If you set
> `UMBRACO_TOOL_MODES`, add `"UMBRACO_INCLUDE_TOOL_COLLECTIONS": "form-submission"` to keep them.

## What you get

| Collection | Tools | What it covers |
|------------|-------|----------------|
| `form` | 28 | Create, edit, copy, move, export and inspect forms |
| `data-source` / `data-source-type` | 12 | External data sources backing form fields |
| `prevalue-source` / `prevalue-source-type` | 12 | Dropdown/checkbox value sources |
| `record` | 9 | Submitted entries — search, read, update, workflow actions |
| `folder` | 7 | Organising forms into folders |
| `analytics` | 6 | Submission and workflow analytics |
| `picker` | 4 | Document type and data type pickers |
| `field-type` | 4 | Available field types and validation patterns |
| `export` | 3 | Export forms and submissions |
| `form-submission` | 2 | Delivery API: read definitions, submit entries |
| `member`, `email-template`, `workflow-type` | 6 | Members, email templates, workflow types |
| `config`, `licensing`, `updates`, `theme`, `media`, `form-template`, `acceptance-tests`, `umbraco-server` | 8 | Server-wide settings and status |
| `chained` | 1 | Info about the chained CMS server |

Run `--list-tools` for the full list with descriptions.

### Authoring forms

Three ways, in order of preference:

1. **`create-simple-form`** — a name and a flat list of `{label, type}` fields. Generates every
   GUID, page, fieldset and default for you. Use this for ordinary forms.
2. **`add-form-fields`** / **`delete-form-field`** — edit an existing form without restating it.
3. **`create-form`** / **`update-form`** — the full design, for conditions, workflows, multiple
   pages or custom field types.

## Forms Delivery API (optional)

Two tools — `get-form-definition` and `submit-form-entry` — use Umbraco's public Forms **Delivery**
API rather than the Management API. They let an assistant read a form the way a frontend sees it
(including field **aliases**) and submit entries against it.

These need extra setup, because the Delivery API is **off by default** and authenticates with an
`Api-Key` header instead of OAuth.

In your Umbraco project's `appsettings.json`:

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

- `EnableFormsApi` — the master switch; defaults to `false`.
- `FormsApiKey` — the shared secret sent as the `Api-Key` header.
- `EnableAntiForgeryTokenForFormsApi: false` — needed for server-to-server callers. The default
  (`true`) expects a browser-issued antiforgery token that an MCP server can't obtain, so leaving
  it on rejects requests that carry a valid key.

Restart the site, then set the matching key:

```json
"env": {
  "UMBRACO_FORMS_API_KEY": "<the same value as FormsApiKey>"
}
```

> **Treat the key as a credential.** Turning off the antiforgery token disables CSRF protection for
> the Forms API on that instance, and anyone holding `FormsApiKey` can submit entries to any form
> on it. Consider carefully before enabling this on production.

Full details in Umbraco's [Headless/AJAX Forms docs](https://docs.umbraco.com/umbraco-forms/developer/ajaxforms).

## Umbraco CMS tools

By default this server also chains to [`@umbraco-cms/mcp-dev`](https://www.npmjs.com/package/@umbraco-cms/mcp-dev),
exposing CMS tools (documents, media, members) alongside the Forms ones, prefixed `cms--`
(e.g. `cms--get-document`). It reuses the same credentials.

Set `DISABLE_MCP_CHAINING=true` to turn this off and run Forms tools only.

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `401` on every tool | Wrong `UMBRACO_CLIENT_ID` / `UMBRACO_CLIENT_SECRET`, or the API user lacks permissions |
| Self-signed certificate errors | Local HTTPS instance — set `NODE_TLS_REJECT_UNAUTHORIZED=0` |
| Version mismatch warning, first tool call blocked | Instance isn't Umbraco 18 — set `UMBRACO_EXPECTED_MAJOR` |
| `403` from the Delivery API tools | `UMBRACO_FORMS_API_KEY` missing or not matching `FormsApiKey`, or `EnableAntiForgeryTokenForFormsApi` is still `true` |
| `404` from the Delivery API for a form that exists | `EnableFormsApi` isn't `true`, or the site wasn't restarted |
| A tool you expected isn't listed | Check `UMBRACO_TOOL_MODES` and the include/exclude variables with `--debug-config` |

## Contributing

Setting up the repo, running the demo Umbraco site and the test suites: see
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
