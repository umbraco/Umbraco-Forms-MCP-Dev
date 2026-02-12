import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listRecordsTool from "./get/list-records.js";
import getRecordMetadataTool from "./get/get-record-metadata.js";
import getRecordAuditTrailTool from "./get/get-record-audit-trail.js";
import getRecordWorkflowAuditTrailTool from "./get/get-record-workflow-audit-trail.js";
import getRecordPageNumberTool from "./get/get-record-page-number.js";
import listRecordSetActionsTool from "./get/list-record-set-actions.js";
import updateRecordTool from "./put/update-record.js";
import executeRecordActionTool from "./post/execute-record-action.js";
import retryRecordWorkflowTool from "./post/retry-record-workflow.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "record",
    displayName: "Record Tools",
    description:
      "Tools for managing form submission records - list, filter, update, audit, and execute bulk actions on form entries",
  },
  tools: () => [
    listRecordsTool,
    getRecordMetadataTool,
    getRecordAuditTrailTool,
    getRecordWorkflowAuditTrailTool,
    getRecordPageNumberTool,
    listRecordSetActionsTool,
    updateRecordTool,
    executeRecordActionTool,
    retryRecordWorkflowTool,
  ],
};

export default collection;
