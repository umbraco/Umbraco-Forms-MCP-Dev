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
  DataSourceBuilder,
} from "./setup.js";
import createFormFromDataSourceTool from "../post/create-form-from-data-source.js";

type ApiClient = ReturnType<typeof getUmbracoFormsManagementAPI>;

const TEST_NAME = "_Test Create Form From Data Source";
const TEST_FORM_NAME = "_Test Form From Data Source";

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

  afterEach(async () => {
    // The generated form is a separate entity type from this collection — clean it up
    // via the raw client rather than the form tool collection's own helpers.
    if (createdFormId) {
      await deleteFormById(createdFormId);
      createdFormId = undefined;
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

    expect(createSnapshotResult(result)).toMatchSnapshot();

    createdFormId = await findFormIdByName(TEST_FORM_NAME);
    expect(createdFormId).toBeDefined();
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
