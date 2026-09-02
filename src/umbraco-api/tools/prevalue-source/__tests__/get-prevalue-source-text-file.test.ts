import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceBuilder,
} from "./setup.js";
import getPrevalueSourceTextFileTool from "../get/get-prevalue-source-text-file.js";

const TEST_NAME = "_Test Get Prevalue Source Text File";

// NOTE: The happy path for this tool requires a prevalue source backed by the
// "getValuesFromTextFile" provider with an actual uploaded text file — there
// is no API to upload that file's content from this test suite, so only the
// error paths are covered here. See PrevalueSourceBuilder's doc comment for
// why the default provider ("dataSource") has no file at all.
describe("get-prevalue-source-text-file", () => {
  setupTestEnvironment();

  let builder: PrevalueSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return error for non-existent prevalue source id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPrevalueSourceTextFileTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", fileName: "does-not-exist.csv" },
      context,
    );

    expect(result.isError).toBe(true);
  });

  it("should return error for non-existent file on an existing prevalue source", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    const result = await getPrevalueSourceTextFileTool.handler(
      { id: builder.getId(), fileName: "does-not-exist.csv" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
