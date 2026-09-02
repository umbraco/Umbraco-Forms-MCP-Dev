import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  validateToolResponse,
} from "./setup.js";
import listFormTemplatesTool from "../get/list-form-templates.js";

describe("list-form-templates", () => {
  setupTestEnvironment();

  // Note: this connected Umbraco Forms instance has no seeded form templates,
  // so this asserts the well-formed (empty) items array rather than a
  // non-empty list. Adjust to assert items.length > 0 if templates are seeded.
  it("should list form templates", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listFormTemplatesTool.handler({}, context);

    const data = validateToolResponse(listFormTemplatesTool, result);
    expect(Array.isArray(data.items)).toBe(true);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
