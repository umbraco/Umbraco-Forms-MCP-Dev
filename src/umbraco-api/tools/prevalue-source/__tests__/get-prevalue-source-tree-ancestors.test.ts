import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "./setup.js";
import getPrevalueSourceTreeAncestorsTool from "../get/get-prevalue-source-tree-ancestors.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Get Prevalue Source Tree Ancestors";

describe("get-prevalue-source-tree-ancestors", () => {
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

  it("should return prevalue source tree ancestors for a descendant ID", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new PrevalueSourceBuilder()
      .withName(TEST_NAME)
      .withFieldPreValueSourceTypeId(prevalueSourceTypeId)
      .create();

    const result = await getPrevalueSourceTreeAncestorsTool.handler(
      { descendantId: builder.getId() },
      context
    );

    expect(
      PrevalueSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });

  it("should return empty array when descendantId is omitted", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPrevalueSourceTreeAncestorsTool.handler(
      { descendantId: undefined },
      context
    );

    expect(
      PrevalueSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
