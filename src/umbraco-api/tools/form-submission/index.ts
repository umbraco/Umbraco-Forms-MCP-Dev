import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getFormDefinitionTool from "./get/get-form-definition.js";
import submitFormEntryTool from "./post/submit-form-entry.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "form-submission",
    displayName: "Form Submission Tools",
    description:
      "Tools for the Umbraco Forms Delivery API - get form definitions and submit form entries. Requires UMBRACO_FORMS_API_KEY to be configured.",
  },
  tools: () => [
    getFormDefinitionTool,
    submitFormEntryTool,
  ],
};

export default collection;
