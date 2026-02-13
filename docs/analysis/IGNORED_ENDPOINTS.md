# Ignored Endpoints

These endpoints are intentionally not implemented in the MCP server, typically because they:
- Are related to import/export functionality that may not be suitable for MCP operations
- Have security implications
- Are deprecated or have better alternatives
- Are not applicable in the MCP context

## Ignored by Collection

### Data Source (2 endpoints)
- `getDatasourceWizardByIdScaffold` - Get datasource wizard by id scaffold
- `postDatasourceWizardCreateForm` - Create/Execute datasource wizard create form

### Field Type (1 endpoints)
- `getFieldTypeRichtextDatatype` - Get field type richtext datatype

### Folder (1 endpoints)
- `getItemFolder` - Get item folder

### Form (15 endpoints)
- `deleteSecurityUserByIdFormSecurity` - Delete security user by id form security
- `deleteSecurityUserGroupByIdFormSecurity` - Delete security user group by id form security
- `getFormByIdHasRelations` - Get form by id has relations
- `getFormExport` - Get form export
- `getItemForm` - Get item form
- `getSecurityUserByIdFormSecurity` - Get security user by id form security
- `getSecurityUserCurrentFormSecurity` - Get security user current form security
- `getSecurityUserGroupByIdFormSecurity` - Get security user group by id form security
- `postFormFieldByIdValidateSettings` - Create/Execute form field by id validate settings
- `postFormImport` - Create/Execute form import
- `postFormWorkflowByIdValidateSettings` - Create/Execute form workflow by id validate settings
- `postSecurityUserByIdFormSecurity` - Create/Execute security user by id form security
- `postSecurityUserGroupByIdFormSecurity` - Create/Execute security user group by id form security
- `putSecurityUserByIdFormSecurity` - Update security user by id form security
- `putSecurityUserGroupByIdFormSecurity` - Update security user group by id form security

## Uncategorized

These endpoints do not match any known collection:

### Acceptance (1 endpoints)
- `getAcceptanceTestsSystemInfo` - Get acceptance tests system info

### Config (1 endpoints)
- `getConfig` - Get config

### Export (3 endpoints)
- `getExport` - Get export
- `getExportTypes` - Get export types
- `postExport` - Create/Execute export

### Licensing (1 endpoints)
- `getLicensingStatus` - Get licensing status

### Media (1 endpoints)
- `getMediaByPath` - Get media by path

### Picker (4 endpoints)
- `getPickerDataType` - Get picker data type
- `getPickerDocumentType` - Get picker document type
- `getPickerDocumentTypeByAliasProperties` - Get picker document type by alias properties
- `postPickerDocumentTypeMappingsRefresh` - Create/Execute picker document type mappings refresh

### Security (1 endpoints)
- `getSecurityUserUsersToAssign` - Get security user users to assign

### Theme (1 endpoints)
- `getTheme` - Get theme

### Tree (5 endpoints)
- `getTreeEmailTemplateChildrenByParentPath` - Get tree email template children by parent path
- `getTreeEmailTemplateRoot` - Get tree email template root
- `getTreeSecurityAncestors` - Get tree security ancestors
- `getTreeSecurityChildrenByParentId` - Get tree security children by parent id
- `getTreeSecurityRoot` - Get tree security root

### Umbraco (1 endpoints)
- `postUmbracoFormsDeliveryApiV1EntriesId` - Create/Execute umbraco forms delivery api v1 entries id

### Updates (1 endpoints)
- `getUpdatesVersion` - Get updates version

## Total Ignored: 39 endpoints
