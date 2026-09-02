import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
} from "./setup.js";
import getFormItemsByIdsTool from "../get/get-form-items-by-ids.js";

const TEST_NAME = "_Test Get Form Items By Ids";

describe("get-form-items-by-ids", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should resolve a batch of form ids to their basic info", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await getFormItemsByIdsTool.handler({ id: [builder.getId()] }, context);

    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should return an empty items array for an unknown id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormItemsByIdsTool.handler(
      { id: ["00000000-0000-0000-0000-000000000000"] },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
