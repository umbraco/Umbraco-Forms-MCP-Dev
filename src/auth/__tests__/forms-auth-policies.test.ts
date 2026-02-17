import { FormsAuthorizationPolicies, type FormsUserContext } from "../auth-policies.js";

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

const noSecurityUser: FormsUserContext = {
  security: undefined,
};

describe("FormsAuthorizationPolicies", () => {
  describe("HasFormsAccess", () => {
    it("returns true when security is defined", () => {
      expect(FormsAuthorizationPolicies.HasFormsAccess(fullPermissionsUser)).toBe(true);
    });

    it("returns true even with no permissions (user has Forms section access)", () => {
      expect(FormsAuthorizationPolicies.HasFormsAccess(noPermissionsUser)).toBe(true);
    });

    it("returns false when security is undefined", () => {
      expect(FormsAuthorizationPolicies.HasFormsAccess(noSecurityUser)).toBe(false);
    });
  });

  describe("ManageForms", () => {
    it("returns true for full permissions user", () => {
      expect(FormsAuthorizationPolicies.ManageForms(fullPermissionsUser)).toBe(true);
    });

    it("returns false for no permissions user", () => {
      expect(FormsAuthorizationPolicies.ManageForms(noPermissionsUser)).toBe(false);
    });

    it("returns false for undefined security user", () => {
      expect(FormsAuthorizationPolicies.ManageForms(noSecurityUser)).toBe(false);
    });
  });

  describe("ViewEntries", () => {
    it("returns true for full permissions user", () => {
      expect(FormsAuthorizationPolicies.ViewEntries(fullPermissionsUser)).toBe(true);
    });

    it("returns false for no permissions user", () => {
      expect(FormsAuthorizationPolicies.ViewEntries(noPermissionsUser)).toBe(false);
    });

    it("returns false for undefined security user", () => {
      expect(FormsAuthorizationPolicies.ViewEntries(noSecurityUser)).toBe(false);
    });
  });

  describe("EditEntries", () => {
    it("returns true for full permissions user", () => {
      expect(FormsAuthorizationPolicies.EditEntries(fullPermissionsUser)).toBe(true);
    });

    it("returns false for no permissions user", () => {
      expect(FormsAuthorizationPolicies.EditEntries(noPermissionsUser)).toBe(false);
    });

    it("returns false for undefined security user", () => {
      expect(FormsAuthorizationPolicies.EditEntries(noSecurityUser)).toBe(false);
    });
  });

  describe("DeleteEntries", () => {
    it("returns true for full permissions user", () => {
      expect(FormsAuthorizationPolicies.DeleteEntries(fullPermissionsUser)).toBe(true);
    });

    it("returns false for no permissions user", () => {
      expect(FormsAuthorizationPolicies.DeleteEntries(noPermissionsUser)).toBe(false);
    });

    it("returns false for undefined security user", () => {
      expect(FormsAuthorizationPolicies.DeleteEntries(noSecurityUser)).toBe(false);
    });
  });

  describe("ManageWorkflows", () => {
    it("returns true for full permissions user", () => {
      expect(FormsAuthorizationPolicies.ManageWorkflows(fullPermissionsUser)).toBe(true);
    });

    it("returns false for no permissions user", () => {
      expect(FormsAuthorizationPolicies.ManageWorkflows(noPermissionsUser)).toBe(false);
    });

    it("returns false for undefined security user", () => {
      expect(FormsAuthorizationPolicies.ManageWorkflows(noSecurityUser)).toBe(false);
    });
  });

  describe("ManageDataSources", () => {
    it("returns true for full permissions user", () => {
      expect(FormsAuthorizationPolicies.ManageDataSources(fullPermissionsUser)).toBe(true);
    });

    it("returns false for no permissions user", () => {
      expect(FormsAuthorizationPolicies.ManageDataSources(noPermissionsUser)).toBe(false);
    });

    it("returns false for undefined security user", () => {
      expect(FormsAuthorizationPolicies.ManageDataSources(noSecurityUser)).toBe(false);
    });
  });

  describe("ManagePreValueSources", () => {
    it("returns true for full permissions user", () => {
      expect(FormsAuthorizationPolicies.ManagePreValueSources(fullPermissionsUser)).toBe(true);
    });

    it("returns false for no permissions user", () => {
      expect(FormsAuthorizationPolicies.ManagePreValueSources(noPermissionsUser)).toBe(false);
    });

    it("returns false for undefined security user", () => {
      expect(FormsAuthorizationPolicies.ManagePreValueSources(noSecurityUser)).toBe(false);
    });
  });
});
