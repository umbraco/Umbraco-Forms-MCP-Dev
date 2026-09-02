import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import getAcceptanceTestsSystemInfoTool from "./get/get-acceptance-tests-system-info.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "acceptance-tests",
    displayName: "Acceptance Tests",
    description:
      "System information used for acceptance testing of the Umbraco Forms instance.",
  },
  tools: () => [getAcceptanceTestsSystemInfoTool],
};

export default collection;
