import {
  setupTestEnvironment,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "../setup.js";
import { getApiClient } from "@umbraco-cms/mcp-server-sdk";
import type { getUmbracoFormsManagementAPI } from "../../../../api/generated/umbracoFormsManagementApi.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Builder Prevalue Source";

describe("PrevalueSourceBuilder", () => {
  setupTestEnvironment();

  let prevalueSourceTypeId: string;

  beforeAll(async () => {
    // Look up a real prevalue source type ID from the instance
    const client = getApiClient<ApiClient>();
    const response = await client.getPrevalueSourceType();
    const typeList = response as any;
    if (!typeList || typeList.length === 0) {
      throw new Error("No prevalue source types found in Umbraco instance");
    }
    prevalueSourceTypeId = typeList[0].id;
  });

  afterEach(async () => {
    await PrevalueSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should create prevalue source with builder", async () => {
    const builder = await new PrevalueSourceBuilder()
      .withName(TEST_NAME)
      .withFieldPreValueSourceTypeId(prevalueSourceTypeId)
      .create();

    expect(builder.getId()).toBeDefined();

    const found = await PrevalueSourceTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();
    expect(found?.name).toBe(TEST_NAME);
  });

  it("should build model without creating", () => {
    const builder = new PrevalueSourceBuilder().withName(TEST_NAME);
    const model = builder.build();
    expect(model.name).toBe(TEST_NAME);
    expect(model.id).toBeDefined();
    expect(model.entityType).toBe("FieldPreValueSource");
  });

  it("should throw error when getId called before create", () => {
    const builder = new PrevalueSourceBuilder();
    expect(() => builder.getId()).toThrow(
      "Prevalue source not created yet. Call create() first."
    );
  });
});
