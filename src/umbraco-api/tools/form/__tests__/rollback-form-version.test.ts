import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
} from "./setup.js";
import { getVersionIds, renameForm } from "./helpers/form-versions-test-helper.js";
import {
  getUmbracoFormsManagementAPI,
  type FormDesign,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import rollbackFormVersionTool from "../post/rollback-form-version.js";

const TEST_NAME = "_Test Rollback Form Version";

describe("rollback-form-version", () => {
  setupTestEnvironment();

  let builder: FormBuilder | undefined;

  afterEach(async () => {
    await builder?.delete();
    builder = undefined;
  });

  it("should restore the form to an earlier version and record the rollback as a new one", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();
    await renameForm(builder.getId(), `${TEST_NAME} Renamed`);
    const [, firstVersionId] = await getVersionIds(builder.getId());

    const result = await rollbackFormVersionTool.handler({ versionId: firstVersionId }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
    const form = (await getUmbracoFormsManagementAPI().getFormById(builder.getId())) as FormDesign;
    expect(form.name).toBe(TEST_NAME);
    expect(await getVersionIds(builder.getId())).toHaveLength(3);
  });

  it("should refuse a form in the recycle bin", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();
    const [versionId] = await getVersionIds(builder.getId());
    await getUmbracoFormsManagementAPI().deleteFormById(builder.getId());

    const result = await rollbackFormVersionTool.handler({ versionId }, context);

    expect(result.isError).toBe(true);
  });
});
