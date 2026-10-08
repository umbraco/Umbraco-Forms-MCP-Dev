/**
 * The tool surface around the endpoints and parameters Forms 17.6 / 18.2 added.
 *
 * Each tool for a mid-line endpoint must be wrapped in withFormsFeature with
 * the right feature, so older releases get a message naming the version they
 * need instead of a bare 404 - forget it on one tool and nothing else fails.
 * And the new query parameters older releases silently ignore stay out of the
 * tools' inputs.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { FORMS_FEATURE_MIN_VERSIONS, type FormsFeature } from "../forms-version.js";
import listFormsTool from "../../form/get/list-forms.js";
import searchRecordsTool from "../../record/get/search-records.js";
import getRecordMetadataTool from "../../record/get/get-record-metadata.js";
import getRecordPageNumberTool from "../../record/get/get-record-page-number.js";

const TOOLS_DIR = path.resolve(process.cwd(), "src/umbraco-api/tools");

const GATED_TOOLS: Record<string, FormsFeature> = {
  "recycle-bin/get/get-recycle-bin-root.ts": "recycleBin",
  "recycle-bin/get/get-recycle-bin-children.ts": "recycleBin",
  "recycle-bin/get/get-form-restore-destination.ts": "recycleBin",
  "recycle-bin/get/get-folder-restore-destination.ts": "recycleBin",
  "recycle-bin/put/restore-form.ts": "recycleBin",
  "recycle-bin/put/restore-folder.ts": "recycleBin",
  "recycle-bin/delete/delete-form-permanently.ts": "recycleBin",
  "recycle-bin/delete/delete-folder-permanently.ts": "recycleBin",
  "recycle-bin/delete/empty-recycle-bin.ts": "recycleBin",
  "form/get/list-form-versions.ts": "formVersions",
  "form/get/get-form-version.ts": "formVersions",
  "form/post/rollback-form-version.ts": "formVersions",
  "form/put/set-form-version-prevent-cleanup.ts": "formVersions",
  "form/get/get-form-audit-log.ts": "formAuditLog",
  "record/post/create-record.ts": "recordWrite",
  "record/delete/delete-record.ts": "recordWrite",
};

describe("Forms 17.6 / 18.2 tool surface", () => {
  it.each(Object.entries(GATED_TOOLS))("%s is gated on %s", (file, feature) => {
    const source = readFileSync(path.join(TOOLS_DIR, file), "utf8");
    expect(source).toContain(`withFormsFeature("${feature}",`);
  });

  it("gates the new features at 17.6.0 and 18.2.0", () => {
    for (const feature of ["recycleBin", "formVersions", "formAuditLog", "recordWrite"] as const) {
      expect(FORMS_FEATURE_MIN_VERSIONS[feature]).toEqual({ 17: "17.6.0", 18: "18.2.0" });
    }
  });

  it("keeps list-forms' name filter out of its input (older releases ignore it)", () => {
    const keys = Object.keys(listFormsTool.inputSchema ?? {});
    expect(keys).toContain("cursor");
    expect(keys).not.toContain("filter");
  });

  it.each([
    ["search-records", searchRecordsTool],
    ["get-record-metadata", getRecordMetadataTool],
    ["get-record-page-number", getRecordPageNumberTool],
  ])("keeps IncludeAdditionalData and localTimeOffset out of %s", (_name, tool) => {
    const keys = Object.keys((tool as { inputSchema?: object }).inputSchema ?? {});
    expect(keys).toContain("formId");
    expect(keys).not.toContain("IncludeAdditionalData");
    expect(keys).not.toContain("localTimeOffset");
  });
});
