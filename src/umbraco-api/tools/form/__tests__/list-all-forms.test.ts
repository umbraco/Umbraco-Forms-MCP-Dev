import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  FormBuilder,
} from "./setup.js";
import listAllFormsTool from "../get/list-all-forms.js";

const TEST_NAME = "_Test List All Forms";

describe("list-all-forms", () => {
  setupTestEnvironment();

  let builder: FormBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  // ToolDefinition<undefined, ...> — the decorated handler takes only the
  // context, not an ({}, context) pair.
  it("should list every form including a newly created one", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();

    const result = await listAllFormsTool.handler(context);

    const data = validateToolResponse(listAllFormsTool, result);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.some((item) => item.id === builder.getId())).toBe(true);
  });
});
