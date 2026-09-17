import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  getStructuredContent,
  FormTestHelper,
} from "./setup.js";
import createFormTool from "../post/create-form.js";
import getFormScaffoldTool from "../get/get-form-scaffold.js";
import type { FormDesign } from "../../../api/generated/umbracoFormsManagementApi.js";

const TEST_NAME = "_Test Create Form";

describe("create-form", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should create a form from a scaffolded design", async () => {
    const context = createMockRequestHandlerExtra();

    // create-form generates any GUIDs that are left out, but a scaffold is
    // still a valid starting point — this covers the full-design path.
    const scaffoldResult = await getFormScaffoldTool.handler(context);
    const scaffold = getStructuredContent(scaffoldResult) as unknown as FormDesign;

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
    const scaffold = getStructuredContent(scaffoldResult) as unknown as FormDesign;
    const design = { ...scaffold, name: TEST_NAME };

    await createFormTool.handler(design as any, context);
    const result = await createFormTool.handler(design as any, context);

    expect(result.isError).toBe(true);
  });
});
