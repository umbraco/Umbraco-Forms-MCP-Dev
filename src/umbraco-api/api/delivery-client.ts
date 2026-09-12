/**
 * Delivery API Client Configuration
 *
 * Used by the Orval-generated Delivery API code for reading public form
 * definitions and submitting entries. Authenticates via an `Api-Key` header
 * instead of OAuth — the Management API client's bearer-token flow doesn't
 * apply here.
 *
 * Requires the Umbraco instance to have (appsettings.json):
 * - Umbraco:Forms:Options:EnableFormsApi: true
 * - Umbraco:Forms:Security:FormsApiKey configured, matching UMBRACO_FORMS_API_KEY
 */

import type { HttpResponse } from "@umbraco-cms/mcp-server-sdk";
import { loadServerConfig } from "../../config/index.js";

const getBaseUrl = async () => (await loadServerConfig(true)).umbraco.auth.baseUrl;
const getApiKey = async () => (await loadServerConfig(true)).custom.formsApiKey || "";

function serializeParams(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

interface RequestConfig {
  method?: string;
  url?: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

export const deliveryInstance = async <T>(
  config: RequestConfig,
  options?: RequestConfig
): Promise<HttpResponse<T> | T> => {
  const mergedConfig = { ...config, ...options };
  const returnFullResponse = (mergedConfig as any).returnFullResponse === true;

  const apiKey = await getApiKey();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...mergedConfig.headers,
  };
  if (apiKey) {
    headers["Api-Key"] = apiKey;
  }

  const queryString = serializeParams(mergedConfig.params);
  const fullUrl = `${await getBaseUrl()}${mergedConfig.url || ""}${queryString}`;

  const fetchOptions: RequestInit = {
    method: mergedConfig.method || "GET",
    headers,
  };

  if (mergedConfig.data !== undefined) {
    fetchOptions.body = JSON.stringify(mergedConfig.data);
  }

  const resp = await fetch(fullUrl, fetchOptions);

  let data: T;
  const contentType = resp.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    data = (await resp.json()) as T;
  } else {
    const text = await resp.text();
    data = (text || undefined) as T;
  }

  if (returnFullResponse) {
    const responseHeaders: Record<string, string> = {};
    resp.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    return {
      status: resp.status,
      statusText: resp.statusText,
      data,
      headers: responseHeaders,
    } satisfies HttpResponse<T>;
  }

  if (resp.status >= 400) {
    const error: any = new Error(`Request failed with status code ${resp.status}`);
    error.response = { status: resp.status, data };
    throw error;
  }

  return data;
};

export default deliveryInstance;
