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

const readOnlyUser: FormsUserContext = {
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

describe("prevalue-source collection auth", () => {
  it("returns all tools for full permissions user", () => {
    const names = toolNames(fullPermissionsUser);
    expect(names).toEqual([
      "get-prevalue-source",
      "list-prevalue-sources",
      "get-prevalue-source-values",
      "get-prevalue-source-tree",
      "get-prevalue-source-tree-ancestors",
      "get-prevalue-source-scaffold",
      "create-prevalue-source",
      "update-prevalue-source",
      "delete-prevalue-source",
    ]);
  });

  it("returns only read tools for user with Forms access but no managePreValueSources", () => {
    const names = toolNames(readOnlyUser);
    expect(names).toEqual([
      "get-prevalue-source",
      "list-prevalue-sources",
      "get-prevalue-source-values",
      "get-prevalue-source-tree",
      "get-prevalue-source-tree-ancestors",
      "get-prevalue-source-scaffold",
    ]);
  });

  it("returns no tools for user without Forms access", () => {
    const names = toolNames(noAccessUser);
    expect(names).toEqual([]);
  });
});
