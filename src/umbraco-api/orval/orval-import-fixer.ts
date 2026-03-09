/**
 * Local Orval Import Fixer
 *
 * Temporary replacement for the SDK's orvalImportFixer until the next beta
 * includes the fix for mutator imports.
 *
 * Fixes all relative ESM imports in Orval-generated files by adding .js extensions.
 */

import fs from "fs";
import path from "path";

function fixSchemaDirectory(dir: string): void {
  const schemaFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));

  schemaFiles.forEach((schemaFile) => {
    const schemaFilePath = path.join(dir, schemaFile);
    const original = fs.readFileSync(schemaFilePath, "utf8");
    const content = original.replace(/from\s+['"](\.\/.*?)(?<!\.ts)['"]/g, (match, p1) => {
      const resolvedPath = path.resolve(
        path.dirname(schemaFilePath),
        p1 + ".ts"
      );
      if (fs.existsSync(resolvedPath)) {
        return `from '${p1}.js'`;
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(schemaFilePath, content, "utf8");
    }
  });
}

function fixApiFile(file: string): void {
  const original = fs.readFileSync(file, "utf8");

  const content = original.replace(
    /from\s+['"](\.[^'"]+)['"]/g,
    (match, importPath) => {
      // Skip if already has a recognized file extension
      if (/\.[jt]sx?$|\.json$/.test(importPath)) {
        return match;
      }

      const resolved = path.resolve(path.dirname(file), importPath);

      // If it's a directory, add /index.js
      if (fs.existsSync(resolved) && fs.lstatSync(resolved).isDirectory()) {
        return `from '${importPath}/index.js'`;
      }

      // If a .ts file exists, add .js (ESM convention)
      if (
        fs.existsSync(resolved + ".ts") ||
        fs.existsSync(resolved + ".tsx")
      ) {
        return `from '${importPath}.js'`;
      }

      return match;
    }
  );

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
  }
}

export function orvalImportFixer(files: string[]): void {
  files.forEach((file) => {
    if (fs.lstatSync(file).isDirectory()) {
      fixSchemaDirectory(file);
    } else {
      fixApiFile(file);
    }
  });
}
