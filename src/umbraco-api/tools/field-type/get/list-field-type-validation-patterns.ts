import * as zod from "zod";
import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFieldTypeValidationPatternResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const emptyInput = zod.object({});

const ListFieldTypeValidationPatterns = {
  name: "list-field-type-validation-patterns",
  description:
    "List all available validation patterns for form fields. Validation patterns are named regex patterns (e.g., Email, Number) that can be applied to text-based form fields. Returns the pattern name, localization key, and regex expression. Use this when configuring field validation rules.",
  inputSchema: emptyInput.shape,
  outputSchema: getFieldTypeValidationPatternResponse,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<ReturnType<ApiClient["getFieldTypeValidationPattern"]>, ApiClient>(
      (client) => client.getFieldTypeValidationPattern(CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof emptyInput.shape, typeof getFieldTypeValidationPatternResponse>;

export default withStandardDecorators(ListFieldTypeValidationPatterns);
