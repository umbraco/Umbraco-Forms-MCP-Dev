import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
} from "./setup.js";
import getFormRelationsTool from "../get/get-form-relations.js";

const TEST_NAME = "_Test Get Form Relations";

describe("get-form-relations", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return an empty relations list for a form with no relations", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await getFormRelationsTool.handler({ id: builder.getId() }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return an error for a non-existent form id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormRelationsTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
