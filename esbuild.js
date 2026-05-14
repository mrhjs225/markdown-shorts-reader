/* eslint-env node */
const esbuild = require("esbuild");

const watch = process.argv.includes("--watch");

const config = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: "dist/extension.js",
  external: ["vscode"],
  sourcemap: true,
  logLevel: "info"
};

async function main() {
  if (watch) {
    const context = await esbuild.context(config);
    await context.watch();
    console.log("Watching extension sources...");
    return;
  }

  await esbuild.build(config);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
