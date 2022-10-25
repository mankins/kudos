// import chalk from "chalk";
// import { getCohortEntries } from "../lib/kudos.js";
// import { currentCohort } from "../lib/date.js";
import fs from "fs";

import chalk from "chalk";
import glob from 'tiny-glob';
import YAML from 'yaml'

// import * as objectSha from "object-sha";

const log = console.log;

const exec = async (context) => {
  const flags = context.flags;
  const rootDir = context.input[1];

  // setup flag defaults
  const kudosFile = flags.kudosFile || `kudos.yml`;
  const checks = new Set(
    (flags.checks || "kudos,contributors,lang").split(",")
  );
  const langs = new Set((flags.lang || "nodejs").split(","));

  if (flags.help || !rootDir) {
    console.error(
      `Usage:
 $ ${context.personality} identify [--outFile=STDOUT] [--kudosFile=kudos.yml] [--checks={kudos,contributors,lang}] [--lang={nodejs,go}] SEARCH_DIR`
    );
    process.exit(0);
  }

  // search a path for creators to attribute
  let outData = "";
  let rootDirPath = "";

  try {
    rootDirPath = fs.realpathSync(rootDir);
  } catch (err) {
    console.error(chalk.red(`Error: ${err.message}`));
    process.exit(0);
  }

  // see if search path exists
  if (!fs.lstatSync(rootDirPath).isDirectory()) {
    console.error(chalk.red("Directory not found:", rootDirPath));
    process.exit(0);
  }

  // plan: we will go through each check type and emit any creators found
  let creators = new Set();

  if (checks.has("kudos")) {
    // look for kudos.yml files
    let files = await glob(`${rootDirPath}/*/${kudosFile}`);
    for (let i = 0; i < files.length; i += 1) {
      try {
      const file = files[i];
      const data = fs.readFileSync(file);
      const kudos = YAML.parse(data);
      kudos.forEach((kudo) => {
        console.log({ kudo });
        // creators.add(kudo.creator);
      });
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  }

  if (flags.outFile) {
    fs.writeFileSync(flags.outFile, outData);
  } else {
    log(outData);
  }
  process.exit(0);
};

export { exec };
