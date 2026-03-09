import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import updateFormTool from "../put/update-form.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Update Form";
const SHORT_ANSWER_ID = "3f92e01b-29e2-4a30-bf33-9df5580ed52c";
const LONG_ANSWER_ID = "023f09ac-1445-4bcb-b8fa-ab49f33bd046";
const SEND_EMAIL_WORKFLOW_ID = "e96badd7-05be-4978-b8d9-b3d733de70a5";
const SLACK_WORKFLOW_ID = "bc52ab28-d3ff-42ee-af75-a5d49be83040";

describe("update-form", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should update form properties", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await updateFormTool.handler(
      {
        id: builder.getId(),
        name: `${TEST_NAME} Updated`,
        messageOnSubmit: "Thanks!",
        submitLabel: "Send",
        fields: undefined,
        pages: undefined,
        workflows: undefined,
      },
      context
    );

    expect(result.isError).toBeUndefined();

    // Verify changes were persisted
    const client = getApiClient<ApiClient>();
    const form = await client.getFormById(builder.getId()) as any;
    expect(form.name).toBe(`${TEST_NAME} Updated`);
    expect(form.messageOnSubmit).toBe("Thanks!");
    expect(form.submitLabel).toBe("Send");
  });

  it("should replace fields on page 1", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await updateFormTool.handler(
      {
        id: builder.getId(),
        fields: [
          { caption: "First Name", fieldTypeId: SHORT_ANSWER_ID, required: true },
          { caption: "Message", fieldTypeId: LONG_ANSWER_ID },
        ],
        name: undefined,
        messageOnSubmit: undefined,
        submitLabel: undefined,
        pages: undefined,
        workflows: undefined,
      },
      context
    );

    expect(result.isError).toBeUndefined();

    const client = getApiClient<ApiClient>();
    const form = await client.getFormById(builder.getId()) as any;
    const fields = form.pages[0].fieldSets[0].containers[0].fields;
    expect(fields).toHaveLength(2);
    expect(fields[0].caption).toBe("First Name");
    expect(fields[0].mandatory).toBe(true);
    expect(fields[1].caption).toBe("Message");
  });

  it("should preserve field IDs when updating by alias", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    // First: add fields
    await updateFormTool.handler(
      {
        id: builder.getId(),
        fields: [
          { caption: "Email", alias: "email", fieldTypeId: SHORT_ANSWER_ID },
        ],
        name: undefined,
        messageOnSubmit: undefined,
        submitLabel: undefined,
        pages: undefined,
        workflows: undefined,
      },
      context
    );

    const client = getApiClient<ApiClient>();
    const formBefore = await client.getFormById(builder.getId()) as any;
    const fieldIdBefore = formBefore.pages[0].fieldSets[0].containers[0].fields[0].id;

    // Second: update with same alias — ID should be preserved
    await updateFormTool.handler(
      {
        id: builder.getId(),
        fields: [
          { caption: "Email Address", alias: "email", fieldTypeId: SHORT_ANSWER_ID, required: true },
        ],
        name: undefined,
        messageOnSubmit: undefined,
        submitLabel: undefined,
        pages: undefined,
        workflows: undefined,
      },
      context
    );

    const formAfter = await client.getFormById(builder.getId()) as any;
    const fieldAfter = formAfter.pages[0].fieldSets[0].containers[0].fields[0];
    expect(fieldAfter.id).toBe(fieldIdBefore);
    expect(fieldAfter.caption).toBe("Email Address");
    expect(fieldAfter.mandatory).toBe(true);
  });

  it("should replace all pages", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await updateFormTool.handler(
      {
        id: builder.getId(),
        pages: [
          {
            caption: "Page 1",
            fields: [{ caption: "Name", fieldTypeId: SHORT_ANSWER_ID }],
          },
          {
            caption: "Page 2",
            fields: [{ caption: "Comments", fieldTypeId: LONG_ANSWER_ID }],
          },
        ],
        name: undefined,
        messageOnSubmit: undefined,
        submitLabel: undefined,
        fields: undefined,
        workflows: undefined,
      },
      context
    );

    expect(result.isError).toBeUndefined();

    const client = getApiClient<ApiClient>();
    const form = await client.getFormById(builder.getId()) as any;
    expect(form.pages).toHaveLength(2);
    expect(form.pages[0].caption).toBe("Page 1");
    expect(form.pages[1].caption).toBe("Page 2");
    expect(form.pages[0].fieldSets[0].containers[0].fields[0].caption).toBe("Name");
    expect(form.pages[1].fieldSets[0].containers[0].fields[0].caption).toBe("Comments");
  });

  it("should add workflows", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await updateFormTool.handler(
      {
        id: builder.getId(),
        workflows: {
          onSubmit: [
            {
              name: "Test Email",
              workflowTypeId: SEND_EMAIL_WORKFLOW_ID,
              settings: [
                { alias: "Email", value: "test@example.com" },
                { alias: "Subject", value: "Test" },
                { alias: "Message", value: "Test message" },
              ],
            },
          ],
          onApprove: [
            {
              name: "Test Slack",
              workflowTypeId: SLACK_WORKFLOW_ID,
              settings: [
                { alias: "WebhookUrl", value: "https://hooks.slack.com/test" },
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

    expect(result.isError).toBeUndefined();

    const client = getApiClient<ApiClient>();
    const form = await client.getFormById(builder.getId()) as any;
    expect(form.formWorkflows.onSubmit).toHaveLength(1);
    expect(form.formWorkflows.onSubmit[0].name).toBe("Test Email");
    expect(form.formWorkflows.onApprove).toHaveLength(1);
    expect(form.formWorkflows.onApprove[0].name).toBe("Test Slack");
  });

  it("should reject fields and pages together", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await updateFormTool.handler(
      {
        id: builder.getId(),
        fields: [{ caption: "Name", fieldTypeId: SHORT_ANSWER_ID }],
        pages: [{ fields: [{ caption: "Name", fieldTypeId: SHORT_ANSWER_ID }] }],
        name: undefined,
        messageOnSubmit: undefined,
        submitLabel: undefined,
        workflows: undefined,
      },
      context
    );

    expect(result.isError).toBe(true);
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await updateFormTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        name: "Nope",
        messageOnSubmit: undefined,
        submitLabel: undefined,
        fields: undefined,
        pages: undefined,
        workflows: undefined,
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
