import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  FormTestHelper,
} from "./setup.js";
import createFormTool from "../post/create-form.js";
import getFormScaffoldTool from "../get/get-form-scaffold.js";

const TEST_NAME = "_Test Create Form";

describe("create-form", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should create a form from a scaffolded design", async () => {
    const context = createMockRequestHandlerExtra();

    // Must start from a real scaffold — the design carries client-supplied
    // GUIDs (form ID, page IDs, etc.) that create-form requires.
    const scaffoldResult = await getFormScaffoldTool.handler(context);
    const scaffold = validateToolResponse(getFormScaffoldTool, scaffoldResult);

    const design = { ...scaffold, name: TEST_NAME };

    const result = await createFormTool.handler(design as any, context);

    expect(createSnapshotResult(result, design.id)).toMatchSnapshot();

    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.id).toBe(design.id);
  });

  it("should return an error when creating a form with a duplicate id", async () => {
    const context = createMockRequestHandlerExtra();

    const scaffoldResult = await getFormScaffoldTool.handler(context);
    const scaffold = validateToolResponse(getFormScaffoldTool, scaffoldResult);
    const design = { ...scaffold, name: TEST_NAME };

    await createFormTool.handler(design as any, context);
    const result = await createFormTool.handler(design as any, context);

    expect(result.isError).toBe(true);
  });
});
