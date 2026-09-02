import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
} from "./setup.js";
import getFormsAreReferencedTool from "../get/get-forms-are-referenced.js";

const TEST_NAME = "_Test Get Forms Are Referenced";

describe("get-forms-are-referenced", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return an empty subset when none of the given forms are referenced", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await getFormsAreReferencedTool.handler({ id: [builder.getId()] }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return an empty subset for an unknown form id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormsAreReferencedTool.handler(
      { id: ["00000000-0000-0000-0000-000000000000"] },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
