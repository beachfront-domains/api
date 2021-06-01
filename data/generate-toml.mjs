


///  N A T I V E

import fs from "fs";
import { join } from "path";

///  I M P O R T

import Big from "big.js";
import TOML from "@ltd/j-toml";

///  U T I L

import { getNiamiInfo } from "./pricing.mjs";

const source = join(process.cwd(), "data", "neuenet.toml");
const sourceData = fs.readFileSync(source, "utf8");
const { tlds } = TOML.parse(sourceData, 1.0, "\n");

const getNameValue = (suppliedName, index) => new Promise(res => {
  setTimeout(async() => {
    const { pricing } = await getNiamiInfo(suppliedName);
    res({ pricing });
    /// give Niami a break, with a throttle
  }, 25 * index);
});



///  P R O G R A M

generateTOML();



///  H E L P E R

function formatArray(suppliedArray) {
  return JSON.stringify(suppliedArray).split(",").join(", ");
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

    await Promise.all(Object.keys(tlds).map(async(tld, index) => {
      const tldData = tlds[tld];
      const { pricing } = await getNameValue(tldData.name, index);

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

      // TODO
      // : show progress
      // : PROCESSED NAME # OF TLD.LENGTH
    }));

    fs.writeFileSync(join(process.cwd(), "data", "tlds.toml"), fileToWrite, "utf-8");

    console.log(">>> FILE WRITTEN");

    return;
  } catch(error) {
    console.log(error);
    console.log("<<<");

    return;
  }
}
