/**
 * List Themes Tool
 *
 * Lists the Umbraco Forms themes available on the server (e.g. "Umbraco Default"
 * and any custom themes registered via config). Use this to discover valid theme
 * names before assigning a theme to a form. Takes no parameters.
 */

import { z } from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getThemeResponseItem } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({ items: z.array(getThemeResponseItem) });

const listThemesTool = {
  name: "list-themes",
  description:
    "Lists the Umbraco Forms themes available on the server, including the built-in default theme and any custom themes registered in configuration. Use this to discover valid theme names before assigning a theme to a form. Takes no parameters.",
  inputSchema: {},
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getTheme"]>, ApiClient>(
      (client) => client.getTheme(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
} satisfies ToolDefinition<Record<string, never>, typeof outputSchema>;

export default withStandardDecorators(listThemesTool);
