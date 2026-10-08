/**
 * Tests for the Umbraco Forms version gates.
 *
 * Forms 17.x and 18.x ship side by side, so an endpoint that arrived mid-line has
 * a different minimum on each major. These pin the table's semantics — each
 * major judged by its own minimum — and that the decorator only rewrites the
 * 404 a missing endpoint produces, never an ordinary one.
 */

import { UmbracoApiError, initializeUmbracoFetch } from "@umbraco-cms/mcp-server-sdk";
import {
  formsVersionSupports,
  getFormsVersion,
  isMissingEndpointError,
  minimumFormsVersion,
  withFormsFeature,
} from "../forms-version.js";

describe("formsVersionSupports", () => {
  it("should gate each endpoint at its first 17.x release", () => {
    expect(formsVersionSupports("treeAncestors", "17.0.1")).toBe(false);
    expect(formsVersionSupports("treeAncestors", "17.1.0")).toBe(true);
    expect(formsVersionSupports("formSearch", "17.1.3")).toBe(false);
    expect(formsVersionSupports("formSearch", "17.2.0")).toBe(true);
    expect(formsVersionSupports("formCollection", "17.2.1")).toBe(false);
    expect(formsVersionSupports("analytics", "17.3.0")).toBe(true);
    expect(formsVersionSupports("prevalueSourceTextFile", "17.3.2")).toBe(false);
    expect(formsVersionSupports("prevalueSourceTextFile", "17.4.0")).toBe(true);
    expect(formsVersionSupports("memberForms", "17.4.8")).toBe(false);
    expect(formsVersionSupports("memberForms", "17.5.0")).toBe(true);
    for (const feature of ["recycleBin", "formVersions", "formAuditLog", "recordWrite"] as const) {
      expect(formsVersionSupports(feature, "17.5.2")).toBe(false);
      expect(formsVersionSupports(feature, "17.6.0")).toBe(true);
    }
  });

  it("should judge each major by its own minimum, not by the newest line's", () => {
    // 17.5 is below 18.1 numerically but has the 18.1 member endpoints.
    expect(formsVersionSupports("memberForms", "17.5.2")).toBe(true);
    expect(formsVersionSupports("memberForms", "18.0.6")).toBe(false);
    expect(formsVersionSupports("memberForms", "18.1.0")).toBe(true);
    // 17.6 is below 18.2 numerically but has the 18.2 recycle bin.
    expect(formsVersionSupports("recycleBin", "17.6.1")).toBe(true);
    expect(formsVersionSupports("recycleBin", "18.1.3")).toBe(false);
    expect(formsVersionSupports("recycleBin", "18.2.0")).toBe(true);
    // Everything else was in 18.0.0 already.
    expect(formsVersionSupports("formCollection", "18.0.0")).toBe(true);
  });

  it("should read build metadata and prerelease suffixes", () => {
    expect(formsVersionSupports("formCollection", "17.3.0+6323387")).toBe(true);
    expect(formsVersionSupports("formCollection", "17.2.0-rc2")).toBe(false);
  });

  it("should treat majors outside the table by which side of it they fall", () => {
    expect(formsVersionSupports("memberForms", "19.0.0")).toBe(true);
    expect(formsVersionSupports("memberForms", "16.9.0")).toBe(false);
  });

  it("should assume support when the version can't be read", () => {
    expect(formsVersionSupports("analytics", undefined)).toBe(true);
    expect(formsVersionSupports("analytics", "")).toBe(true);
    expect(formsVersionSupports("analytics", "unknown")).toBe(true);
  });
});

describe("minimumFormsVersion", () => {
  it("should name the minimum on the installed version's own line", () => {
    expect(minimumFormsVersion("analytics", "17.0.1")).toBe("17.3");
    expect(minimumFormsVersion("memberForms", "18.0.2")).toBe("18.1");
  });

  it("should return undefined for a major outside the table or an unreadable version", () => {
    expect(minimumFormsVersion("analytics", "16.5.0")).toBeUndefined();
    expect(minimumFormsVersion("analytics", undefined)).toBeUndefined();
  });
});

describe("isMissingEndpointError", () => {
  it("should match only a 404 or 405 from the API", () => {
    expect(isMissingEndpointError(new UmbracoApiError({ status: 404, detail: "Not Found" }))).toBe(true);
    expect(isMissingEndpointError(new UmbracoApiError({ status: 405, detail: "Method Not Allowed" }))).toBe(true);
    expect(isMissingEndpointError(new UmbracoApiError({ status: 400, detail: "Bad Request" }))).toBe(false);
    expect(isMissingEndpointError(new Error("Not Found"))).toBe(false);
  });
});

describe("withFormsFeature against the connected instance", () => {
  beforeAll(() => {
    initializeUmbracoFetch({
      baseUrl: process.env.UMBRACO_BASE_URL!,
      clientId: process.env.UMBRACO_CLIENT_ID!,
      clientSecret: process.env.UMBRACO_CLIENT_SECRET!,
    });
  });

  it("should read the installed Forms version from the package manifest", async () => {
    expect(await getFormsVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("should pass through an ordinary 404 on a version that has the endpoint", async () => {
    // The instance the suite runs against is a current Forms release, so a 404
    // here means "not found", and must not be reworded as a version problem.
    const notFound = new UmbracoApiError({ status: 404, detail: "Form not found" });
    const tool = withFormsFeature("treeAncestors", {
      name: "probe",
      description: "probe",
      inputSchema: {},
      handler: async () => {
        throw notFound;
      },
    } as any);

    await expect((tool.handler as any)({}, {})).rejects.toBe(notFound);
  });

  it("should leave other failures alone without looking up the version", async () => {
    const badRequest = new UmbracoApiError({ status: 400, detail: "Bad Request" });
    const tool = withFormsFeature("analytics", {
      name: "probe",
      description: "probe",
      inputSchema: {},
      handler: async () => {
        throw badRequest;
      },
    } as any);

    await expect((tool.handler as any)({}, {})).rejects.toBe(badRequest);
  });
});
