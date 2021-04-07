


///  I M P O R T

import ensureDatabase from "@webb/ensure-database";
import ensureTable from "@webb/ensure-table";
import print from "@webb/console";

///  U T I L

import app from "./server";
import { apiPort, databaseOptions, environment } from "~util/index";
import { initializeAdmin } from "~service/human";
import { initializeTLDs } from "~service/tld";
import { name as appName } from "~root/package.json";



///  B E G I N

const runIt = async() => {
  try {
    await ensureDatabase({ name: "beachfront", options: databaseOptions });
    await ensureTable({ name: "keys", index: "key", options: databaseOptions });
    await ensureTable({ name: "passes", index: "pass", options: databaseOptions });
    await ensureTable({ name: "tokens", index: "token", options: databaseOptions });
    await ensureTable({ name: "customers", index: ["email", "username"], options: databaseOptions });
    await ensureTable({ name: "tlds", index: ["name", "unicode"], options: databaseOptions });
    await ensureTable({ name: "slds", index: ["name", "unicode"], options: databaseOptions });

    await initializeAdmin();
    await initializeTLDs();
    // TODO INIT — sld
  } catch(anyError) {
    console.error(anyError);
  }

  app.listen(apiPort);
  process.stdout.write(logPrompt());
}

runIt();



///  H E L P E R

function logPrompt() {
  return [
    "\n",
    `${print.gray(":::")} `,
    `${print.green("⚡")} `,
    `${print.bold(print.white(apiPort))} `,
    `${print.gray("|")} `,
    `${print.bold(print.white(appName))} `,
    `${print.gray("|")} `,
    `${print.bold(print.white(environment))}`,
    "\n\n"
  ].join("");
}
