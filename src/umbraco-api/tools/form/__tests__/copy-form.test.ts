import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import copyFormTool from "../post/copy-form.js";

const TEST_NAME = "_Test Copy Form Source";
const TEST_COPY_NAME = "_Test Copy Form Copy";

describe("copy-form", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
    await FormTestHelper.cleanup(TEST_COPY_NAME);
  });

  it("should duplicate a form under a new name", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await copyFormTool.handler(
      {
        id: builder.getId(),
        newName: TEST_COPY_NAME,
        copyWorkflows: false,
        copyToFolderId: undefined,
      },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();

    const found = await FormTestHelper.findByName(TEST_COPY_NAME);
    expect(found).toBeDefined();
    expect(found?.id).not.toBe(builder.getId());
  });

  it("should return an error for a non-existent source form id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await copyFormTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        newName: TEST_COPY_NAME,
        copyWorkflows: false,
        copyToFolderId: undefined,
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
