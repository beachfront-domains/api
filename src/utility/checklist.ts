


/// import

import { join } from "dep/std.ts";
import * as colors from "dep/std.ts";

/// util

import e from "dbschema";

const fileConfig = join(Deno.cwd(), "api.json");
const { bold: shellBold, red: shellRed } = colors;



/// export

export async function checklist() {
  const config = {
    database: "api",
    instance: "api",
    port: 3000
  };

  try {
    if (await ensureFileConfig(fileConfig)) {
      const { database, instance, port } = JSON.parse(await Deno.readTextFile(fileConfig));
      /// override base config with file config
      config.database = database;
      config.instance = instance;
      config.port = port;
    }

    ensureTable("Customer");
    ensureTable("Domain");
    ensureTable("Extension");
    ensureTable("Invoice");
    ensureTable("Payment");
    ensureTable("Session");

    return config;
  } catch(failure) {
    console.error(shellRed(shellBold(`[f] ${failure}`)));
    return config;
  }
}



/// helper

async function ensureFileConfig(filePath: string): Promise<boolean> {
  try {
    await Deno.lstat(filePath);
    return true;
  } catch(_) {
    // if (err instanceof Deno.errors.NotFound)
    //   return false;
    return false;
  }
}

function ensureTable(tableName: string) {
  if (!e[tableName])
    throw new Error(`Table "${tableName}" does not exist`);
}
