/**
 * List Field Type Validation Patterns Tool
 *
 * Lists the built-in regular-expression validation patterns (e.g. email, number,
 * postcode) that can be applied to Umbraco Forms fields which support regex
 * validation.
 */

import {
  withStandardDecorators,
  executeGetItemsApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { getFieldTypeValidationPatternResponse } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const outputSchema = z.object({ items: getFieldTypeValidationPatternResponse });

const ListFieldTypeValidationPatternsTool = {
  name: "list-field-type-validation-patterns",
  description:
    "Lists the built-in, predefined regular-expression validation patterns available in " +
    "Umbraco Forms (each with a name, translation label key, and the regex pattern " +
    "itself) — for example patterns for email addresses, numbers, or postcodes. These " +
    "are fixed system patterns, not user-defined. Use this to find a valid pattern name " +
    "to apply as the regex/validation setting on a form field that supports regex " +
    "validation (supportsRegex on the field type).",
  inputSchema: {},
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetItemsApiCall<
      ReturnType<ApiClient["getFieldTypeValidationPattern"]>,
      ApiClient
    >((client) => client.getFieldTypeValidationPattern(CAPTURE_RAW_HTTP_RESPONSE));
  },
} satisfies ToolDefinition<Record<string, never>, typeof outputSchema>;

export default withStandardDecorators(ListFieldTypeValidationPatternsTool);
