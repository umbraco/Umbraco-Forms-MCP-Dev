import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "./setup.js";
import updatePrevalueSourceTool from "../put/update-prevalue-source.js";

const TEST_NAME = "_Test Update Prevalue Source";
const TEST_NAME_UPDATED = "_Test Update Prevalue Source Updated";

describe("update-prevalue-source", () => {
  setupTestEnvironment();

  let builder: PrevalueSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
    await PrevalueSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should update a prevalue source's name", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    const result = await updatePrevalueSourceTool.handler(
      {
        id: builder.getId(),
        name: TEST_NAME_UPDATED,
        fieldPreValueSourceTypeId: undefined,
        settings: undefined,
        cachePrevaluesFor: undefined,
      },
      context,
    );

    expect(result.isError).toBeFalsy();

    const updated = await PrevalueSourceTestHelper.findByName(TEST_NAME_UPDATED);
    expect(updated).toBeDefined();
    expect(updated?.id).toBe(builder.getId());
  });

  it("should return error for non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updatePrevalueSourceTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        name: TEST_NAME_UPDATED,
        fieldPreValueSourceTypeId: undefined,
        settings: undefined,
        cachePrevaluesFor: undefined,
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
