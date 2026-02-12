import {
  withStandardDecorators,
  createToolResult,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsDeliveryAPI } from "../../../api/generated/umbracoFormsDeliveryApi.js";
import {
  getUmbracoFormsDeliveryApiV1DefinitionsIdParams,
  getUmbracoFormsDeliveryApiV1DefinitionsIdResponse,
} from "../../../api/generated/umbracoFormsDeliveryApi.zod.js";

const GetFormDefinitionTool = {
  name: "get-form-definition",
  description:
    "Get the public form definition from the Delivery API including all pages, fieldsets, fields with their aliases, types, and validation rules. This returns the form structure as seen by frontend consumers. Use field aliases from this response as keys in submit-form-entry values. Use list-forms first to find form IDs.",
  inputSchema: getUmbracoFormsDeliveryApiV1DefinitionsIdParams.shape,
  outputSchema: getUmbracoFormsDeliveryApiV1DefinitionsIdResponse,
  slices: ["read"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async (params) => {
    const client = getUmbracoFormsDeliveryAPI();
    const result = await client.getUmbracoFormsDeliveryApiV1DefinitionsId(params.id);
    return createToolResult(result);
  },
} satisfies ToolDefinition<typeof getUmbracoFormsDeliveryApiV1DefinitionsIdParams.shape, typeof getUmbracoFormsDeliveryApiV1DefinitionsIdResponse>;

export default withStandardDecorators(GetFormDefinitionTool);
