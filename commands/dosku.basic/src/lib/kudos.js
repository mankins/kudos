import chalk from "chalk";

import envPaths from "env-paths";
import fs from "fs";
import mkdirp from "mkdirp";
// import Database from "better-sqlite3";
import Knex from "knex";
import { currentCohort } from "./date.js";

const paths = envPaths("dosku-basic");

const devLog = process.env.KUDOS_DEBUG === "true" ? console.log : () => {};

const create = async (kudo) => {
  // log(chalk.green('create'));

  // check requirements
  if (!kudo.identifier) {
    throw new Error("identifier is required");
  }

  // setup defaults TODO: TypeScript
  kudo.cohort = kudo.cohort || currentCohort(kudo.createTime);

  kudo.user = kudo.user || 1; // local user id
  kudo.weight = kudo.weight || 100; //  100 / n
  if (kudo.weight > 100) {
    kudo.weight = 100;
  }
  kudo.createTime = kudo.createTime || new Date().toISOString();
  kudo.description = kudo.description || "";

  return kudo; // TODO: validate data
};

const initDb = async () => {
  // STEP 1: make sure data directory exists
  const kudosDataDir = paths.data;
  try {
    if (fs.existsSync(kudosDataDir)) {
      //file exists
      devLog(`${kudosDataDir} -> kudosDataDir exists`);
    } else {
      if (kudosDataDir && kudosDataDir.length > 0) {
        const made = mkdirp.sync(kudosDataDir); // die on error
        if (made) {
          devLog(`${kudosDataDir} -> kudosDataDir created`);
        } else {
          devLog(`${kudosDataDir} -> kudosDataDir not created`);
        }
      } else {
        throw new Error("kudosDataDir is not defined");
      }
    }
  } catch (err) {
    throw new Error(err);
  }

  // STEP 2: make sure db exists, return it
  const kudosDbPath = `${kudosDataDir}/kudos.db`;
  const db = Knex({
    client: "better-sqlite3",
    connection: {
      filename: kudosDbPath,
    },
    debug: process.env.KUDOS_DEBUG === "true",
    useNullAsDefault: true,
  });

  const exists = await db.schema.hasTable("kudos");
  if (!exists) {
    devLog("Creating Kudos Database");
    const uuidGenerationRaw =
      db.client.config.client.indexOf("sqlite3") !== -1
        ? `(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`
        : `uuid_generate_v4()`;

    await db.schema.createTable("kudos", function (t) {
      t.uuid("id").primary().defaultTo(db.raw(uuidGenerationRaw));
      t.smallint("user").notNullable();
      t.string("cohort", 10).notNullable();
      t.string("identifier", 255).notNullable();
      t.float("weight").defaultTo(1);
      t.timestamp("create_time").defaultTo(db.fn.now());
      t.string("description", 255).notNullable();
    });
  } else {
    devLog("exists");
  }

  return db;
};

// example implementation of kudos inker
const store = async (kudo) => {
  // make sure paths exist, db initialized
  const db = await initDb();

  const result = await db("kudos").insert({
    user: kudo.user,
    cohort: kudo.cohort,
    identifier: kudo.identifier,
    weight: (parseFloat(kudo.weight) || 100) / 100,
    create_time: kudo.createTime,
    description: kudo.description,
  });
  if (result) {
    devLog(chalk.green("stored"));
  }
  db.destroy();
  return result ? true : false;
};

// returns the entries for a given cohort
const getCohortEntries = async ({ user = 1, cohort }) => {
  const db = await initDb();

  const result = await db("kudos")
    .select(
      "identifier",
      "cohort",
      "weight",
      "create_time",
      "description",
      "id"
    )
    .where("cohort", "=", cohort)
    .where("user", "=", user)
    .orderBy("create_time", "asc");

  db.destroy();

  return result;
};

const resetCohort = async ({ user = 1, cohort }) => {
  const db = await initDb();

  const statement = `delete from kudos where cohort = ? and user = ?`;
  const values = [cohort, user];
  return db.prepare(statement).run(values);
};

export { create, getCohortEntries, resetCohort, store };