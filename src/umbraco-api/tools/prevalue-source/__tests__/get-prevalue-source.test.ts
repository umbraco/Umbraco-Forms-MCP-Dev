import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "./setup.js";
import getPrevalueSourceTool from "../get/get-prevalue-source.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Get Prevalue Source";

describe("get-prevalue-source", () => {
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

  afterEach(async () => {
    await PrevalueSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should return prevalue source by ID", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new PrevalueSourceBuilder()
      .withName(TEST_NAME)
      .withFieldPreValueSourceTypeId(prevalueSourceTypeId)
      .create();

    const result = await getPrevalueSourceTool.handler(
      { id: builder.getId() },
      context
    );

    expect(
      PrevalueSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await getPrevalueSourceTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      context
    );
    expect(result.isError).toBe(true);
  });
});
