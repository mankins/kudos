// import chalk from "chalk";
// import { getCohortEntries } from "../lib/kudos.js";
// import { currentCohort } from "../lib/date.js";
import fs from "fs";

import chalk from "chalk";
import glob from "tiny-glob";
import { v4 as uuidv4 } from 'uuid';
import parseAuthor from "parse-author";
import YAML from "yaml";

// import * as objectSha from "object-sha";

const log = console.log;
const debugLog = console.error;

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
 $ ${context.personality} identify [--outFile=STDOUT] [--kudosFile=kudos.yml] [--checks={kudos,authors,lang}] [--lang={nodejs,go}] SEARCH_DIR`
    );
    process.exit(0);
  }

  // search a path for creators to attribute
  let outData = "";
  let rootDirPath = "";
  let traceId = flags.traceId || uuidv4();
  const creatorContext = {traceId};
  if (flags.contextType) {
    creatorContext.type = flags.contextType;
  }  

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
  let creators = [];

  if (checks.has("kudos")) {
    // look for kudos.yml files
    if (flags.debug) {
      debugLog(chalk.green("Checking for kudos.yml files..."));
    }

    let files = await glob(`${rootDirPath}/**/${kudosFile}`);
    for (let i = 0; i < files.length; i += 1) {
      try {
        const file = files[i];
        const data = fs.readFileSync(file);
        if (flags.debug) {
          console.error("file", file);
        }
        const kudos = YAML.parse(data.toString());
        // for each creator, add to creators list
        for (let j = 0; j < kudos.creators.length; j += 1) {
          const creator = kudos.creators[j];
          creator.context = creatorContext;

          creators.push(creator);
        }
      } catch (err) {
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    }
  }

  // do nodejs specific checks
  if (langs.has("nodejs")) {
    if (checks.has("contributors")) {
      // look for contributors in package.json files
      if (flags.debug) {
        debugLog(
          chalk.green("Checking for contributors in package.json files...")
        );
      }

      let files = await glob(`${rootDirPath}/**/package.json`);
      for (let i = 0; i < files.length; i += 1) {
        try {
          const file = files[i];
          const data = fs.readFileSync(file);
          if (flags.debug) {
            console.error("file", file);
          }
          const pkg = JSON.parse(data.toString());

          if (pkg.contributors && Array.isArray(pkg.contributors)) {
            // for each contributor, add to creators list
            for (let j = 0; j < pkg.contributors.length; j += 1) {
              let contributor = pkg.contributors[j];
              // check for string or object
              if (typeof contributor === "string") {
                contributor = parseAuthor(contributor);
              } else if (typeof contributor === "object") {
                // do nothing
              }

              // TODO: make into function to standardize and get as much info as possible out
              // example: if url is a github url, get github username
              // or the weight as well like flossbank does
              // npm view?
              contributor.context = {package: pkg.name, repository: pkg.repository, traceId, type: 'code'};
              creators.push(contributor);
            }
          }
          if (pkg.maintainers && Array.isArray(pkg.maintainers)) {
            // for each maintainers, add to creators list
            for (let j = 0; j < pkg.maintainers.length; j += 1) {
              let contributor = pkg.maintainers[j];

              // check for string or object
              if (typeof contributor === "string") {
                contributor = parseAuthor(contributor);
              } else if (typeof contributor === "object") {
                // do nothing
              }

              contributor.context = {package: pkg.name, repository: pkg.repository, traceId, type: 'code'};
              creators.push(contributor);
            }
          }

          // not common?
          if (pkg.authors && Array.isArray(pkg.authors)) {
            // for each author, add to creators list
            for (let j = 0; j < pkg.authors.length; j += 1) {
              let author = pkg.authors[j];

                            // check for string or object
                            if (typeof author === "string") {
                              author = parseAuthor(author);
                                          } else if (typeof author === "object") {
                              // do nothing
                            }
              
                            author.context = {package: pkg.name, repository: pkg.repository, traceId, type: 'code'};
                            creators.push(author);
            }
          }

          if (pkg.author) {
            if (typeof pkg.author === "string") {
              let author;
              try {
                author = parseAuthor(pkg.author);
              } catch (e) {
                log(e, {author});
              }
              author.context = {package: pkg.name, repository: pkg.repository, traceId, type: 'code'};
              creators.push(author);
            }
          }
        } catch (err) {
          console.error(err, chalk.red(`Error: ${err.message}`));
          if (flags.haltOnError) {
            // lots of garbage in most repos, so don't do this by default
            process.exit(1);
          }
        }
      }
    }
  }

  // serialize creators as ndjson
  // loop through creators, emit ndjson
  for (let i = 0; i < creators.length; i += 1) {
    const creator = creators[i];
    outData += JSON.stringify(creator) + "\n";
  }

  if (flags.outFile) {
    fs.writeFileSync(flags.outFile, outData);
  } else {
    log(outData);
  }
  process.exit(0);
};

export { exec };
