// Shared storageState path for the Playwright auth flow. Lives in its own
// (non-test) module so both auth.setup.ts and the authenticated specs can import
// it without Playwright's "test file should not import test file" guard tripping.
export const STORAGE_STATE = 'playwright/.auth/user.json';
