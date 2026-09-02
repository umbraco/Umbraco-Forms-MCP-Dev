/**
 * Unlike the user form-security endpoints (which 404 for a nonexistent user
 * id), the underlying user-group form-security POST/PUT endpoints accept any
 * GUID and return 200 without validating it against a real Umbraco user
 * group. Left unchecked, that silently "succeeds" against a made-up id with
 * nothing actually created. This validates the id against the real user
 * group first so the two collections behave consistently.
 */
import {
  UmbracoManagementClient,
  UmbracoApiError,
  CAPTURE_RAW_HTTP_RESPONSE,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";

export async function assertUserGroupExists(id: string): Promise<void> {
  const response = (await UmbracoManagementClient(
    { url: `/umbraco/management/api/v1/user-group/${id}`, method: "GET" },
    CAPTURE_RAW_HTTP_RESPONSE,
  )) as unknown as HttpResponse<unknown>;

  if (response.status < 200 || response.status >= 300) {
    throw new UmbracoApiError({
      status: response.status,
      detail: `No user group exists with id '${id}'.`,
    });
  }
}
