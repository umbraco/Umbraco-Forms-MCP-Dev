import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "./setup.js";
import getPrevalueSourceTreeTool from "../get/get-prevalue-source-tree.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Get Prevalue Source Tree";

describe("get-prevalue-source-tree", () => {
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

  it("should return prevalue source tree", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new PrevalueSourceBuilder()
      .withName(TEST_NAME)
      .withFieldPreValueSourceTypeId(prevalueSourceTypeId)
      .create();

    const result = await getPrevalueSourceTreeTool.handler({}, context);

    expect(
      PrevalueSourceTestHelper.normalizeIds(result)
    ).toMatchSnapshot();
  });
});
