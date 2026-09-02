import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import getRecordSetActionsTool from "../get/get-record-set-actions.js";

describe("get-record-set-actions", () => {
  setupTestEnvironment();

  it("should list the record-set actions available on this instance", async () => {
    const context = createMockRequestHandlerExtra();

    // This tool declares no inputSchema (ToolDefinition<undefined, ...>) built via
    // `satisfies` around a literal zero-arg `handler: async () => {...}`. That combination
    // makes TypeScript infer the decorated handler as a union of call signatures
    // (`(extra) => Result | (args, extra) => Result`), which — for a union of function
    // types — can only be invoked with an argument list valid against every member at
    // once. Passing the context object for both slots satisfies that union; the tool's
    // actual implementation ignores the extra leading argument since it never reads it.
    const result = await getRecordSetActionsTool.handler(context, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
