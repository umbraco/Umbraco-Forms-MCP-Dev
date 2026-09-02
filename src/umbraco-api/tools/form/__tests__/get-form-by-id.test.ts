import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import getFormByIdTool from "../get/get-form-by-id.js";

const TEST_NAME = "_Test Get Form By Id";

describe("get-form-by-id", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return the full form design by id", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await getFormByIdTool.handler(
      { id: builder.getId(), applyDictionaryTranslations: undefined },
      context,
    );

    // A full form design carries dozens of client-generated GUIDs at every
    // depth (page/fieldset/field/workflow ids, plus "path" and "nodeId")
    // that vary on every run — normalize the whole structuredContent rather
    // than relying on createSnapshotResult's single top-level id swap.
    const normalized = {
      ...result,
      structuredContent: FormTestHelper.normalizeIds(result.structuredContent),
    };

    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });

  it("should return an error for a non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormByIdTool.handler(
      { id: "00000000-0000-0000-0000-000000000000", applyDictionaryTranslations: undefined },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
