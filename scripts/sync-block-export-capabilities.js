const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

const sourcePath = path.join(
  rootDir,
  "shared",
  "pageBuilder",
  "blockExportCapabilities.ts"
);

const targets = [
  path.join(
    rootDir,
    "backend",
    "src",
    "shared",
    "pageBuilder",
    "blockExportCapabilities.generated.ts"
  ),
  path.join(
    rootDir,
    "frontend",
    "src",
    "modules",
    "pageBuilder",
    "export",
    "blockExportCapabilities.generated.ts"
  ),
];

const header = `// GENERATED FILE. DO NOT EDIT.\n// Source: shared/pageBuilder/blockExportCapabilities.ts\n\n`;

const normalizeNewlines = (value) =>
  value.replace(/\r\n/g, "\n");

const source = normalizeNewlines(
  fs.readFileSync(sourcePath, "utf8")
);

const generated = `${header}${source}`;

const checkOnly = process.argv.includes("--check");

let stale = false;

for (const target of targets) {
  if (checkOnly) {
    const current = fs.existsSync(target)
      ? normalizeNewlines(
          fs.readFileSync(target, "utf8")
        )
      : "";

    if (current !== generated) {
      stale = true;
      console.error(
        `Stale generated capability catalog: ${path.relative(
          rootDir,
          target
        )}`
      );
    }

    continue;
  }

  fs.mkdirSync(
    path.dirname(target),
    {
      recursive: true,
    }
  );

  fs.writeFileSync(
    target,
    generated,
    "utf8"
  );

  console.log(
    `Wrote ${path.relative(
      rootDir,
      target
    )}`
  );
}

if (stale) {
  process.exitCode = 1;
}
