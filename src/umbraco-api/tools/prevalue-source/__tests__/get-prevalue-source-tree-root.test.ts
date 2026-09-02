import { validateToolResponse } from "@umbraco-cms/mcp-server-sdk/testing";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceBuilder,
} from "./setup.js";
import getPrevalueSourceTreeRootTool from "../get/get-prevalue-source-tree-root.js";

const TEST_NAME = "_Test Get Prevalue Source Tree Root";

describe("get-prevalue-source-tree-root", () => {
  setupTestEnvironment();

  let builder: PrevalueSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should list the top-level prevalue source tree items", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    const result = await getPrevalueSourceTreeRootTool.handler(context);
    const data = validateToolResponse(getPrevalueSourceTreeRootTool, result) as {
      total: number;
      items: Array<{ id: string; name: string }>;
    };

    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.some((item) => item.id === builder.getId())).toBe(true);
  });
});
