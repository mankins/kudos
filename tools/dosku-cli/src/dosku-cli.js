#!/usr/bin/env node
import meow from "meow";
// import updateNotifier from "update-notifier";
import { URL } from "url";
const __dirname = new URL(".", import.meta.url).pathname;

import dotenv from "dotenv";
dotenv.config({ path: __dirname + ".env" });

import config from "./config.js";
import dosku from "./index.js";

// const pkgJson = JSON.parse(fs.readFileSync("./package.json"));

const defaultHelp = `
  dosku: command line for dosku

  $ dosku --help

  Usage
    $ dosku [input]

  Options
    --debug=[bool]  [Default: false]
    --help          [Default: false]

    Examples
    $ dosku

    Config
    $ dosku config get
    $ dosku config get cmd.preserve-url --raw 
    $ dosku config set key.subkey val
    $ dosku config set arrayKey val1 val2 --array
    $ dosku config del key

    Run Commands
    $ dosku subcommand
    executes -> dosku.subcommand @params
`;

const cli = meow(defaultHelp, {
  importMeta: import.meta,
  flags: {
    // transaction: {
    //   type: "string",
    //   default: "",
    // },
    // wallet: {
    //   type: "string",
    //   default: "",
    // },
    // debug: {
    //   type: "boolean",
    //   default: false,
    // }
  },
});
if (cli.input.length === 0 || cli.input[0] === "help") {
  process.stderr.write(`${defaultHelp}\n`);
  process.exit(0);
}
dosku({ action: cli.input[0], flags: cli.flags, input: cli.input, config, argv: process.argv.slice(2) });

// updateNotifier({
//   pkg: pkgJson,
//   defer: true,
// }).notify();
