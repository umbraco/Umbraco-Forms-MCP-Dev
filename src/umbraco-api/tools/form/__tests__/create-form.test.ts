import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormTestHelper,
} from "./setup.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import createFormTool from "../post/create-form.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Create Form";
const SHORT_ANSWER_ID = "3f92e01b-29e2-4a30-bf33-9df5580ed52c";
const SEND_EMAIL_WORKFLOW_ID = "e96badd7-05be-4978-b8d9-b3d733de70a5";

describe("create-form", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should create a new form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createFormTool.handler(
      {
        name: TEST_NAME,
        folderId: undefined,
        fields: undefined,
        workflows: undefined,
      },
      context
    );

    expect(FormTestHelper.normalizeIds(result)).toMatchSnapshot();

    // Verify the form was actually created
    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found!.name).toBe(TEST_NAME);
  });

  it("should create a form with fields", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createFormTool.handler(
      {
        name: TEST_NAME,
        folderId: undefined,
        fields: [
          { caption: "Full Name", fieldTypeId: SHORT_ANSWER_ID, required: true },
          { caption: "Email", fieldTypeId: SHORT_ANSWER_ID },
        ],
        workflows: undefined,
      },
      context
    );

    expect(result.isError).toBeUndefined();

    // Verify fields were created
    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();

    const client = getApiClient<ApiClient>();
    const form = await client.getFormById(found!.id) as any;
    const fields = form.pages[0].fieldSets[0].containers[0].fields;
    expect(fields).toHaveLength(2);
    expect(fields[0].caption).toBe("Full Name");
    expect(fields[0].mandatory).toBe(true);
    expect(fields[1].caption).toBe("Email");
  });

  it("should create a form with workflows", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createFormTool.handler(
      {
        name: TEST_NAME,
        folderId: undefined,
        fields: undefined,
        workflows: {
          onSubmit: [
            {
              name: "Notify Admin",
              workflowTypeId: SEND_EMAIL_WORKFLOW_ID,
              settings: [
                { alias: "Email", value: "admin@example.com" },
                { alias: "Subject", value: "New submission" },
                { alias: "Message", value: "A form was submitted." },
              ],
            },
          ],
        },
      },
      context
    );

    expect(result.isError).toBeUndefined();

    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();

    const client = getApiClient<ApiClient>();
    const form = await client.getFormById(found!.id) as any;
    expect(form.formWorkflows.onSubmit).toHaveLength(1);
    expect(form.formWorkflows.onSubmit[0].name).toBe("Notify Admin");
  });

  it("should create a form with fields and workflows", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createFormTool.handler(
      {
        name: TEST_NAME,
        folderId: undefined,
        fields: [
          { caption: "Name", fieldTypeId: SHORT_ANSWER_ID },
        ],
        workflows: {
          onSubmit: [
            {
              name: "Email Notification",
              workflowTypeId: SEND_EMAIL_WORKFLOW_ID,
              settings: [
                { alias: "Email", value: "test@example.com" },
                { alias: "Subject", value: "Test" },
                { alias: "Message", value: "Test" },
              ],
            },
          ],
        },
      },
      context
    );

    expect(result.isError).toBeUndefined();

    const found = await FormTestHelper.findByName(TEST_NAME);
    const client = getApiClient<ApiClient>();
    const form = await client.getFormById(found!.id) as any;

    // Verify both fields and workflows
    const fields = form.pages[0].fieldSets[0].containers[0].fields;
    expect(fields).toHaveLength(1);
    expect(fields[0].caption).toBe("Name");
    expect(form.formWorkflows.onSubmit).toHaveLength(1);
  });
});
