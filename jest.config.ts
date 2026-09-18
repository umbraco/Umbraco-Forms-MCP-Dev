import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  displayName: "template",
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  reporters: ["default", "<rootDir>/jest-failure-reporter.ts"],
  maxWorkers: 1,
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Integration tests hit a real Umbraco over HTTPS; jest's 5s default is
  // below the cost of a single create+cleanup round trip, so suites failed
  // intermittently on timing rather than behaviour. 60s matches the value
  // form-submission's setup.ts had been setting on its own.
  testTimeout: 60000,
  setupFiles: ["<rootDir>/jest.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/mocks/jest-setup.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
};

export default config;
