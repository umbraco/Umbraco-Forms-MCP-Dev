import { encodeCursor } from "@umbraco-cms/mcp-server-sdk";
import { validateToolResponse, type CursorPaginatedResult } from "@umbraco-cms/mcp-server-sdk/testing";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  PrevalueSourceBuilder,
  PrevalueSourceTestHelper,
} from "./setup.js";
import listPrevalueSourcesTool from "../get/list-prevalue-sources.js";

const TEST_NAME = "_Test List Prevalue Source";

describe("list-prevalue-sources", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await PrevalueSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should list prevalue sources", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new PrevalueSourceBuilder().withName(TEST_NAME).create();

    const result = await listPrevalueSourcesTool.handler({}, context);
    const data = validateToolResponse(listPrevalueSourcesTool, result) as CursorPaginatedResult;

    expect(data.items.length).toBeGreaterThan(0);
    expect(
      (data.items as Array<{ id: string }>).some((item) => item.id === builder.getId()),
    ).toBe(true);
  });

  it("should paginate with cursor to a second page", async () => {
    const context = createMockRequestHandlerExtra();

    // Seed enough rows that a 2-per-page cursor always produces a next page,
    // regardless of how much other data already exists.
    await new PrevalueSourceBuilder().withName(`${TEST_NAME} 1`).create();
    await new PrevalueSourceBuilder().withName(`${TEST_NAME} 2`).create();
    await new PrevalueSourceBuilder().withName(`${TEST_NAME} 3`).create();

    const page1 = await listPrevalueSourcesTool.handler(
      { cursor: encodeCursor({ s: 0, t: 2 }) },
      context,
    );
    const data1 = validateToolResponse(listPrevalueSourcesTool, page1) as CursorPaginatedResult;
    expect(data1.nextCursor).toBeDefined();

    const page2 = await listPrevalueSourcesTool.handler({ cursor: data1.nextCursor }, context);
    const data2 = validateToolResponse(listPrevalueSourcesTool, page2) as CursorPaginatedResult;
    expect(data2.items[0]).not.toEqual(data1.items[0]);
  });
});
