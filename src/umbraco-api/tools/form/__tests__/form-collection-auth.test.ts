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

describe("form collection auth", () => {
  it("returns all tools for full permissions user", () => {
    const names = toolNames(fullPermissionsUser);
    expect(names).toEqual([
      "list-forms",
      "get-form",
      "get-form-scaffold",
      "get-form-scaffold-by-template",
      "list-form-templates",
      "get-form-tree",
      "get-form-tree-ancestors",
      "get-form-relations",
      "create-form",
      "copy-form",
      "update-form",
      "move-form",
      "delete-form",
      "copy-form-workflows",
    ]);
  });

  it("returns only read tools for user with Forms access but no manage permissions", () => {
    const names = toolNames(readOnlyUser);
    expect(names).toEqual([
      "list-forms",
      "get-form",
      "get-form-scaffold",
      "get-form-scaffold-by-template",
      "list-form-templates",
      "get-form-tree",
      "get-form-tree-ancestors",
      "get-form-relations",
    ]);
  });

  it("returns no tools for user without Forms access", () => {
    const names = toolNames(noAccessUser);
    expect(names).toEqual([]);
  });

  it("includes workflow tools only when manageWorkflows is true", () => {
    const user: FormsUserContext = {
      security: {
        ...readOnlyUser.security!,
        manageWorkflows: true,
      },
    };
    const names = toolNames(user);
    expect(names).toContain("copy-form-workflows");
    expect(names).not.toContain("create-form");
  });
});
