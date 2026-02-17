import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  RecordBuilder,
  RecordTestHelper,
} from "./setup.js";
import deleteRecordsTool from "../delete/delete-records.js";

const TEST_NAME = "_Test Delete Records";

describe("delete-records", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await RecordTestHelper.cleanup(TEST_NAME);
  });

  it("should delete a record", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new RecordBuilder()
      .withFormName(TEST_NAME)
      .withFieldValue("Delete Me")
      .create();

    const result = await deleteRecordsTool.handler(
      {
        formId: builder.getFormId(),
        recordKeys: [builder.getRecordId()],
      },
      context
    );

    expect(result.isError).toBeFalsy();
  });

  it("should return error for non-existent form ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await deleteRecordsTool.handler(
      {
        formId: "00000000-0000-0000-0000-000000000000",
        recordKeys: ["00000000-0000-0000-0000-000000000000"],
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
