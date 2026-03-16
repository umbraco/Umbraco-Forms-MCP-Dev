/**
 * Tool Collections Export
 *
 * Lightweight entry point for in-process chaining.
 * Import this from another MCP server to chain Forms tools without spawning a process.
 *
 * @example
 * ```typescript
 * import { collections, allModes, allModeNames, allSliceNames } from "umbraco-forms-mcp-dev/collections";
 *
 * manager.registerServer({
 *   transport: "in-process",
 *   name: "forms",
 *   collections,
 *   modeRegistry: allModes,
 *   allModeNames,
 *   allSliceNames,
 * });
 * ```
 */

import chainedCollection from "./umbraco-api/tools/chained/index.js";
import dataSourceCollection from "./umbraco-api/tools/data-source/index.js";
import dataSourceTypeCollection from "./umbraco-api/tools/data-source-type/index.js";
import fieldTypeCollection from "./umbraco-api/tools/field-type/index.js";
import folderCollection from "./umbraco-api/tools/folder/index.js";
import formCollection from "./umbraco-api/tools/form/index.js";
import formSubmissionCollection from "./umbraco-api/tools/form-submission/index.js";
import prevalueSourceCollection from "./umbraco-api/tools/prevalue-source/index.js";
import prevalueSourceTypeCollection from "./umbraco-api/tools/prevalue-source-type/index.js";
import recordCollection from "./umbraco-api/tools/record/index.js";
import workflowTypeCollection from "./umbraco-api/tools/workflow-type/index.js";

export const collections = [
  chainedCollection,
  dataSourceCollection,
  dataSourceTypeCollection,
  fieldTypeCollection,
  folderCollection,
  formCollection,
  formSubmissionCollection,
  prevalueSourceCollection,
  prevalueSourceTypeCollection,
  recordCollection,
  workflowTypeCollection,
];

export { allModes, allModeNames } from "./config/mode-registry.js";
export { allSliceNames } from "./config/slice-registry.js";
