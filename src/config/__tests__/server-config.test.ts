/**
 * Server Config Integration Tests
 *
 * Tests for the extensible config system using custom fields.
 */

import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock the toolkit's getServerConfig before importing our module
const mockGetServerConfig = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.unstable_mockModule("@umbraco-cms/mcp-server-sdk", () => ({
  getServerConfig: mockGetServerConfig,
}));

// Import our module after setting up mocks
const { loadServerConfig, clearConfigCache } =
  await import("../server-config.js");

describe("Server Config", () => {
  beforeEach(() => {
    clearConfigCache();
    mockGetServerConfig.mockReset();
  });

  describe("loadServerConfig", () => {
    it("should return combined umbraco and custom config", async () => {
      mockGetServerConfig.mockResolvedValue({
        config: {
          auth: {
            clientId: "test-client",
            clientSecret: "test-secret",
            baseUrl: "http://localhost:5000",
          },
          readonly: true,
          configSources: {
            clientId: "env",
            clientSecret: "env",
            baseUrl: "env",
            readonly: "env",
            envFile: "default",
          },
        },
        custom: {
          formsApiKey: "my-forms-key",
        },
      });

      const { umbraco, custom } = await loadServerConfig(true);

      expect(umbraco.auth.clientId).toBe("test-client");
      expect(umbraco.auth.baseUrl).toBe("http://localhost:5000");
      expect(umbraco.readonly).toBe(true);
      expect(custom.formsApiKey).toBe("my-forms-key");
    });

    it("should pass isStdioMode to getServerConfig", async () => {
      mockGetServerConfig.mockResolvedValue({
        config: {
          auth: { clientId: "x", clientSecret: "x", baseUrl: "x" },
          configSources: { clientId: "env", clientSecret: "env", baseUrl: "env", envFile: "default" },
        },
        custom: {},
      });

      await loadServerConfig(true);
      expect(mockGetServerConfig).toHaveBeenCalledWith(true, expect.any(Object));

      clearConfigCache();
      await loadServerConfig(false);
      expect(mockGetServerConfig).toHaveBeenCalledWith(false, expect.any(Object));
    });

    it("should pass additionalFields to getServerConfig", async () => {
      mockGetServerConfig.mockResolvedValue({
        config: {
          auth: { clientId: "x", clientSecret: "x", baseUrl: "x" },
          configSources: { clientId: "env", clientSecret: "env", baseUrl: "env", envFile: "default" },
        },
        custom: {},
      });

      await loadServerConfig(true);

      expect(mockGetServerConfig).toHaveBeenCalledWith(
        true,
        expect.objectContaining({
          additionalFields: expect.arrayContaining([
            expect.objectContaining({ name: "disableMcpChaining" }),
            expect.objectContaining({ name: "formsApiKey", envVar: "UMBRACO_FORMS_API_KEY" }),
          ]),
        })
      );
    });

    it("should cache config after first load", async () => {
      mockGetServerConfig.mockResolvedValue({
        config: {
          auth: { clientId: "cached", clientSecret: "x", baseUrl: "x" },
          configSources: { clientId: "env", clientSecret: "env", baseUrl: "env", envFile: "default" },
        },
        custom: { formsApiKey: "cached-key" },
      });

      const first = await loadServerConfig(true);
      expect(mockGetServerConfig).toHaveBeenCalledTimes(1);

      const second = await loadServerConfig(true);
      expect(mockGetServerConfig).toHaveBeenCalledTimes(1);

      expect(first.umbraco.auth.clientId).toBe("cached");
      expect(second.umbraco.auth.clientId).toBe("cached");
      expect(first.custom.formsApiKey).toBe("cached-key");
      expect(second.custom.formsApiKey).toBe("cached-key");
    });

    it("should reload config after clearConfigCache", async () => {
      mockGetServerConfig
        .mockResolvedValueOnce({
          config: {
            auth: { clientId: "first", clientSecret: "x", baseUrl: "x" },
            configSources: { clientId: "env", clientSecret: "env", baseUrl: "env", envFile: "default" },
          },
          custom: {},
        })
        .mockResolvedValueOnce({
          config: {
            auth: { clientId: "second", clientSecret: "x", baseUrl: "x" },
            configSources: { clientId: "env", clientSecret: "env", baseUrl: "env", envFile: "default" },
          },
          custom: {},
        });

      const first = await loadServerConfig(true);
      expect(first.umbraco.auth.clientId).toBe("first");

      clearConfigCache();

      const second = await loadServerConfig(true);
      expect(second.umbraco.auth.clientId).toBe("second");
      expect(mockGetServerConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe("custom config interface", () => {
    it("should handle undefined custom values", async () => {
      mockGetServerConfig.mockResolvedValue({
        config: {
          auth: { clientId: "x", clientSecret: "x", baseUrl: "x" },
          configSources: { clientId: "env", clientSecret: "env", baseUrl: "env", envFile: "default" },
        },
        custom: {},
      });

      const { custom } = await loadServerConfig(true);

      expect(custom.disableMcpChaining).toBeUndefined();
      expect(custom.formsApiKey).toBeUndefined();
    });

    it("should type custom values correctly", async () => {
      mockGetServerConfig.mockResolvedValue({
        config: {
          auth: { clientId: "x", clientSecret: "x", baseUrl: "x" },
          configSources: { clientId: "env", clientSecret: "env", baseUrl: "env", envFile: "default" },
        },
        custom: {
          disableMcpChaining: true,
          formsApiKey: "test-key",
        },
      });

      const { custom } = await loadServerConfig(true);

      expect(typeof custom.disableMcpChaining).toBe("boolean");
      expect(typeof custom.formsApiKey).toBe("string");
    });
  });
});
