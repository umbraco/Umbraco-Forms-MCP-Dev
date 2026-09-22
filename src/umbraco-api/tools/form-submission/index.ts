import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import type { FormsUserContext } from "../../../auth/index.js";
import getFormDefinitionTool from "./get/get-form-definition.js";
import submitFormEntryTool from "./post/submit-form-entry.js";

const collection: ToolCollectionExport<FormsUserContext> = {
  metadata: {
    name: "form-submission",
    displayName: "Form Submission Tools",
    description:
      "Tools for the Umbraco Forms Delivery API - get form definitions and submit form entries. Requires UMBRACO_FORMS_API_KEY to be configured.",
  },
  tools: (_user: FormsUserContext) => [
    getFormDefinitionTool,
    submitFormEntryTool,
  ],
};

export default collection;
