import { setupTestEnvironment, RecordTestFormHelper } from "../setup.js";
import { getUmbracoFormsManagementAPI } from "../../../../api/generated/umbracoFormsManagementApi.js";
import { CAPTURE_RAW_HTTP_RESPONSE, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import type { FormDesign } from "../../../../api/generated/umbracoFormsManagementApi.js";

describe("RecordTestFormHelper", () => {
  setupTestEnvironment();

  let formId: string | undefined;

  afterEach(async () => {
    if (formId) {
      await RecordTestFormHelper.deleteTestForm(formId);
      formId = undefined;
    }
  });

  it("should create and delete a temporary test form", async () => {
    formId = await RecordTestFormHelper.createTestForm();

    expect(formId).toBeDefined();
    expect(typeof formId).toBe("string");

    const client = getUmbracoFormsManagementAPI();
    const getResponse = (await client.getFormById(
      formId,
      undefined,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FormDesign>;

    expect(getResponse.status).toBe(200);
    expect(getResponse.data.name).toBe("_Test Record Form");

    await RecordTestFormHelper.deleteTestForm(formId);

    const getAfterDeleteResponse = (await client.getFormById(
      formId,
      undefined,
      CAPTURE_RAW_HTTP_RESPONSE,
    )) as HttpResponse<FormDesign>;

    expect(getAfterDeleteResponse.status).toBe(404);

    formId = undefined;
  });
});
