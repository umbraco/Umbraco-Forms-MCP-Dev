import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  FormBuilder,
} from "./setup.js";
import { encodeCursor } from "@umbraco-cms/mcp-server-sdk";
import { type CursorPaginatedResult } from "@umbraco-cms/mcp-server-sdk/testing";
import listFormsTool from "../get/list-forms.js";

const TEST_NAME_1 = "_Test List Forms 1";
const TEST_NAME_2 = "_Test List Forms 2";

describe("list-forms", () => {
  setupTestEnvironment();

  let builder1: FormBuilder;
  let builder2: FormBuilder;

  beforeAll(async () => {
    builder1 = await new FormBuilder().withName(TEST_NAME_1).create();
    builder2 = await new FormBuilder().withName(TEST_NAME_2).create();
  });

  afterAll(async () => {
    if (builder1) await builder1.delete();
    if (builder2) await builder2.delete();
  });

  it("should list forms with a total count", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listFormsTool.handler({}, context);

    const data = validateToolResponse(listFormsTool, result) as CursorPaginatedResult;
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
  });

  it("should paginate with a cursor to a second page", async () => {
    const context = createMockRequestHandlerExtra();

    const page1 = await listFormsTool.handler({ cursor: encodeCursor({ s: 0, t: 1 }) }, context);
    const data1 = validateToolResponse(listFormsTool, page1) as CursorPaginatedResult;
    expect(data1.nextCursor).toBeDefined();

    const page2 = await listFormsTool.handler({ cursor: data1.nextCursor }, context);
    const data2 = validateToolResponse(listFormsTool, page2) as CursorPaginatedResult;
    expect(data2.items[0]).not.toEqual(data1.items[0]);
  });
});
