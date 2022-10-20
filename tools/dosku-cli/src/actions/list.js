import * as child_process from "child_process";

import chalk from "chalk";

const log = console.log;

// proxy to defined list command
const exec = (context) => {
  const subcommand = "list";
  const subcommands = context.config.get("subcommands") || {};
  if (subcommands[subcommand]) {
    let commandArgs = context.input.slice(1);
    commandArgs.unshift(...subcommands[subcommand]);
    // log(commandArgs[0], { commandArgs, flags: context.flags, argv: context.argv });
    try {
      const out = child_process.execFileSync(commandArgs[0], context.argv, {
        input: context.stdin,
      });
      log(out.toString());
    } catch (e) {
      log({ e });
      e.output.forEach((thing) => {
        if (thing) {
          log(thing.toString());
        }
      });
      process.exit(e.status);
    }
  } else {
    log("Usage: dosku list...");
    log(
      chalk.yellow(
        "You may need to install an implementation of this first with npx"
      )
    );
    process.exit(2);
  }
};

export { exec };
