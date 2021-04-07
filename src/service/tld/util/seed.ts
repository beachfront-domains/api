


///  N A T I V E

import fs from "fs";
import { join } from "path";

///  I M P O R T S

import TOML from "@ltd/j-toml";
import { r } from "rethinkdb-ts";

///  U T I L

import {
  databaseOptions,
  printError,
  // printInfo,
  printSuccess
} from "~util/index";

const source = join(process.cwd(), "data", "tlds.toml");
const sourceData = fs.readFileSync(source, "utf8");
const tldDatabase = "tlds";
const { tlds } = TOML.parse(sourceData, 1.0, "\n");



///  E X P O R T

export default async() => {
  const databaseConnection = await r.connect(databaseOptions);
  const tldQuery = await r.table(tldDatabase).run(databaseConnection);
  // printInfo(`# of TLDs: ${Object.keys(tlds).length}`);

  try {
    const queryResult = tldQuery[0];

    if (queryResult) {
      databaseConnection.close();
      printSuccess("tlds exist");

      return {
        detail: {
          tlds: queryResult
        },
        httpCode: 201,
        message: "TLDs exist",
        success: true
      };
    }

    await Promise.all(Object.keys(tlds).map(async(tld: any) => {
      const tldData = tlds[tld];

      const dataToInsert = {
        name: tldData.name,
        nope: tldData.nope,
        pair: tldData.pair,
        premium: tldData.premium,
        // TODO: check if I need to do parsing specific to USD currency
        price: parseInt(tldData.price),
        reserved: tldData.reserved,
        unicode: tldData.unicode
      };

      await r.table(tldDatabase)
        .insert({
          ...dataToInsert,
          created: new Date(),
          updated: new Date()
        })
        .run(databaseConnection);
    }));

    databaseConnection.close();
    printSuccess("TLDs created");

    return {
      httpCode: 201,
      message: "TLDs created",
      success: true
    };
  } catch(error) {
    databaseConnection.close();
    printError("tld query failed");
  }
};
