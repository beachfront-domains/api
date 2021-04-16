


///  N A T I V E

import fs from "fs";
import { join } from "path";

///  I M P O R T S

import Big from "big.js";
import TOML from "@ltd/j-toml";

///  U T I L

import { getNiamiInfo } from "./pricing.mjs";

const source = join(process.cwd(), "data", "neuenet.toml");
const sourceData = fs.readFileSync(source, "utf8");
const { tlds } = TOML.parse(sourceData, 1.0, "\n");

///  C O N S T A N T

const priceFloor = new Big("3.00");

const basicMultipleDefault = new Big("0.25");
const basicMultipleCommon = new Big("0.5");
const basicMultipleRare = new Big("1.5");
const basicMultipleEpic = new Big("2");
const basicMultipleLegendary = new Big("2.5");

const premiumMultipleDefault = new Big("5");
const premiumMultipleCommon = new Big("10");
const premiumMultipleRare = new Big("20");
const premiumMultipleEpic = new Big("30");
const premiumMultipleLegendary = new Big("40");

const basicPriceDefault = new Big("3.75");
const basicPriceCommon = new Big("4.50");
const basicPriceRare = new Big("7.50");
const basicPriceEpic = new Big("9.00");
const basicPriceLegendary = new Big("10.50");

const premiumPriceDefault = new Big("70.30");
const premiumPriceCommon = new Big("202.50");
const premiumPriceRare = new Big("112.50");
const premiumPriceEpic = new Big("2430.00");
const premiumPriceLegendary = new Big("4410.00");



///  P R O G R A M

generateTOML();



///  H E L P E R

function formatArray(suppliedArray) {
  return JSON.stringify(suppliedArray);
}

function formatArrayObjects(suppliedArrayObjects) {
  const cleanedArrayObjects = JSON.parse(JSON.stringify(suppliedArrayObjects));
  const cleanedArrayObjectsCount = cleanedArrayObjects.length;

  if (cleanedArrayObjects.length === 0)
    return "[]";

  let count = 0;
  let response = "[\n";

  cleanedArrayObjects.map(arrayObjects => {
    count++;
    response += `  { name = "${arrayObjects.name}", unicode = "${arrayObjects.unicode}" }`;

    if (count === cleanedArrayObjectsCount)
      response += "\n";
    else
      response += ",\n";
  });

  response += "]";
  return JSON.parse(JSON.stringify(response));
}

async function generateTOML() {
  try {
    let fileToWrite = "";

    fileToWrite += `title = "Neuenet TLDs"\n\n`;
    fileToWrite += `[tlds]\n\n\n\n`;

    await Promise.all(Object.keys(tlds).map(async(tld) => {
      const tldData = tlds[tld];
      const { pricing } = await getNiamiInfo(tldData.name);

      fileToWrite += `[tlds.${tldData.name}]\n`;
      fileToWrite += `collection = ${formatArray(tldData.collection)}\n`;
      fileToWrite += `name = "${tldData.name}"\n`;
      fileToWrite += `nope = ${formatArray(tldData.nope)}\n`;
      fileToWrite += `pair = ${formatArray(tldData.pair)}\n`;
      fileToWrite += `premium = ${formatArrayObjects(tldData.premium)}\n`;
      fileToWrite += `price = "${pricing.base}"\n`;
      fileToWrite += `pricePremium = "${pricing.premium}"\n`;
      fileToWrite += `reserved = ${formatArrayObjects(tldData.reserved)}\n`;
      fileToWrite += `unicode = "${tldData.unicode}"\n\n`;
    }));

    // TODO
    // 𐄂 ensure alphabetical order
    //   : https://github.com/pappasam/toml-sort

    fs.writeFileSync(join(process.cwd(), "data", "tlds.toml"), fileToWrite, "utf-8");

    console.log(">>> FILE WRITTEN");

    return;
  } catch(error) {
    console.log(error);
    console.log("<<<");

    return;
  }
}
