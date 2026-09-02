import { encodeCursor } from "@umbraco-cms/mcp-server-sdk";
import { validateToolResponse, type CursorPaginatedResult } from "@umbraco-cms/mcp-server-sdk/testing";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  DataSourceBuilder,
  DataSourceTestHelper,
} from "./setup.js";
import listDataSourcesTool from "../get/list-data-sources.js";

const TEST_NAME = "_Test List Data Source";

describe("list-data-sources", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataSourceTestHelper.cleanup(TEST_NAME);
  });

  it("should list data sources", async () => {
    const context = createMockRequestHandlerExtra();
    const builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    const result = await listDataSourcesTool.handler({}, context);
    const data = validateToolResponse(listDataSourcesTool, result) as CursorPaginatedResult;

    expect(data.items.length).toBeGreaterThan(0);
    expect(
      (data.items as Array<{ id: string }>).some((item) => item.id === builder.getId()),
    ).toBe(true);
  });

  it("should paginate with cursor to a second page", async () => {
    const context = createMockRequestHandlerExtra();

    // Seed enough rows that a 2-per-page cursor always produces a next page,
    // regardless of how much other data already exists.
    await new DataSourceBuilder().withName(`${TEST_NAME} 1`).create();
    await new DataSourceBuilder().withName(`${TEST_NAME} 2`).create();
    await new DataSourceBuilder().withName(`${TEST_NAME} 3`).create();

    const page1 = await listDataSourcesTool.handler(
      { cursor: encodeCursor({ s: 0, t: 2 }) },
      context,
    );
    const data1 = validateToolResponse(listDataSourcesTool, page1) as CursorPaginatedResult;
    expect(data1.nextCursor).toBeDefined();

    const page2 = await listDataSourcesTool.handler({ cursor: data1.nextCursor }, context);
    const data2 = validateToolResponse(listDataSourcesTool, page2) as CursorPaginatedResult;
    expect(data2.items[0]).not.toEqual(data1.items[0]);
  });
});
