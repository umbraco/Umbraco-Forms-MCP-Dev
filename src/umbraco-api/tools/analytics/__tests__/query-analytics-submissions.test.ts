import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import queryAnalyticsSubmissionsTool from "../post/query-analytics-submissions.js";

// The API requires startDate/endDate even though the tool schema documents
// them as optional. A short fixed window keeps the test deterministic and
// keeps the date-bucketed response (one row per day) small.
const TEST_START_DATE = "2026-08-20T00:00:00+00:00";
const TEST_END_DATE = "2026-08-26T00:00:00+00:00";

describe("query-analytics-submissions", () => {
  setupTestEnvironment();

  it("should return a submissions time series using default metrics and dimensions", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await queryAnalyticsSubmissionsTool.handler(
      {
        formId: undefined,
        filter: undefined,
        startDate: TEST_START_DATE,
        endDate: TEST_END_DATE,
        timeZone: undefined,
        sort: undefined,
        metrics: ["entries", "uniqueMembers"],
        dimensions: ["date"],
        ascending: true,
        page: 1,
        pageSize: 50,
        includeSubpages: true,
      },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
