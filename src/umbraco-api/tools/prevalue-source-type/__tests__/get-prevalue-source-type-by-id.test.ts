import { getStructuredContent } from "@umbraco-cms/mcp-server-sdk/testing";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getPrevalueSourceTypeByIdTool from "../get/get-prevalue-source-type-by-id.js";
import listPrevalueSourceTypesTool from "../get/list-prevalue-source-types.js";

const NON_EXISTENT_ID = "00000000-0000-0000-0000-000000000000";

describe("get-prevalue-source-type-by-id", () => {
  setupTestEnvironment();

  it("should return a prevalue source type by id", async () => {
    const context = createMockRequestHandlerExtra();

    const listResult = await listPrevalueSourceTypesTool.handler({}, context);
    const { items } = getStructuredContent(listResult) as {
      items: Array<{ id: string }>;
    };
    const id = items[0].id;

    const result = await getPrevalueSourceTypeByIdTool.handler({ id }, context);

    expect(createSnapshotResult(result, id)).toMatchSnapshot();
  });

  it("should return error for non-existent id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getPrevalueSourceTypeByIdTool.handler(
      { id: NON_EXISTENT_ID },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
