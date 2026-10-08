import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  RecordTestFormHelper,
} from "./setup.js";
import { RecordEntryHelper } from "./helpers/record-entry-helper.js";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import getRecordAuditTrailTool from "../get/get-record-audit-trail.js";

describe("get-record-audit-trail", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await RecordTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await RecordTestFormHelper.deleteTestForm(formId);
  });

  it("should list the changes made to an entry", async () => {
    const context = createMockRequestHandlerExtra();
    const [fieldId] = await RecordTestFormHelper.getFieldIds(formId);
    const recordId = await RecordEntryHelper.createEntry(formId, fieldId, "true");
    await getUmbracoFormsManagementAPI().putFormByFormIdRecordByRecordId(formId, recordId, [
      { fieldId, values: ["true"] },
    ]);

    const result = await getRecordAuditTrailTool.handler({ formId, recordId }, context);

    const data = validateToolResponse(getRecordAuditTrailTool, result);
    expect(data.items.length).toBeGreaterThan(0);
  });

  it("should return error for a record that doesn't exist", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getRecordAuditTrailTool.handler(
      { formId, recordId: "00000000-0000-0000-0000-000000000001" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
