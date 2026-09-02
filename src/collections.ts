/**
 * Tool Collections Export
 *
 * Lightweight entry point for in-process chaining.
 * Import this from another MCP server to chain tools without spawning a process.
 *
 * @example
 * ```typescript
 * import { collections, allModes, allModeNames, allSliceNames } from "my-umbraco-mcp/collections";
 *
 * manager.registerServer({
 *   transport: "in-process",
 *   name: "my-addon",
 *   collections,
 *   modeRegistry: allModes,
 *   allModeNames,
 *   allSliceNames,
 * });
 * ```
 */

import umbracoServerCollection from "./umbraco-api/tools/umbraco-server/index.js";
import acceptanceTestsCollection from "./umbraco-api/tools/acceptance-tests/index.js";
import analyticsCollection from "./umbraco-api/tools/analytics/index.js";
import configCollection from "./umbraco-api/tools/config/index.js";
import dataSourceCollection from "./umbraco-api/tools/data-source/index.js";
import dataSourceTypeCollection from "./umbraco-api/tools/data-source-type/index.js";
import emailTemplateCollection from "./umbraco-api/tools/email-template/index.js";
import exportCollection from "./umbraco-api/tools/export/index.js";
import fieldTypeCollection from "./umbraco-api/tools/field-type/index.js";
import folderCollection from "./umbraco-api/tools/folder/index.js";
import formCollection from "./umbraco-api/tools/form/index.js";
import formTemplateCollection from "./umbraco-api/tools/form-template/index.js";
import licensingCollection from "./umbraco-api/tools/licensing/index.js";
import mediaCollection from "./umbraco-api/tools/media/index.js";
import memberCollection from "./umbraco-api/tools/member/index.js";
import pickerCollection from "./umbraco-api/tools/picker/index.js";
import prevalueSourceCollection from "./umbraco-api/tools/prevalue-source/index.js";
import prevalueSourceTypeCollection from "./umbraco-api/tools/prevalue-source-type/index.js";
import recordCollection from "./umbraco-api/tools/record/index.js";
import securityCollection from "./umbraco-api/tools/security/index.js";
import themeCollection from "./umbraco-api/tools/theme/index.js";
import updatesCollection from "./umbraco-api/tools/updates/index.js";
import workflowTypeCollection from "./umbraco-api/tools/workflow-type/index.js";

export const collections = [
  umbracoServerCollection,
  acceptanceTestsCollection,
  analyticsCollection,
  configCollection,
  dataSourceCollection,
  dataSourceTypeCollection,
  emailTemplateCollection,
  exportCollection,
  fieldTypeCollection,
  folderCollection,
  formCollection,
  formTemplateCollection,
  licensingCollection,
  mediaCollection,
  memberCollection,
  pickerCollection,
  prevalueSourceCollection,
  prevalueSourceTypeCollection,
  recordCollection,
  securityCollection,
  themeCollection,
  updatesCollection,
  workflowTypeCollection,
];

export { allModes, allModeNames } from "./config/mode-registry.js";
export { allSliceNames } from "./config/slice-registry.js";
