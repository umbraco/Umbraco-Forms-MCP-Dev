import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import getMemberFormSummariesTool from "../get/get-member-form-summaries.js";

// NOTE: No Umbraco member exists on the connected instance (verified via the
// core Management API's /umbraco/management/api/v1/filter/member endpoint,
// which returned `total: 0`). This "member" collection has no create tool —
// members are a core Umbraco concept, not a Forms concept, so creating one is
// out of scope here. The happy path (a real memberKey with form submissions)
// is therefore untested, pending a member being created on the instance
// out-of-band.
//
// The endpoint (`GET .../member/{memberKey}/form-summaries`) also does not
// validate that memberKey corresponds to an existing member — it queries form
// entries by that key and returns an empty list when none match, rather than
// erroring. So there is no genuine error path to exercise here either; the
// test below documents that real, observed behavior instead.
describe("get-member-form-summaries", () => {
  setupTestEnvironment();

  it("should return an empty summary list for a memberKey with no matching entries", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getMemberFormSummariesTool.handler(
      { memberKey: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
