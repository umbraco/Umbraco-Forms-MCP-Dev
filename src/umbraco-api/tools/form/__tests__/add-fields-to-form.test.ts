import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  FormBuilder,
  FormTestHelper,
} from "./setup.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import addFieldsToFormTool from "../put/add-fields-to-form.js";
import updateFormTool from "../put/update-form.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Add Fields";
const SHORT_ANSWER_ID = "3f92e01b-29e2-4a30-bf33-9df5580ed52c";
const LONG_ANSWER_ID = "023f09ac-1445-4bcb-b8fa-ab49f33bd046";

describe("add-fields-to-form", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should add fields to an empty form", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await addFieldsToFormTool.handler(
      {
        id: builder.getId(),
        fields: [
          { caption: "Name", fieldTypeId: SHORT_ANSWER_ID },
          { caption: "Email", fieldTypeId: SHORT_ANSWER_ID },
        ],
      },
      context
    );

    expect(result.isError).toBeUndefined();

    // Verify via API
    const client = getApiClient<ApiClient>();
    const form = await client.getFormById(builder.getId()) as any;
    const fields = form.pages[0].fieldSets[0].containers[0].fields;
    expect(fields).toHaveLength(2);
    expect(fields[0].caption).toBe("Name");
    expect(fields[1].caption).toBe("Email");
  });

  it("should append to existing fields", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new FormBuilder().withName(TEST_NAME).create();

    // First: set initial fields via update-form
    await updateFormTool.handler(
      {
        id: builder.getId(),
        fields: [
          { caption: "Name", fieldTypeId: SHORT_ANSWER_ID },
        ],
        name: undefined,
        messageOnSubmit: undefined,
        submitLabel: undefined,
        pages: undefined,
        workflows: undefined,
      },
      context
    );

    // Then: append more fields
    const result = await addFieldsToFormTool.handler(
      {
        id: builder.getId(),
        fields: [
          { caption: "Message", fieldTypeId: LONG_ANSWER_ID },
        ],
      },
      context
    );

    expect(result.isError).toBeUndefined();

    // Verify both fields exist
    const client = getApiClient<ApiClient>();
    const form = await client.getFormById(builder.getId()) as any;
    const fields = form.pages[0].fieldSets[0].containers[0].fields;
    expect(fields).toHaveLength(2);
    expect(fields[0].caption).toBe("Name");
    expect(fields[1].caption).toBe("Message");
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await addFieldsToFormTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        fields: [{ caption: "Name", fieldTypeId: SHORT_ANSWER_ID }],
      },
      context
    );

    expect(result.isError).toBe(true);
  });
});
