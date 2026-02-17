import type { FormsUserContext } from "../../../../auth/index.js";
import collection from "../index.js";

const fullPermissionsUser: FormsUserContext = {
  security: {
    manageForms: true,
    viewEntries: true,
    editEntries: true,
    deleteEntries: true,
    manageWorkflows: true,
    manageDataSources: true,
    managePreValueSources: true,
    user: "test-user-id",
  },
};

const viewOnlyUser: FormsUserContext = {
  security: {
    manageForms: false,
    viewEntries: true,
    editEntries: false,
    deleteEntries: false,
    manageWorkflows: false,
    manageDataSources: false,
    managePreValueSources: false,
    user: "test-user-id",
  },
};

const noPermissionsUser: FormsUserContext = {
  security: {
    manageForms: false,
    viewEntries: false,
    editEntries: false,
    deleteEntries: false,
    manageWorkflows: false,
    manageDataSources: false,
    managePreValueSources: false,
    user: "test-user-id",
  },
};

const noAccessUser: FormsUserContext = {
  security: undefined,
};

function toolNames(user: FormsUserContext): string[] {
  return collection.tools(user).map((t) => t.name);
}

describe("record collection auth", () => {
  it("returns all tools for full permissions user", () => {
    const names = toolNames(fullPermissionsUser);
    expect(names).toEqual([
      "list-records",
      "get-record-metadata",
      "get-record-audit-trail",
      "get-record-workflow-audit-trail",
      "get-record-page-number",
      "list-record-set-actions",
      "update-record",
      "execute-record-action",
      "delete-records",
      "retry-record-workflow",
    ]);
  });

  it("returns only read tools for viewEntries-only user", () => {
    const names = toolNames(viewOnlyUser);
    expect(names).toEqual([
      "list-records",
      "get-record-metadata",
      "get-record-audit-trail",
      "get-record-workflow-audit-trail",
      "get-record-page-number",
      "list-record-set-actions",
    ]);
  });

  it("returns no tools for user with Forms access but no record permissions", () => {
    const names = toolNames(noPermissionsUser);
    expect(names).toEqual([]);
  });

  it("returns no tools for user without Forms access", () => {
    const names = toolNames(noAccessUser);
    expect(names).toEqual([]);
  });

  it("includes edit tools when editEntries is true", () => {
    const user: FormsUserContext = {
      security: {
        ...noPermissionsUser.security!,
        editEntries: true,
      },
    };
    const names = toolNames(user);
    expect(names).toContain("update-record");
    expect(names).toContain("execute-record-action");
    expect(names).not.toContain("delete-records");
    expect(names).not.toContain("list-records");
  });

  it("includes delete-records when deleteEntries is true", () => {
    const user: FormsUserContext = {
      security: {
        ...noPermissionsUser.security!,
        deleteEntries: true,
      },
    };
    const names = toolNames(user);
    expect(names).toContain("delete-records");
    expect(names).not.toContain("update-record");
    expect(names).not.toContain("list-records");
  });

  it("includes workflow tools when manageWorkflows is true", () => {
    const user: FormsUserContext = {
      security: {
        ...noPermissionsUser.security!,
        manageWorkflows: true,
      },
    };
    const names = toolNames(user);
    expect(names).toContain("retry-record-workflow");
    expect(names).not.toContain("list-records");
  });
});
