import { Utils } from "slicemachine-core";
import * as inquirer from "inquirer";

export async function promptForFramework(): Promise<Utils.Framework> {
  const frameworks = Utils.framework.SupportedFrameworks;
  const choices = frameworks.map((framework) => {
    return {
      name: Utils.framework.fancyName(framework),
      value: framework,
    };
  });

  return inquirer
    .prompt<{ framework: Utils.Framework }>([
      {
        name: "framework",
        type: "list",
        message: "Select a framework to use",
        required: true,
        choices,
      },
    ])
    .then((res) => res.framework);
}

export async function detectFramework(cwd: string): Promise<Utils.Framework> {
  const failMessage = `Please run ${Utils.bold(
    "npx slicemachine init"
  )} in a Nuxt or Next.js project`;

  const spinner = Utils.spinner(
    "Detecting framework to install correct dependencies"
  );

  spinner.start();

  try {
    const maybeFramework = Utils.framework.detectFramework(cwd);
    spinner.stop();

    if (!maybeFramework || maybeFramework === Utils.Framework.vanillajs) {
      // spinner.fail();
      Utils.writeError("Framework not detected");
      return await promptForFramework();
    }

    const isSupported =
      Utils.framework.SupportedFrameworks.includes(maybeFramework);
    if (!isSupported) {
      Utils.writeError(`${maybeFramework} is currently not supported`);
      console.log(failMessage);
      process.exit(1);
    }

    const nameToPrint = Utils.framework.fancyName(maybeFramework);
    // spinner.stop();
    Utils.writeCheck(`${nameToPrint} detected`);

    return maybeFramework;
  } catch (error) {
    spinner.fail("package.json not found");

    if (error instanceof Error && error.message) {
      Utils.writeError(error.message);
    } else {
      console.log(failMessage);
    }

    process.exit(1);
  }
}
