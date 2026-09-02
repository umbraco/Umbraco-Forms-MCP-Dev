import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PrevalueSourceBuilder,
} from "./setup.js";
import getPrevalueSourceAncestorsTool from "../get/get-prevalue-source-ancestors.js";

const TEST_NAME = "_Test Get Prevalue Source Ancestors";

describe("get-prevalue-source-ancestors", () => {
  setupTestEnvironment();

  let builder: PrevalueSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return ancestors for a root-level prevalue source", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    const result = await getPrevalueSourceAncestorsTool.handler(
      { descendantId: builder.getId() },
      context,
    );

    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should return an empty list of ancestors for the tree root", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPrevalueSourceAncestorsTool.handler(
      { descendantId: undefined },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
