import chalk from "chalk";

import { create, store } from "../lib/kudos.js";
import { normalizeIdentifier } from "../lib/identifiers.js";

const log = console.log;
// const devLog = process.env.KUDOS_DEBUG === "true" ? console.log : () => {};

const exec = async (context) => {
  const flags = context.flags;

  if (context.input[1]) {
    // we have an identifier something of the form twitter:mankins or @mankins or mankins with --scope=twitter
    const kudoData = {}; // no such thing as a kudo, except here, a singular kudos h/t @stpeter
    kudoData.createTime = flags.createTime
      ? new Date(flags.createTime).toISOString()
      : new Date().toISOString(); // '2022-03-07T10:27:27.718Z'
    kudoData.weight = parseFloat(flags.weight);
    if (isNaN(kudoData.weight)) {
      kudoData.weight = 1;
    }
    kudoData.src = flags.src ? flags.src : context.personality || "cli";
    kudoData.description = flags.description ? flags.description : "";

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
  } else if (context.stdin) {
    try {
      const jsonRows = context.stdin.split(/\n|\n\r/).filter(Boolean);
      const rows = jsonRows.map((jsonStringRow) => JSON.parse(jsonStringRow));
      //log({jsonRows, rows});
      for (const kudoData of rows) {
        try {
          kudoData.identifier = normalizeIdentifier(kudoData.identifier, {
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
        // log(kudoData);
        const kudo = await create(kudoData); // TODO: flag to skip on errors
        if (flags.verbose) {
          log(
            chalk.green(
              `Kudos ${kudo.identifier} created at ${kudo.createTime} [${kudo.weight}]`
            )
          );
        }
        store(kudo);
      }
    } catch (e) {
      log(chalk.red(e.message), e);
      process.exit(1);
    }
  } else {
    log(
      `Usage: dosku ink [<STDIN:ndjson>] [twitter:identifier] [--weight=1] [--createTime=now] [--src=cli] [--description=""]

Example NDJSON import from previous list:
      cat /tmp/abc | jq -cM '.entries[]' | dosku ink
      `
    );
    process.exit(2);
  }
};

export { exec };
