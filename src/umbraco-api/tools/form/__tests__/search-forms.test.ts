import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
} from "./setup.js";
import searchFormsTool from "../get/search-forms.js";

const TEST_NAME = "_Test Search Forms Unique Query";

describe("search-forms", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should find a form by a partial name match", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await searchFormsTool.handler(
      { query: "Search Forms Unique Query" },
      context,
    );

    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should return an empty result set for a query that matches nothing", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await searchFormsTool.handler(
      { query: "_no-form-should-ever-match-this-query_" },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
