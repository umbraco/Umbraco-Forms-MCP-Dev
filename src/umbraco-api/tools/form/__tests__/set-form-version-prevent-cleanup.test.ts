import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  FormBuilder,
} from "./setup.js";
import { getVersionIds } from "./helpers/form-versions-test-helper.js";
import {
  getUmbracoFormsManagementAPI,
  type FormVersionResponseModel,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import setFormVersionPreventCleanupTool from "../put/set-form-version-prevent-cleanup.js";

const TEST_NAME = "_Test Set Form Version Prevent Cleanup";

describe("set-form-version-prevent-cleanup", () => {
  setupTestEnvironment();

  let builder: FormBuilder | undefined;

  afterEach(async () => {
    await builder?.delete();
    builder = undefined;
  });

  async function isProtected(versionId: string): Promise<boolean> {
    const version = (await getUmbracoFormsManagementAPI().getFormVersionByVersionId(
      versionId,
    )) as FormVersionResponseModel;
    return version.preventCleanup;
  }

  it("should protect a version and release it again", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();
    const [versionId] = await getVersionIds(builder.getId());

    const result = await setFormVersionPreventCleanupTool.handler({ versionId, preventCleanup: true }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
    expect(await isProtected(versionId)).toBe(true);

    await setFormVersionPreventCleanupTool.handler({ versionId, preventCleanup: false }, context);
    expect(await isProtected(versionId)).toBe(false);
  });

  it("should return an error for an unknown version", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await setFormVersionPreventCleanupTool.handler(
      { versionId: "00000000-0000-0000-0000-000000000001", preventCleanup: true },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
