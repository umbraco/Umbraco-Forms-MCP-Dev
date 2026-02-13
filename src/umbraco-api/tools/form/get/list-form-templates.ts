import { z } from "zod";
import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFormTemplateResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = z.object({});
const outputSchema = z.object({ items: getFormTemplateResponse });

const ListFormTemplates = {
  name: "list-form-templates",
  description:
    "Lists all available form templates. Returns template names, aliases, and descriptions. Use the template name with get-form-scaffold-by-template to create a form scaffold pre-populated from a template.",
  inputSchema: emptyInput.shape,
  outputSchema: outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<ReturnType<ApiClient["getFormTemplate"]>, ApiClient>(
      (client) => client.getFormTemplate(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof outputSchema>;

export default withStandardDecorators(ListFormTemplates);
