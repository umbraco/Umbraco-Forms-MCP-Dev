/**
 * Delivery API Client Configuration
 *
 * Used by the Orval-generated Delivery API code for form submissions.
 * Authenticates via API key header instead of OAuth.
 *
 * Requires the Umbraco instance to have:
 * - EnableFormsApi: true
 * - EnableAntiForgeryTokenForFormsApi: false
 * - FormsApiKey configured
 */

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const getBaseUrl = () =>
  process.env.UMBRACO_BASE_URL || "http://localhost:44391";
const getApiKey = () => process.env.UMBRACO_FORMS_API_KEY || "";

export const deliveryInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const mergedConfig = { ...config, ...options };
  const returnFullResponse =
    (mergedConfig as any).returnFullResponse === true;

  const apiKey = getApiKey();
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers["Api-Key"] = apiKey;
  }

  const instance = axios.create({
    baseURL: getBaseUrl(),
    headers,
  });

  if (returnFullResponse && !mergedConfig.validateStatus) {
    mergedConfig.validateStatus = () => true;
  }

  const response = await instance.request<T>({
    ...mergedConfig,
  });

  if (returnFullResponse) {
    return response;
  }

  return response.data as any;
};

export default deliveryInstance;
