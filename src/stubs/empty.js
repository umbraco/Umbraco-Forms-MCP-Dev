// Stub module for Node.js-only dependencies that are pulled in transitively
// but not used at Cloudflare Workers runtime.
export default {};
export const hideBin = (args) => args.slice(2);
