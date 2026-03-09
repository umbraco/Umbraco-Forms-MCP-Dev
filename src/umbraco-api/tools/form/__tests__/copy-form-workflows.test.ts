import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import copyFormWorkflowsTool from "../post/copy-form-workflows.js";
import updateFormTool from "../put/update-form.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Copy Workflows";
const SEND_EMAIL_WORKFLOW_ID = "e96badd7-05be-4978-b8d9-b3d733de70a5";

describe("copy-form-workflows", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should copy workflows from one form to another", async () => {
    const context = createMockRequestHandlerExtra();

    // Create source form with a workflow
    const source = await new FormBuilder().withName(`${TEST_NAME} Source`).create();
    await updateFormTool.handler(
      {
        id: source.getId(),
        workflows: {
          onSubmit: [
            {
              name: "Test Workflow",
              workflowTypeId: SEND_EMAIL_WORKFLOW_ID,
              settings: [
                { alias: "Email", value: "test@example.com" },
                { alias: "Subject", value: "Test" },
                { alias: "Message", value: "Test" },
              ],
            },
          ],
        },
        name: undefined,
        messageOnSubmit: undefined,
        submitLabel: undefined,
        fields: undefined,
        pages: undefined,
      },
      context
    );

    // Create destination form
    const dest = await new FormBuilder().withName(`${TEST_NAME} Dest`).create();

    const result = await copyFormWorkflowsTool.handler(
      {
        id: source.getId(),
        destinationId: dest.getId(),
      },
      context
    );

    expect(result.isError).toBeUndefined();

    // Verify workflows were copied
    const client = getApiClient<ApiClient>();
    const destForm = await client.getFormById(dest.getId()) as any;
    expect(destForm.formWorkflows.onSubmit).toHaveLength(1);
    expect(destForm.formWorkflows.onSubmit[0].workflowTypeName).toBe("Send email");
  });

  it("should return 0 workflows copied for form without workflows", async () => {
    const context = createMockRequestHandlerExtra();

    const source = await new FormBuilder().withName(`${TEST_NAME} Empty`).create();
    const dest = await new FormBuilder().withName(`${TEST_NAME} Dest2`).create();

    const result = await copyFormWorkflowsTool.handler(
      {
        id: source.getId(),
        destinationId: dest.getId(),
      },
      context
    );

    expect(result.isError).toBeUndefined();
  });

  it("should return error for non-existent source ID", async () => {
    const context = createMockRequestHandlerExtra();
    const dest = await new FormBuilder().withName(`${TEST_NAME} Dest3`).create();

    const result = await copyFormWorkflowsTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        destinationId: dest.getId(),
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
