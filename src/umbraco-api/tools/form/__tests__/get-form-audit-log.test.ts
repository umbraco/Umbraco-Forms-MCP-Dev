import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  FormBuilder,
} from "./setup.js";
import { renameForm } from "./helpers/form-versions-test-helper.js";
import getFormAuditLogTool from "../get/get-form-audit-log.js";

const TEST_NAME = "_Test Get Form Audit Log";

describe("get-form-audit-log", () => {
  setupTestEnvironment();

  let builder: FormBuilder | undefined;

  afterEach(async () => {
    await builder?.delete();
    builder = undefined;
  });

  it("should list what was done to the form, newest first by default", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();
    await renameForm(builder.getId(), `${TEST_NAME} Renamed`);

    const result = await getFormAuditLogTool.handler({ id: builder.getId() } as never, context);

    const data = validateToolResponse(getFormAuditLogTool, result);
    expect(data.items.map((entry) => entry.logType)).toEqual(["Save", "New"]);

    const ascending = await getFormAuditLogTool.handler(
      { id: builder.getId(), orderDirection: "Ascending" } as never,
      context,
    );
    expect(validateToolResponse(getFormAuditLogTool, ascending).items.map((entry) => entry.logType)).toEqual([
      "New",
      "Save",
    ]);
  });

  it("should return an error for an unknown form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormAuditLogTool.handler(
      { id: "00000000-0000-0000-0000-000000000001" } as never,
      context,
    );

    expect(result.isError).toBe(true);
  });
});
