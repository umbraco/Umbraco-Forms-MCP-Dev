import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
} from "./setup.js";
import getFormHasRelationsTool from "../get/get-form-has-relations.js";

const TEST_NAME = "_Test Get Form Has Relations";

describe("get-form-has-relations", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return false for a newly created form with no relations", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await getFormHasRelationsTool.handler({ id: builder.getId() }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return an error for a non-existent form id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormHasRelationsTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
