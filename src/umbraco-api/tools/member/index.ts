/**
 * Member Tool Collection
 *
 * Read-only tools for inspecting Umbraco member form-submission summaries
 * and the member properties that can be linked to form fields.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getMemberFormSummariesTool from "./get/get-member-form-summaries.js";
import getMemberLinkablePropertiesTool from "./get/get-member-linkable-properties.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "member",
    displayName: "Member",
    description: "Read-only lookups of an Umbraco member's form submission summaries and linkable member properties.",
  },
  tools: () => [getMemberFormSummariesTool, getMemberLinkablePropertiesTool],
};

export default collection;
