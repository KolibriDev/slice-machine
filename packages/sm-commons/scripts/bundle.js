/**
 * This scripts validates a given SM library
 * and bundles its JSON representation.
 *
 * It should be dev installed by library owner and called on pre-publish hook
 *
 */

/**
 * - from process.cwd(), parse and use sm.config.json
 * - find slices folder, test components
 * - test model et meta JSON files
 * - concatenate them (like current slices API does)
 * - write to file slices.json (or config.pathToSlicesDef)
 * - exit 0
 */

const path = require("path");
const consola = require("consola");

const actions = require("../methods/actions");
const expectLibrary = require("../expect").expectLibrary;
const { versionIsValid } = require("../methods/communication");

const { SM_CONFIG_FILE, SM_FILE } = require("../consts");

async function main() {
  try {
    await versionIsValid();

    const config = actions.readConfig(path.join(process.cwd(), SM_CONFIG_FILE));
    const pathToLib = actions.pathToLib(config);
    const pathToSlices = actions.pathToSlices(config, pathToLib);

    const slices = actions.fetchSliceDefinitions(pathToSlices);

    const { package, packageName } = actions.readJsonPackage(
      path.join(process.cwd(), "package.json")
    );

    const sm = {
      ...config,
      packageName,
      package,
      slices,
    };

    expectLibrary(sm);

    actions.writeSmFile(JSON.stringify(sm));

    consola.success(
      `[SliceMachine] Successfully created file "${SM_FILE}".\nYou should commit it with your library changes!`
    );
    process.exit(0);
  } catch (e) {
    consola.error(
      "[SliceMachine] Commit aborted. An error occured while bundling your slice library"
    );
    console.log(`[full error] ${e}\n`);
    process.exit(-1);
  }
}

main();
