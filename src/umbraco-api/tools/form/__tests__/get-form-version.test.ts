import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  FormBuilder,
} from "./setup.js";
import { getVersionIds, renameForm } from "./helpers/form-versions-test-helper.js";
import getFormVersionTool from "../get/get-form-version.js";

const TEST_NAME = "_Test Get Form Version";

describe("get-form-version", () => {
  setupTestEnvironment();

  let builder: FormBuilder | undefined;

  afterEach(async () => {
    await builder?.delete();
    builder = undefined;
  });

  it("should return the design captured in an earlier version, parsed", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();
    await renameForm(builder.getId(), `${TEST_NAME} Renamed`);
    const [, firstVersionId] = await getVersionIds(builder.getId());

    const result = await getFormVersionTool.handler({ versionId: firstVersionId }, context);

    const data = validateToolResponse(getFormVersionTool, result);
    expect(data.name).toBe(TEST_NAME);
    expect(data.definition).toMatchObject({ key: builder.getId(), name: TEST_NAME });
    expect(Array.isArray(data.workflows)).toBe(true);
  });

  it("should return an error for an unknown version", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getFormVersionTool.handler(
      { versionId: "00000000-0000-0000-0000-000000000001" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
