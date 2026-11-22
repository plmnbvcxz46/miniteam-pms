import fs from "node:fs";
import path from "node:path";

const SOFT_LIMIT = 150;
const HARD_LIMIT = 250;

function walkCssFiles(dir, matchExt = ".module.css") {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkCssFiles(fullPath, matchExt));
    } else if (entry.name.endsWith(matchExt)) {
      results.push(fullPath);
    }
  }
  return results;
}

function countEffectiveCssLines(content) {
  const withoutComments = content.replace(/\/\*[\s\S]*?\*\//g, "");
  return withoutComments
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0).length;
}

const targetFiles = [
  ...walkCssFiles("src/components", ".module.css"),
  ...walkCssFiles("src/dev", ".module.css"),
  ...walkCssFiles("src/features", ".module.css"),
  ...walkCssFiles("src/styles/tokens", ".css"),
  ...(fs.existsSync("src/styles/base.css") ? ["src/styles/base.css"] : []),
];

let hasError = false;

for (const file of targetFiles) {
  const content = fs.readFileSync(file, "utf8");
  const sloc = countEffectiveCssLines(content);
  const normalized = file.replace(/\\/g, "/");

  if (sloc > HARD_LIMIT) {
    console.error(
      `[lint:lines] ERROR: ${normalized} 有效行数为 ${sloc} 行，超过硬上限 ${HARD_LIMIT} 行（不含空行与注释）。请按职责拆分样式文件。`,
    );
    hasError = true;
  } else if (sloc > SOFT_LIMIT) {
    console.warn(
      `[lint:lines] WARN: ${normalized} 有效行数为 ${sloc} 行，超过建议上限 ${SOFT_LIMIT} 行（硬上限 ${HARD_LIMIT} 行）。`,
    );
  }
}

if (hasError) {
  process.exit(1);
}
