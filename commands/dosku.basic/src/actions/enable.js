import chalk from "chalk";
import prompts from "prompts";

const log = console.log;

const possibleCommands = ["echo", "ink"];

// run sub command
const exec = async (context) => {
  const subcommand = context.input[1];
  if (subcommand || context.flags.all) {
    // context.config.set('subcommands', subcommands);
    // if (!context.flags.quiet) {
    //   log(chalk.green(`Installed ${subcommand}.`));
    // }
    const toEnable = [];
    if (subcommand) {
      if (possibleCommands.indexOf(subcommand) !== -1) {
        toEnable.push(subcommand);
      } else {
        log(chalk.red(`${subcommand} is not in this module`));
        process.exit(1);
      }
    }
    if (context.flags.all) {
      toEnable.push(...possibleCommands);
    }

    await toEnable.reduce(async (acc, commandName) => {
      await acc;

      const response = await prompts([
        {
          type: "confirm",
          name: "ok",
          message: `Are you sure you want to enable "${commandName}" ?`,
          initial: false,
        },
      ]);
      //console.log(JSON.stringify(response, null, '  '));
      if (response.ok) {
        log(chalk.green(`Enabling ${commandName}...`));

        // If you needed to setup different command flags you could do it here
        context.config.set(`subcommands.${commandName}`, [
          context.bin,
          commandName,
        ]);
      } else {
        process.exit(0);
      }
    }, Promise.resolve());
  } else {
    log(`Usage: ${context.personality} enable [subcommand] [--all]`);
    process.exit(2);
  }
};

export { exec };
