import { resolve as pathResolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = pathResolve(__dirname, "..");
const SRC = pathResolve(ROOT, "src");

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const relative = specifier.slice(2);
    let fullPath = pathResolve(SRC, relative);
    if (!existsSync(fullPath) && !fullPath.match(/\.\w+$/)) fullPath += ".js";
    return nextResolve(pathToFileURL(fullPath).href, context);
  }
  if (context.parentURL && (specifier.startsWith("./") || specifier.startsWith("../")) && !specifier.match(/\.\w+$/)) {
    const parentDir = dirname(fileURLToPath(context.parentURL));
    const fullPath = pathResolve(parentDir, specifier);
    if (existsSync(fullPath)) return nextResolve(pathToFileURL(fullPath).href, context);
    if (existsSync(fullPath + ".js")) return nextResolve(pathToFileURL(fullPath + ".js").href, context);
  }
  return nextResolve(specifier, context);
}
