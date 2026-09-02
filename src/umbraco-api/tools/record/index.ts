/**
 * Record Tool Collection
 *
 * Tools for searching, updating, and managing submitted form entries
 * (records), including audit trails, workflow retries, and bulk actions.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import searchRecordsTool from "./get/search-records.js";
import getRecordAuditTrailTool from "./get/get-record-audit-trail.js";
import getRecordWorkflowAuditTrailTool from "./get/get-record-workflow-audit-trail.js";
import getRecordMetadataTool from "./get/get-record-metadata.js";
import getRecordPageNumberTool from "./get/get-record-page-number.js";
import getRecordSetActionsTool from "./get/get-record-set-actions.js";
import updateRecordTool from "./put/update-record.js";
import retryRecordWorkflowTool from "./post/retry-record-workflow.js";
import executeRecordActionTool from "./post/execute-record-action.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "record",
    displayName: "Records",
    description:
      "Search, update, and manage submitted form entries (records): audit trails, workflow retries, and bulk record actions.",
  },
  tools: () => [
    searchRecordsTool,
    getRecordAuditTrailTool,
    getRecordWorkflowAuditTrailTool,
    getRecordMetadataTool,
    getRecordPageNumberTool,
    getRecordSetActionsTool,
    updateRecordTool,
    retryRecordWorkflowTool,
    executeRecordActionTool,
  ],
};

export default collection;
