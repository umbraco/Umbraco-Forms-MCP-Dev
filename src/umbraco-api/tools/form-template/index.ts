/**
 * Form Template Tool Collection
 *
 * Tools for discovering the built-in form templates used to scaffold new forms.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listFormTemplatesTool from "./get/list-form-templates.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "form-template",
    displayName: "Form Template",
    description: "Discover built-in Umbraco Forms templates used to scaffold new forms.",
  },
  tools: () => [listFormTemplatesTool],
};

export default collection;
