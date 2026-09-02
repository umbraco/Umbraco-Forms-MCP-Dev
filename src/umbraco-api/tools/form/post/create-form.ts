/**
 * Create Form Tool
 *
 * Creates a new form from a complete form design document. Because the form
 * design carries its own IDs (form ID, page IDs, field IDs, etc.), the model
 * must not invent them — always start from get-form-scaffold or
 * get-form-scaffold-by-template, edit that object, then submit it here.
 */

import {
  withStandardDecorators,
  executeVoidApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  FormDesign,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import { postFormBody } from "../../../api/generated/umbracoFormsManagementApi.zod.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const inputSchema = postFormBody.shape;

const CreateFormTool: ToolDefinition<typeof inputSchema> = {
  name: "create-form",
  description:
    "Creates a new form from a complete form design (name, pages, fields, workflows, settings). Do NOT hand-write this object or invent GUIDs — first call get-form-scaffold (or get-form-scaffold-by-template) to get a valid starting design with every required ID already generated, edit the fields/pages/name you need, then pass the full resulting object here unchanged otherwise. Any field that is null in the scaffold (e.g. autocompleteAttribute, cssClass, tooltip, dataSourceFieldKey, folderId) is optional — omit it entirely rather than retyping it as null; only required fields and the ones you're actually setting need to be present. Fails if a form with the same ID already exists.",
  inputSchema,
  slices: ["create"],
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (formDesign) => {
    return executeVoidApiCall<ApiClient>((client) =>
      client.postForm(formDesign as FormDesign, CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(CreateFormTool);
