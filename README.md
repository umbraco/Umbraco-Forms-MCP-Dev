# Umbraco Forms MCP

An MCP (Model Context Protocol) server for [Umbraco Forms](https://umbraco.com/products/umbraco-forms/) that enables AI-powered form management. It provides comprehensive access to the Umbraco Forms Management API, allowing your AI agent to create and manage forms, view submissions, configure data sources and prevalue sources, and more — all through natural conversation.

## Intro

The MCP server authenticates using an Umbraco API user, ensuring secure, permission-based access to the Umbraco Forms API. At startup, it fetches the API user's Forms security permissions and only registers tools the user is authorized to use — no tools are exposed beyond what Umbraco's permission system allows.

The server also connects to the [Forms Delivery API](https://docs.umbraco.com/umbraco-forms/developer/ajaxforms) if an API key is provided, enabling form definition retrieval and form submissions.

It chains to the [Umbraco CMS MCP server](https://www.npmjs.com/package/@umbraco-cms/mcp-dev), proxying its tools with a `cms:` prefix. This gives your AI agent access to both Forms and CMS capabilities in a single session.

## Quick Start

### 1. Create an Umbraco API User

Create an Umbraco API user with appropriate permissions. You can find instructions in [Umbraco's documentation](https://docs.umbraco.com/umbraco-cms/fundamentals/data/users/api-users).

Grant the user access to the **Forms** section and configure Forms-specific permissions (manage forms, view entries, etc.).

### 2. Add to Your MCP Client

Add the server to your MCP client configuration (Claude Desktop, Cursor, VS Code, etc.):

```json
{
  "mcpServers": {
    "umbraco-forms": {
      "command": "npx",
      "args": ["umbraco-forms-mcp-dev"],
      "env": {
        "NODE_TLS_REJECT_UNAUTHORIZED": "0",
        "UMBRACO_CLIENT_ID": "your-api-user-id",
        "UMBRACO_CLIENT_SECRET": "your-api-secret",
        "UMBRACO_BASE_URL": "https://localhost:{port}",
        "UMBRACO_FORMS_API_KEY": "your-forms-api-key"
      }
    }
  }
}
```

Restart your MCP client after saving the configuration.

## Configuration

All settings can be provided as environment variables or CLI flags.

### Connection

| Variable | CLI Flag | Purpose |
|---|---|---|
| `UMBRACO_CLIENT_ID` | `--umbraco-client-id` | OAuth client ID |
| `UMBRACO_CLIENT_SECRET` | `--umbraco-client-secret` | OAuth client secret |
| `UMBRACO_BASE_URL` | `--umbraco-base-url` | Umbraco instance URL |
| `UMBRACO_FORMS_API_KEY` | `--umbraco-forms-api-key` | Forms Delivery API key |

### Tool Filtering

| Variable | CLI Flag | Purpose |
|---|---|---|
| `UMBRACO_TOOL_MODES` | `--umbraco-tool-modes` | Enable tool modes (comma-separated) |
| `UMBRACO_INCLUDE_TOOL_COLLECTIONS` | `--umbraco-include-tool-collections` | Include only these collections |
| `UMBRACO_EXCLUDE_TOOL_COLLECTIONS` | `--umbraco-exclude-tool-collections` | Exclude these collections |
| `UMBRACO_INCLUDE_SLICES` | `--umbraco-include-slices` | Include only these slices |
| `UMBRACO_EXCLUDE_SLICES` | `--umbraco-exclude-slices` | Exclude these slices |
| `UMBRACO_READONLY` | `--umbraco-readonly` | Block all write operations |
| `DISABLE_MCP_CHAINING` | `--disable-mcp-chaining` | Disable CMS MCP server chaining |

### Modes

Modes are named groups that enable related collections together. Set `UMBRACO_TOOL_MODES` to one or more mode names:

| Mode | Collections |
|---|---|
| `form-design` | `form`, `field-type`, `folder`, `media` |
| `data-sources` | `data-source`, `data-source-type`, `prevalue-source`, `prevalue-source-type` |
| `submissions` | `record`, `workflow-type` |
| `forms-data` | `data-source` |

### Collections

| Collection | Tools | Description |
|---|---|---|
| `form` | 14 | Forms CRUD, scaffolding, tree browsing, relations |
| `folder` | 6 | Folder CRUD and move operations |
| `record` | 10 | Record listing, filtering, updating, deleting, auditing |
| `data-source` | 8 | Data source CRUD, tree browsing, scaffolding |
| `prevalue-source` | 9 | Prevalue source CRUD, value resolution, tree browsing |
| `field-type` | 3 | Field type discovery and validation patterns |
| `workflow-type` | 2 | Workflow type discovery |
| `data-source-type` | 2 | Data source type discovery |
| `prevalue-source-type` | 2 | Prevalue source type discovery |
| `form-submission` | 2 | Delivery API — form definitions and submissions |

### Slices

Slices filter tools by operation type. Use `UMBRACO_INCLUDE_SLICES` or `UMBRACO_EXCLUDE_SLICES` with values like `create`, `read`, `update`, `delete`, `list`, `tree`, `search`, `copy`, `move`, `audit`, `scaffolding`, and more.

For example, `UMBRACO_INCLUDE_SLICES=read,list` registers only read and list tools.

## Permission-Based Tool Filtering

At startup, the server calls the Forms security API to determine the user's permissions. Tools are only registered when the user has the required permission:

| Permission | Tools Gated |
|---|---|
| **Has Forms Access** | Read tools for forms, folders, data sources, prevalue sources |
| **Manage Forms** | Create, copy, update, move, delete forms and folders |
| **View Entries** | List records, metadata, audit trails |
| **Edit Entries** | Update records, execute record actions |
| **Delete Entries** | Delete records |
| **Manage Workflows** | Copy form workflows, retry record workflows |
| **Manage Data Sources** | Create, update, delete data sources |
| **Manage PreValue Sources** | Create, update, delete prevalue sources |

Reference tools (field types, workflow types, data source types, prevalue source types) and delivery API tools are always available.

If the security endpoint is unreachable, only reference and delivery tools are registered.

## CMS MCP Server Chaining

This server automatically chains to the [Umbraco CMS MCP server](https://www.npmjs.com/package/@umbraco-cms/mcp-dev), sharing the same API user credentials. All CMS tools are proxied with a `cms:` prefix (e.g. `cms:get-document`, `cms:list-media`).

This means your AI agent can work with both Forms and CMS content in a single conversation without needing to configure two separate MCP servers. Any mode, collection, and slice filter configuration is passed through to the chained server.

To disable chaining, set `DISABLE_MCP_CHAINING=true`.

## License

MIT
