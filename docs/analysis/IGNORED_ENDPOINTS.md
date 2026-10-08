# Ignored Endpoints

These endpoints are intentionally not implemented in the MCP server, typically because they:
- Are related to import/export functionality that may not be suitable for MCP operations
- Have security implications
- Are deprecated or have better alternatives
- Are not applicable in the MCP context

## Ignored by Category

### Security (13 endpoints)

Reading and changing which backoffice users and user groups may manage forms, data sources and
entries is an administrative, security-sensitive action, so the `security` tool collection was
removed (PR #30) and these endpoints have no tools:

- `GET` / `POST` / `PUT` / `DELETE /security/user/{id}/form-security`
- `GET` / `POST` / `PUT` / `DELETE /security/user-group/{id}/form-security`
- `GET /security/user/current/form-security`
- `GET /security/user/users-to-assign`
- `GET /tree/security/root`, `/tree/security/children/{parentId}`, `/tree/security/ancestors`

Every other Management API endpoint in the generated client has a tool.

## Total Ignored: 13 endpoints
