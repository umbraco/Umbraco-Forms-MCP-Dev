import { getStructuredContent } from "@umbraco-cms/mcp-server-sdk/testing";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  PrevalueSourceTestHelper,
} from "./setup.js";
import createPrevalueSourceTool from "../post/create-prevalue-source.js";
import listPrevalueSourceTypesTool from "../../prevalue-source-type/get/list-prevalue-source-types.js";

const TEST_NAME = "_Test Create Prevalue Source";

describe("create-prevalue-source", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await PrevalueSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should create a prevalue source", async () => {
    const context = createMockRequestHandlerExtra();

    // "dataSource" declares no settings, so it needs no external infrastructure.
    const typesResult = await listPrevalueSourceTypesTool.handler({}, context);
    const { items } = getStructuredContent(typesResult) as {
      items: Array<{ id: string; alias: string }>;
    };
    const providerType = items.find((t) => t.alias === "dataSource");
    expect(providerType).toBeDefined();

    const result = await createPrevalueSourceTool.handler(
      {
        name: TEST_NAME,
        fieldPreValueSourceTypeId: providerType!.id,
        settings: undefined,
        cachePrevaluesFor: undefined,
      },
      context,
    );

    const data = getStructuredContent(result) as { success: boolean; id?: string };
    expect(data.success).toBe(true);

    expect(createSnapshotResult(result, data.id)).toMatchSnapshot();
  });

  it("should return error for non-existent provider type id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createPrevalueSourceTool.handler(
      {
        name: TEST_NAME,
        fieldPreValueSourceTypeId: "00000000-0000-0000-0000-000000000000",
        settings: undefined,
        cachePrevaluesFor: undefined,
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
