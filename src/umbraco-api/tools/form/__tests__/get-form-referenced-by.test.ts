import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
} from "./setup.js";
import getFormReferencedByTool from "../get/get-form-referenced-by.js";

const TEST_NAME = "_Test Get Form Referenced By";

describe("get-form-referenced-by", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return an empty referenced-by list for a form referenced by nothing", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await getFormReferencedByTool.handler({ id: builder.getId() }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return an error for a non-existent form id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormReferencedByTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
