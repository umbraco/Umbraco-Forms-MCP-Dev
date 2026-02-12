import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceTestHelper,
} from "./setup.js";
import createPrevalueSourceTool from "../post/create-prevalue-source.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Create Prevalue Source";

describe("create-prevalue-source", () => {
  setupTestEnvironment();

  let prevalueSourceTypeId: string;
  const createdIds: string[] = [];

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
    for (const id of createdIds) {
      await PrevalueSourceTestHelper.deleteById(id);
    }
    createdIds.length = 0;
  });

  it("should create a prevalue source", async () => {
    const context = createMockRequestHandlerExtra();
    const result = await createPrevalueSourceTool.handler(
      {
        name: TEST_NAME,
        fieldPreValueSourceTypeId: prevalueSourceTypeId,
        settings: {},
        cachePrevaluesFor: "0",
      },
      context
    );
    createdIds.push((result.structuredContent as any).id);
    expect(
      PrevalueSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
