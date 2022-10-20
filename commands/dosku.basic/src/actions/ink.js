import chalk from "chalk";
import { create, store } from "../lib/kudos.js";
import { normalizeIdentifier } from "../lib/identifiers.js";

const log = console.log;
// const devLog = process.env.KUDOS_DEBUG === "true" ? console.log : () => {};

const exec = async (context) => {
  const flags = context.flags;
  const kudoData = {}; // no such thing as a kudo, except here, a singular kudos h/t @stpeter
  kudoData.createTime = flags.createTime
    ? new Date(flags.createTime).toISOString()
    : new Date().toISOString(); // '2022-03-07T10:27:27.718Z'
  kudoData.weight = flags.weight ? parseFloat(flags.weight) : 100;
  kudoData.src = flags.src ? flags.src : context.personality || "cli";
  kudoData.description = flags.description ? flags.description : "";

  if (context.input[1]) {
    // we have an identifier something of the form twitter:mankins or @mankins or mankins with --scope=twitter
    try {
      kudoData.identifier = normalizeIdentifier(context.input[1], {
        DEFAULT_SCOPE: flags.scope,
      });
    } catch (e) {
      log(
        chalk.red(
          `Identifier format error: ${kudoData.identifier}\n\n\t${e.message}`
        )
      );
      process.exit(2);
    }
    const kudo = await create(kudoData);
    if (flags.verbose) {
      log(
        chalk.green(
          `Kudos ${kudo.identifier} created at ${kudo.createTime} [${kudo.weight}]`
        )
      );
    }
    store(kudo);
  } else {
    log(
      'Usage: dosku ink [twitter:identifier] [--weight=1] [--createTime=now] [--src=cli] [--description=""]'
    );
    process.exit(2);
  }
};

export { exec };
