/**
 * Build script: bundles TS with esbuild, copies manifest + html + icons
 * into dist/, and produces xtrivo-extension-<version>.zip for CI artifacts.
 */
import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const version = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
).version;

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const entry of ["background", "popup", "options"]) {
  buildSync({
    entryPoints: [join(root, "src", `${entry}.ts`)],
    bundle: true,
    format: "iife",
    outfile: join(dist, `${entry}.js`),
    logLevel: "silent",
  });
}

for (const file of ["manifest.json", "src/popup.html", "src/options.html"]) {
  const target = join(dist, file.split("/").pop());
  cpSync(join(root, file), target);
}
// Icons are optional in Stage 1 (real logo system lands in Stage 2);
// the manifest references them but Chrome tolerates their absence.
if (existsSync(join(root, "icons"))) {
  cpSync(join(root, "icons"), join(dist, "icons"), { recursive: true });
}

// Validate manifest before zipping.
const manifest = JSON.parse(readFileSync(join(dist, "manifest.json"), "utf8"));
if (manifest.manifest_version !== 3) throw new Error("manifest must be MV3");
for (const f of [
  "background.js",
  "popup.js",
  "options.js",
  "popup.html",
  "options.html",
]) {
  try {
    readFileSync(join(dist, f));
  } catch {
    throw new Error(`dist missing ${f}`);
  }
}

const zipName = `xtrivo-extension-${version}.zip`;
// zip updates archives in place — delete the old one so stale files (e.g.
// icons from a previous build) can never leak into the new artifact.
rmSync(join(root, zipName), { force: true });
execSync(`cd ${dist} && zip -qr ../${zipName} .`, { stdio: "inherit" });
writeFileSync(join(root, "dist", "CHECKSUMS.txt"), `${zipName}\n`);
console.log(`built ${zipName}`);
