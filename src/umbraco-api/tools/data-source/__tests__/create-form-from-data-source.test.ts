import {
  getApiClient,
  CAPTURE_RAW_HTTP_RESPONSE,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";
import type {
  getUmbracoFormsManagementAPI,
  BasicForm,
} from "../../../api/generated/umbracoFormsManagementApi.js";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  getStructuredContent,
  DataSourceBuilder,
} from "./setup.js";
import { FormBuilder } from "../../form/__tests__/helpers/form-builder.js";
import createFormFromDataSourceTool from "../post/create-form-from-data-source.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Create Form From Data Source";
const TEST_FORM_NAME = "_Test Form From Data Source";
const TEST_COLLISION_FORM_NAME = "_Test Form From Data Source Collision";

async function findFormIdByName(name: string): Promise<string | undefined> {
  const client = getApiClient<ApiClient>();
  const response = (await client.getForm(CAPTURE_RAW_HTTP_RESPONSE)) as HttpResponse<
    BasicForm[]
  >;
  if (response.status < 200 || response.status >= 300) return undefined;
  return response.data.find((form) => form.name === name)?.id;
}

async function deleteFormById(id: string): Promise<void> {
  const client = getApiClient<ApiClient>();
  try {
    await client.deleteFormById(id, CAPTURE_RAW_HTTP_RESPONSE);
  } catch {
    // Ignore delete failures in cleanup
  }
}

describe("create-form-from-data-source", () => {
  setupTestEnvironment();

  let builder: DataSourceBuilder;
  let createdFormId: string | undefined;
  let decoyForm: FormBuilder | undefined;

  afterEach(async () => {
    // The generated form is a separate entity type from this collection — clean it up
    // via the raw client rather than the form tool collection's own helpers.
    if (createdFormId) {
      await deleteFormById(createdFormId);
      createdFormId = undefined;
    }
    if (decoyForm) {
      await decoyForm.delete();
      decoyForm = undefined;
    }
    if (builder) await builder.delete();
  });

  it("should create a form from a data source", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    const result = await createFormFromDataSourceTool.handler(
      { dataSourceId: builder.getId(), formName: TEST_FORM_NAME },
      context,
    );

    const data = getStructuredContent(result) as { success: boolean; id: string };
    expect(data.success).toBe(true);

    expect(createSnapshotResult(result, data.id)).toMatchSnapshot();

    createdFormId = await findFormIdByName(TEST_FORM_NAME);
    expect(createdFormId).toBeDefined();
    expect(createdFormId).toBe(data.id);
  });

  it("should return the id of the new form, not a pre-existing form with the same name", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    // Create a decoy form with the target name FIRST. Umbraco Forms does not
    // enforce unique form names, so a naive "first exact-name match" lookup
    // (the bug this test guards against) would resolve to this pre-existing
    // form instead of the one the tool is about to create.
    decoyForm = await new FormBuilder().withName(TEST_COLLISION_FORM_NAME).create();
    const decoyFormId = decoyForm.getId();

    const result = await createFormFromDataSourceTool.handler(
      { dataSourceId: builder.getId(), formName: TEST_COLLISION_FORM_NAME },
      context,
    );

    const data = getStructuredContent(result) as { success: boolean; id: string };
    expect(data.success).toBe(true);
    expect(data.id).toBeDefined();
    expect(data.id).not.toBe(decoyFormId);

    createdFormId = data.id;
  });

  it("should return error for a non-existent data source id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createFormFromDataSourceTool.handler(
      { dataSourceId: "00000000-0000-0000-0000-000000000000", formName: TEST_FORM_NAME },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
