/**
 * API Client Configuration
 *
 * Delegates to the SDK's UmbracoManagementClient for all real API calls.
 * This ensures the same transport layer (fetch / customTransport) is used
 * everywhere — both in stdio mode and hosted Cloudflare Workers.
 *
 * Mock mode for eval tests (USE_MOCK_API=true) is handled locally before
 * delegating to the SDK.
 *
 * For unit tests, MSW intercepts requests at the fetch level.
 */

import { v4 as uuid } from "uuid";
import { UmbracoManagementClient, type HttpResponse } from "@umbraco-cms/mcp-server-sdk";

const isMockMode = () => process.env.USE_MOCK_API === "true";

// ============================================================================
// Mock Data Store (for eval tests running in subprocess)
// ============================================================================

interface MockItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const mockItems: Map<string, MockItem> = new Map();

function initializeMockData() {
  if (mockItems.size === 0) {
    const sampleItems: Omit<MockItem, "id" | "createdAt" | "updatedAt">[] = [
      { name: "Sample Item 1", description: "First sample item", isActive: true },
      { name: "Sample Item 2", description: "Second sample item", isActive: true },
      { name: "Inactive Item", description: "This item is inactive", isActive: false },
    ];

    sampleItems.forEach((item) => {
      const id = uuid();
      const now = new Date().toISOString();
      mockItems.set(id, { ...item, id, createdAt: now, updatedAt: now });
    });
  }
}

interface RequestConfig {
  method?: string;
  url?: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

function handleMockRequest<T>(config: RequestConfig): HttpResponse<T> {
  initializeMockData();

  const { method: rawMethod, url, data } = config;
  const method = rawMethod?.toLowerCase();
  const path = url || "";

  // GET /item - List all items
  if (method === "get" && path === "/item") {
    const params = (config.params || {}) as Record<string, string>;
    const skip = parseInt(params.skip) || 0;
    const take = parseInt(params.take) || 100;
    const items = Array.from(mockItems.values()).slice(skip, skip + take);
    return createMockResponse(200, { total: mockItems.size, items } as T);
  }

  // GET /item/search - Search items
  if (method === "get" && path === "/item/search") {
    const params = (config.params || {}) as Record<string, string>;
    const query = (params.query || "").toLowerCase();
    const skip = parseInt(params.skip) || 0;
    const take = parseInt(params.take) || 100;
    const filtered = Array.from(mockItems.values()).filter(
      (item) => item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query)
    );
    return createMockResponse(200, { total: filtered.length, items: filtered.slice(skip, skip + take) } as T);
  }

  // GET /item/:id - Get single item
  const getItemMatch = path.match(/^\/item\/([a-f0-9-]+)$/i);
  if (method === "get" && getItemMatch) {
    const id = getItemMatch[1];
    const item = mockItems.get(id);
    if (!item) {
      return createMockResponse(404, { type: "https://tools.ietf.org/html/rfc7231#section-6.5.4", title: "Not Found", status: 404, detail: `Item with id '${id}' not found` } as T);
    }
    return createMockResponse(200, item as T);
  }

  // POST /item - Create item
  if (method === "post" && path === "/item") {
    const body = typeof data === "string" ? JSON.parse(data) : data as any;
    const id = uuid();
    const now = new Date().toISOString();
    const newItem: MockItem = { id, name: body.name, description: body.description || null, isActive: body.isActive ?? true, createdAt: now, updatedAt: now };
    mockItems.set(id, newItem);
    return createMockResponse(201, undefined as T, { location: `/item/${id}` });
  }

  // PUT /item/:id - Update item
  const updateItemMatch = path.match(/^\/item\/([a-f0-9-]+)$/i);
  if (method === "put" && updateItemMatch) {
    const id = updateItemMatch[1];
    const item = mockItems.get(id);
    if (!item) {
      return createMockResponse(404, { type: "https://tools.ietf.org/html/rfc7231#section-6.5.4", title: "Not Found", status: 404, detail: `Item with id '${id}' not found` } as T);
    }
    const body = typeof data === "string" ? JSON.parse(data) : data as any;
    const updatedItem: MockItem = { ...item, name: body.name, description: body.description ?? item.description, isActive: body.isActive ?? item.isActive, updatedAt: new Date().toISOString() };
    mockItems.set(id, updatedItem);
    return createMockResponse(200, undefined as T);
  }

  // DELETE /item/:id - Delete item
  const deleteItemMatch = path.match(/^\/item\/([a-f0-9-]+)$/i);
  if (method === "delete" && deleteItemMatch) {
    const id = deleteItemMatch[1];
    if (!mockItems.has(id)) {
      return createMockResponse(404, { type: "https://tools.ietf.org/html/rfc7231#section-6.5.4", title: "Not Found", status: 404, detail: `Item with id '${id}' not found` } as T);
    }
    mockItems.delete(id);
    return createMockResponse(200, undefined as T);
  }

  // GET /security/user/current/form-security - Current user's Forms permissions
  if (method === "get" && path.includes("/security/user/current/form-security")) {
    return createMockResponse(200, {
      key: "mock-user-key",
      name: "Mock API User",
      unique: "mock-user-unique",
      entityType: "user",
      userSecurity: {
        manageForms: true,
        viewEntries: true,
        editEntries: true,
        deleteEntries: true,
        manageWorkflows: true,
        manageDataSources: true,
        managePreValueSources: true,
        user: "mock-user-id",
      },
      startFolderIds: [],
      formsSecurity: [],
    } as T);
  }

  return createMockResponse(404, { type: "https://tools.ietf.org/html/rfc7231#section-6.5.4", title: "Not Found", status: 404, detail: `Endpoint not found: ${method?.toUpperCase()} ${path}` } as T);
}

function createMockResponse<T>(status: number, data: T, headers: Record<string, string> = {}): HttpResponse<T> {
  return { data, status, statusText: status === 200 ? "OK" : status === 201 ? "Created" : "Error", headers };
}

// ============================================================================
// Main Client Instance
// ============================================================================

/**
 * Orval mutator for Forms Management API calls.
 *
 * - Mock mode (USE_MOCK_API=true): handled locally for eval tests
 * - Real mode: delegates to SDK's UmbracoManagementClient which uses
 *   initializeUmbracoFetch (stdio) or setCustomTransport (hosted Workers)
 */
export const customInstance = <T>(
  config: RequestConfig,
  options?: RequestConfig
): Promise<T> => {
  // Mock mode for eval tests (subprocess)
  if (isMockMode()) {
    const mergedConfig = { ...config, ...options };
    const returnFullResponse = (mergedConfig as any).returnFullResponse === true;
    const response = handleMockRequest<T>(mergedConfig);
    if (!returnFullResponse && response.status >= 400) {
      const error: any = new Error(`Request failed with status code ${response.status}`);
      error.response = response;
      error.status = response.status;
      return Promise.reject(error);
    }
    return Promise.resolve(returnFullResponse ? response as T : response.data as T);
  }

  // Delegate to SDK's UmbracoManagementClient for real API calls.
  // This uses initializeUmbracoFetch (stdio) or setCustomTransport (hosted).
  return UmbracoManagementClient<T>(config as any, options as any);
};

export default customInstance;

// Re-export SecondParameter type helper used by generated code
export type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];
