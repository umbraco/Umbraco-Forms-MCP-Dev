# API Endpoints Analysis

**Last Updated**: 2026-02-13

## Summary

| Collection | Tool Count |
|------------|------------|
| chained | 1 |
| data-source | 8 |
| data-source-type | 2 |
| field-type | 3 |
| folder | 6 |
| form | 14 |
| form-submission | 2 |
| prevalue-source | 9 |
| prevalue-source-type | 2 |
| record | 9 |
| workflow-type | 2 |

**Total MCP Tools**: 58

## Tools by Collection

### chained (1)

- `get-chained-info`

### data-source (8)

- `create-data-source`
- `delete-data-source`
- `get-data-source`
- `get-data-source-scaffold`
- `get-data-source-tree`
- `get-data-source-tree-ancestors`
- `list-data-sources`
- `update-data-source`

### data-source-type (2)

- `get-data-source-type`
- `list-data-source-types`

### field-type (3)

- `get-field-type`
- `list-field-type-validation-patterns`
- `list-field-types`

### folder (6)

- `check-folder-empty`
- `create-folder`
- `delete-folder`
- `get-folder`
- `move-folder`
- `update-folder`

### form (14)

- `copy-form`
- `copy-form-workflows`
- `create-form`
- `delete-form`
- `get-form`
- `get-form-relations`
- `get-form-scaffold`
- `get-form-scaffold-by-template`
- `get-form-tree`
- `get-form-tree-ancestors`
- `list-form-templates`
- `list-forms`
- `move-form`
- `update-form`

### form-submission (2)

- `get-form-definition`
- `submit-form-entry`

### prevalue-source (9)

- `create-prevalue-source`
- `delete-prevalue-source`
- `get-prevalue-source`
- `get-prevalue-source-scaffold`
- `get-prevalue-source-tree`
- `get-prevalue-source-tree-ancestors`
- `get-prevalue-source-values`
- `list-prevalue-sources`
- `update-prevalue-source`

### prevalue-source-type (2)

- `get-prevalue-source-type`
- `list-prevalue-source-types`

### record (9)

- `execute-record-action`
- `get-record-audit-trail`
- `get-record-metadata`
- `get-record-page-number`
- `get-record-workflow-audit-trail`
- `list-record-set-actions`
- `list-records`
- `retry-record-workflow`
- `update-record`

### workflow-type (2)

- `get-workflow-type`
- `list-workflow-types`

## Gap Analysis

Comparison against `.discover.json` manifest:

| Collection | Tools | Endpoints | Tests | Evals | Status |
|------------|-------|-----------|-------|-------|--------|
| data-source | 8 | 8/10 | yes | yes | Complete |
| data-source-type | 2 | 2/2 | yes | yes | Complete |
| field-type | 3 | 3/4 | yes | yes | Complete |
| folder | 6 | 6/7 | yes | yes | Complete |
| form | 14 | 15/30 | yes | yes | Complete |
| form-submission | 2 | 0/0 | yes | yes | Complete |
| prevalue-source | 9 | 9/9 | yes | yes | Complete |
| prevalue-source-type | 2 | 2/2 | yes | yes | Complete |
| form-submission | 2 | 0/0 | yes | yes | Complete |
| record | 9 | 9/9 | yes | yes | Complete |
| workflow-type | 2 | 2/2 | yes | yes | Complete |

**Progress**: 11/11 collections complete | 56/75 endpoints covered (75%)

### Missing from .discover.json

These tool directories exist but are not listed in `.discover.json`:

- **chained** (1 tools)

## Notes

- This count includes only files that contain `ToolDefinition` and `withStandardDecorators`
- Excludes `index.ts` files and test files (`__tests__` directories)
- Helper files, constants, and utilities are not counted