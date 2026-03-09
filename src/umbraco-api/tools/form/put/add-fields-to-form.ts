import { z } from "zod";
import { v4 as uuid } from "uuid";
import {
  withStandardDecorators,
  getApiClient,
  createToolResult,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { fieldSchema, buildField, collectExistingFields } from "../field-helpers.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = {
  id: z.string().uuid().describe("The ID of the form to add fields to. Use list-forms or get-form-tree to find form IDs."),
  fields: z.array(fieldSchema).describe("Fields to append to the form's first page. Existing fields are preserved."),
};

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  totalFields: z.number(),
});

const AddFieldsToFormTool = {
  name: "add-fields-to-form",
  description: "Add fields to an existing form without replacing existing ones. Fetches the form, appends new fields to page 1, and saves. Use this instead of update-form when you want to add fields without needing to re-specify all existing fields.",
  inputSchema,
  outputSchema,
  slices: ["update"],
  annotations: {
    idempotentHint: false,
  },
  handler: async (params) => {
    const client = getApiClient<ApiClient>();

    const existing = await client.getFormById(params.id) as any;

    const page = existing.pages?.[0];
    if (!page) {
      throw new Error("Form has no pages. Use update-form with 'pages' to create the page structure first.");
    }

    // Collect all existing fields from page 1 to determine sort order offset
    const existingFields = collectExistingFields([page]);
    const startIndex = existingFields.length;

    // Build new fields with sort order continuing from existing
    const newFields = params.fields.map((field, index) =>
      buildField(field, startIndex + index)
    );

    // Find or create the first fieldSet and container
    if (page.fieldSets?.length && page.fieldSets[0].containers?.length) {
      // Append to existing container
      const container = page.fieldSets[0].containers[0];
      container.fields = [...(container.fields || []), ...newFields];
    } else {
      // Create fieldSet structure if none exists
      const pageId = page.id;
      page.fieldSets = [
        {
          id: uuid(),
          caption: null,
          sortOrder: 0,
          page: pageId,
          containers: [
            {
              id: uuid(),
              caption: null,
              width: 12,
              fields: newFields,
            },
          ],
          condition: null,
        },
      ];
    }

    existing.updated = new Date().toISOString();

    await client.putFormById(params.id, existing as any, CAPTURE_RAW_HTTP_RESPONSE);

    const totalFields = startIndex + newFields.length;
    return createToolResult({ id: params.id, name: existing.name, totalFields });
  },
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema>;

export default withStandardDecorators(AddFieldsToFormTool);
