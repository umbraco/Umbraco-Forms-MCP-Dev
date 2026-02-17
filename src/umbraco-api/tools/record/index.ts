import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import { FormsAuthorizationPolicies, type FormsUserContext } from "../../../auth/index.js";
import listRecordsTool from "./get/list-records.js";
import getRecordMetadataTool from "./get/get-record-metadata.js";
import getRecordAuditTrailTool from "./get/get-record-audit-trail.js";
import getRecordWorkflowAuditTrailTool from "./get/get-record-workflow-audit-trail.js";
import getRecordPageNumberTool from "./get/get-record-page-number.js";
import listRecordSetActionsTool from "./get/list-record-set-actions.js";
import updateRecordTool from "./put/update-record.js";
import executeRecordActionTool from "./post/execute-record-action.js";
import retryRecordWorkflowTool from "./post/retry-record-workflow.js";
import deleteRecordsTool from "./delete/delete-records.js";

const readTools = [
  listRecordsTool,
  getRecordMetadataTool,
  getRecordAuditTrailTool,
  getRecordWorkflowAuditTrailTool,
  getRecordPageNumberTool,
  listRecordSetActionsTool,
];

const editTools = [
  updateRecordTool,
  executeRecordActionTool,
];

const deleteTools = [
  deleteRecordsTool,
];

const workflowTools = [
  retryRecordWorkflowTool,
];

const collection: ToolCollectionExport<FormsUserContext> = {
  metadata: {
    name: "record",
    displayName: "Record Tools",
    description:
      "Tools for managing form submission records - list, filter, update, audit, and execute bulk actions on form entries",
  },
  tools: (user: FormsUserContext) => [
    ...(FormsAuthorizationPolicies.ViewEntries(user) ? readTools : []),
    ...(FormsAuthorizationPolicies.EditEntries(user) ? editTools : []),
    ...(FormsAuthorizationPolicies.DeleteEntries(user) ? deleteTools : []),
    ...(FormsAuthorizationPolicies.ManageWorkflows(user) ? workflowTools : []),
  ],
};

export default collection;
