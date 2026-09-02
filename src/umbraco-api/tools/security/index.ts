/**
 * Security Tool Collection
 *
 * Tools for managing Umbraco Forms security: per-form permission assignments for
 * backoffice users and user groups, and browsing the Forms security tree.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getUserGroupFormSecurityTool from "./get/get-user-group-form-security.js";
import createUserGroupFormSecurityTool from "./post/create-user-group-form-security.js";
import updateUserGroupFormSecurityTool from "./put/update-user-group-form-security.js";
import deleteUserGroupFormSecurityTool from "./delete/delete-user-group-form-security.js";
import getUserFormSecurityTool from "./get/get-user-form-security.js";
import createUserFormSecurityTool from "./post/create-user-form-security.js";
import updateUserFormSecurityTool from "./put/update-user-form-security.js";
import deleteUserFormSecurityTool from "./delete/delete-user-form-security.js";
import getCurrentUserFormSecurityTool from "./get/get-current-user-form-security.js";
import listUsersToAssignTool from "./get/list-users-to-assign.js";
import listSecurityTreeAncestorsTool from "./get/list-security-tree-ancestors.js";
import listSecurityTreeChildrenTool from "./get/list-security-tree-children.js";
import listSecurityTreeRootTool from "./get/list-security-tree-root.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "security",
    displayName: "Security",
    description:
      "Manage Umbraco Forms permission assignments for users and user groups, and browse the Forms security tree.",
  },
  tools: () => [
    // User group form security
    getUserGroupFormSecurityTool,
    createUserGroupFormSecurityTool,
    updateUserGroupFormSecurityTool,
    deleteUserGroupFormSecurityTool,
    // User form security
    getUserFormSecurityTool,
    createUserFormSecurityTool,
    updateUserFormSecurityTool,
    deleteUserFormSecurityTool,
    getCurrentUserFormSecurityTool,
    listUsersToAssignTool,
    // Security tree
    listSecurityTreeAncestorsTool,
    listSecurityTreeChildrenTool,
    listSecurityTreeRootTool,
  ],
};

export default collection;
