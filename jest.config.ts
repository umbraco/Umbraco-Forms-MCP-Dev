import type { JestConfigWithTsJest } from "ts-jest";

const shared: Partial<JestConfigWithTsJest> = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
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
  setupFiles: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

const config: JestConfigWithTsJest = {
  projects: [
    {
      ...shared,
      displayName: "integration",
      testMatch: ["**/__tests__/**/*.test.ts"],
      collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
      coverageDirectory: "coverage",
    } as JestConfigWithTsJest,
    {
      ...shared,
      displayName: "evals",
      testMatch: ["<rootDir>/tests/evals/**/*.test.ts"],
      testTimeout: 120000,
      slowTestThreshold: 300,
      setupFilesAfterEnv: ["<rootDir>/tests/evals/helpers/e2e-setup.ts"],
    } as JestConfigWithTsJest,
  ],
};

export default config;
