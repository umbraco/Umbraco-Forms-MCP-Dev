import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
  FormBuilder,
} from "./setup.js";
import copyFormWorkflowsTool from "../post/copy-form-workflows.js";
import getFormByIdTool from "../get/get-form-by-id.js";

const TEST_SOURCE_NAME = "_Test Copy Workflows Source";
const TEST_DEST_NAME = "_Test Copy Workflows Destination";

describe("copy-form-workflows", () => {
  setupTestEnvironment();

  let sourceBuilder: FormBuilder;
  let destBuilder: FormBuilder;

  afterEach(async () => {
    if (sourceBuilder) await sourceBuilder.delete();
    if (destBuilder) await destBuilder.delete();
  });

  it("should copy a workflow from the source form onto the destination form", async () => {
    const context = createMockRequestHandlerExtra();
    sourceBuilder = await new FormBuilder()
      .withName(TEST_SOURCE_NAME)
      .withOnSubmitWorkflow()
      .create();
    destBuilder = await new FormBuilder().withName(TEST_DEST_NAME).create();

    const workflowId = sourceBuilder.getDesign().formWorkflows.onSubmit[0].id;

    const result = await copyFormWorkflowsTool.handler(
      {
        id: sourceBuilder.getId(),
        destinationId: destBuilder.getId(),
        workflowIds: [workflowId],
      },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();

    const destDesignResult = await getFormByIdTool.handler(
      { id: destBuilder.getId(), applyDictionaryTranslations: undefined },
      context,
    );
    const destDesign = validateToolResponse(getFormByIdTool, destDesignResult);
    expect(destDesign.formWorkflows.onSubmit.length).toBe(1);
  });

  it("should return an error for a non-existent destination form id", async () => {
    const context = createMockRequestHandlerExtra();
    sourceBuilder = await new FormBuilder()
      .withName(TEST_SOURCE_NAME)
      .withOnSubmitWorkflow()
      .create();

    const workflowId = sourceBuilder.getDesign().formWorkflows.onSubmit[0].id;

    const result = await copyFormWorkflowsTool.handler(
      {
        id: sourceBuilder.getId(),
        destinationId: "00000000-0000-0000-0000-000000000000",
        workflowIds: [workflowId],
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
