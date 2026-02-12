import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceBuilder,
} from "./setup.js";
import deletePrevalueSourceTool from "../delete/delete-prevalue-source.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Delete Prevalue Source";

describe("delete-prevalue-source", () => {
  setupTestEnvironment();

  let prevalueSourceTypeId: string;

  beforeAll(async () => {
    const client = getApiClient<ApiClient>();
    const response = await client.getPrevalueSourceType();
    const typeList = (response as any).data || response;
    if (!Array.isArray(typeList) || typeList.length === 0) {
      throw new Error("No prevalue source types found");
    }
    prevalueSourceTypeId = typeList[0].id;
  });

  it("should delete a prevalue source", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new PrevalueSourceBuilder()
      .withName(TEST_NAME)
      .withFieldPreValueSourceTypeId(prevalueSourceTypeId)
      .create();

    const result = await deletePrevalueSourceTool.handler(
      { id: builder.getId() },
      context
    );

    expect(result.isError).toBeUndefined();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await deletePrevalueSourceTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );
    expect(result.isError).toBe(true);
  });
});
