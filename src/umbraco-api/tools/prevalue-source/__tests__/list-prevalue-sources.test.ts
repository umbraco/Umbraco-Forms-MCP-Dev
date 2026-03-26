import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "./setup.js";
import listPrevalueSourcesTool from "../get/list-prevalue-sources.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test List Prevalue Sources";

describe("list-prevalue-sources", () => {
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

  beforeEach(async () => {
    await PrevalueSourceTestHelper.cleanup(TEST_NAME);
  });

  afterEach(async () => {
    await PrevalueSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should list prevalue sources", async () => {
    const context = createMockRequestHandlerExtra();
    await new PrevalueSourceBuilder()
      .withName(TEST_NAME)
      .withFieldPreValueSourceTypeId(prevalueSourceTypeId)
      .create();

    const result = await listPrevalueSourcesTool.handler({ skip: 0, take: 100 }, context);

    expect(result.isError).toBeUndefined();
    const items = (result.structuredContent as any)?.items;
    expect(Array.isArray(items)).toBe(true);
    const createdItem = items.find((item: any) => item.name === TEST_NAME);
    expect(createdItem).toBeDefined();
    expect(createdItem.entityType).toBe("prevaluesource");
    expect(createdItem.fieldPreValueSourceTypeId).toBeDefined();
  });
});
