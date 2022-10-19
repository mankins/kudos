import * as child_process from "child_process";

import chalk from "chalk";

const log = console.log;

// proxy to defined ink command
const exec = (context) => {
  const subcommand = "ink";
  const subcommands = context.config.get("subcommands") || {};
  if (subcommands[subcommand]) {
    let commandArgs = context.input.slice(1);
    commandArgs.unshift(...subcommands[subcommand]);
    log(commandArgs[0], { commandArgs });
    try {
      const out = child_process.execFileSync(commandArgs[0], commandArgs, {
        input: context.stdin,
      });
      log(out.toString());
    } catch (e) {
      log({ e });
    }
  } else {
    log("Usage: dosku ink...");
    log(
      chalk.yellow(
        "You may need to install an implementation of this first with npx"
      )
    );
    process.exit(2);
  }
};

export { exec };
