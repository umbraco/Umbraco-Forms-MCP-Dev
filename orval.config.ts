import { UmbFormsManagementApiOrvalConfig } from "./src/umbraco-api/orval/umb-forms-management-api.js";
import { UmbFormsDeliveryApiOrvalConfig } from "./src/umbraco-api/orval/umb-forms-delivery-api.js";

export default {
  ...UmbFormsManagementApiOrvalConfig,
  ...UmbFormsDeliveryApiOrvalConfig,
};
