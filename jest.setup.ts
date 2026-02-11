// Must be set before any TLS connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import "dotenv/config";
import https from "node:https";

// Directly configure the global HTTPS agent to accept self-signed certs
https.globalAgent.options.rejectUnauthorized = false;
