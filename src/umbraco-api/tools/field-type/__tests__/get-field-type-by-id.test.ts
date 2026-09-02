import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getFieldTypeByIdTool from "../get/get-field-type-by-id.js";
import listFieldTypesTool from "../get/list-field-types.js";

const TEST_BOGUS_ID = "00000000-0000-0000-0000-000000000000";

describe("get-field-type-by-id", () => {
  setupTestEnvironment();

  it("should return a field type by id", async () => {
    const context = createMockRequestHandlerExtra();

    const listResult = await listFieldTypesTool.handler({}, context);
    const items = (listResult.structuredContent as { items: { id: string }[] }).items;
    const fieldTypeId = items[0].id;

    const result = await getFieldTypeByIdTool.handler({ id: fieldTypeId }, context);

    expect(createSnapshotResult(result, fieldTypeId)).toMatchSnapshot();
  });

  it("should return error for non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFieldTypeByIdTool.handler({ id: TEST_BOGUS_ID }, context);

    expect(result.isError).toBe(true);
  });
});
