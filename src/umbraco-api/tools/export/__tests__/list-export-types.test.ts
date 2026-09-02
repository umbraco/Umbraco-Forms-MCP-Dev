import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  ExportTestFormHelper,
} from "./setup.js";
import listExportTypesTool from "../get/list-export-types.js";

describe("list-export-types", () => {
  setupTestEnvironment();

  let formId: string;

  beforeAll(async () => {
    formId = await ExportTestFormHelper.createTestForm();
  });

  afterAll(async () => {
    await ExportTestFormHelper.deleteTestForm(formId);
  });

  it("should list export types available for a form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listExportTypesTool.handler({ formId }, context);

    expect(createSnapshotResult(result, formId)).toMatchSnapshot();
  });
});
