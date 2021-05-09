


///  I M P O R T

import Big from "big.js";
import got from "got";
import { order } from "@webb/order-object";

///  U T I L

const nameList = [
  /// A
  "acapella",
  "acappella",
  "afrobeat",
  "airtime",
  "alladat",
  "antifascist",
  "apocalypse",
  "architech",
  /// B
  "backend",
  "bald",
  "ballpoint",
  "banjo",
  "barnacle",
  "battlechip",
  "beachfront",
  "bigblackdick",
  "biochip",
  "biochips",
  "blvck",
  "bootsector",
  "braggart",
  "buttock",
  "buttocks",
  "buttsecks",
  /// C
  "canvass",
  "cerulean",
  "cherub",
  "chown",
  "chroot",
  "coda",
  "codesh",
  "colors",
  "conglomerate",
  "corsage",
  "craftwork",
  "creek",
  "crud",
  "cursor",
  /// D
  "datastore",
  "dedsec",
  "dedware",
  "dedwares",
  "dedwarez",
  "deepthrust",
  "deepthrusts",
  "dehost",
  "demex",
  "dingbat",
  "dingbats",
  "dinner",
  "diskette",
  "disrespect",
  "dist",
  "diviner",
  "diviners",
  "doomscroll",
  "dopameme",
  "drives",
  /// E
  "ecmascript",
  "editor",
  "exclamation",
  "external",
  "extracurricular",
  /// F
  "fairpoint",
  "futuros",
  "futurus",
  /// G
  "garterbelt",
  "glacier",
  "grundare",
  "guffaw",
  /// H
  "halide",
  "handyname",
  "hexa",
  "hieroglyph",
  "hieroglyphic",
  "hieroglyphics",
  "hieroglyphs",
  "homeroom",
  "hsla",
  "htop",
  "humanoid",
  "humanoids",
  "hyphen",
  "hyphop",
  /// I
  "illuminatus",
  "impresario",
  "inasmuch",
  "incorpo",
  "infocenter",
  "infolink",
  "insomuch",
  "interior",
  "internetpoint",
  "internetpoints",
  /// L
  "labia",
  "labio",
  "leapyear",
  "lefty",
  "lewk",
  "lewks",
  "libr",
  "liss",
  "litre",
  "loverboi",
  "loverboy",
  "lunch",
  "lynk",
  /// M
  "marshmallow",
  "maru",
  "melanin",
  "moemoe",
  "moodring",
  "moodrings",
  "mvc",
  /// N
  "neue",
  "newline",
  "nonsequitur",
  "novae",
  /// O
  "oooh",
  "operand",
  "outwork",
  /// P
  "pacote",
  "pagefault",
  "paizuri",
  "param",
  "params",
  "pharoah",
  "pigeon",
  "plethora",
  "pondering",
  "ponderings",
  "pynk",
  /// R
  "righty",
  /// S
  "savepoint",
  "savepoints",
  "scrot",
  "scrots",
  "secks",
  "shindeiru",
  "shinderu",
  "shmup",
  "sike",
  "slanguage",
  "snapback",
  "snapbacks",
  "soundfont",
  "soundteam",
  "soundteams",
  "southpaw",
  "starboard",
  "sushirrito",
  "svpply",
  "symbols",
  /// T
  "technobabble",
  "theblackfriday",
  "thecybermonday",
  "tiddies",
  "transmit",
  /// U
  "undernet",
  "univeige",
  "uranet",
  /// V
  "vendo",
  /// W
  "waveform",
  "webbrowser",
  "webrowser",
  "whizbang",
  /// X
  "xn--co8hfc",
  "xn--cr8h",
  "xn--gi8hva",
  "xn--pn8h7e",
  "xn--pr9hoa",
  "xn--qj8h57g",
  "xn--ri8hkv",
  "xra",
  "xref"
];

const priceFloor = new Big("3.00");

const basicMultipleDefault = new Big("0.25");
const basicMultipleCommon = new Big("0.5");
const basicMultipleRare = new Big("1");
const basicMultipleEpic = new Big("1.5");
const basicMultipleLegendary = new Big("2");

const premiumMultipleDefault = new Big("5");
const premiumMultipleCommon = new Big("10");
const premiumMultipleRare = new Big("20");
const premiumMultipleEpic = new Big("30");
const premiumMultipleLegendary = new Big("40");



///  P R O G R A M

// console.log(await Promise.all(go()));
// await Promise.all(go());

// function go() {
//   const results = [];

//   nameList.map(name => {
//     results.push(getNiamiInfo(name));
//   });

//   return results;
// }



///  E X P O R T

export async function getNiamiInfo(suppliedName) {
  const info = {
    rarity: null,
    rating: null
  };

  try {
    const response = await got(`https://api.niami.io/api/domain/${suppliedName}`).json();
    const { data } = response;

    if (!data) {
      console.log("— NO DATA");
      info.domain = suppliedName;
    } else {
      info.domain = data[0].domain;
      info.rarity = data[0].rarity;
      info.rating = data[0].niami_rating;

      if (suppliedName === "beachfront") {
        const { base, premium } = generateTLDPricing(data[0].rarity);

        info.pricing = {
          base: new Big("3000").toFixed(2),
          premium: new Big("10000").toFixed(2)
        };
      } else {
        info.pricing = generateTLDPricing(data[0].rarity);
      }
    }
  } catch(error) {
    console.error(error.toString());
    // console.error("— ERROR");
    console.error(`"${suppliedName}" may need to be rated on Niami`);

    /// Most likely, this is a 40x error.
    /// All that is needed is to go to the applicable page
    /// on Niami and trigger the rating.

    info.domain = suppliedName;
  } finally {
    return order(info);
  }
}



///  H E L P E R

function generateTLDPricing(suppliedRarity) {
  let basePrice = new Big("0");
  let premiumPrice = new Big("0");

  switch(suppliedRarity) {
    case "default":
      basePrice = priceFloor.plus(priceFloor.times(basicMultipleDefault));
      premiumPrice = basePrice.times(basePrice.times(premiumMultipleDefault));
      break;

    case "common":
      basePrice = priceFloor.plus(priceFloor.times(basicMultipleCommon));
      premiumPrice = basePrice.times(basePrice.times(premiumMultipleCommon));
      break;

    case "rare":
      basePrice = priceFloor.plus(priceFloor.times(basicMultipleRare));
      premiumPrice = basePrice.times(basePrice.times(premiumMultipleRare));
      break;

    case "epic":
      basePrice = priceFloor.plus(priceFloor.times(basicMultipleEpic));
      premiumPrice = basePrice.times(basePrice.times(premiumMultipleEpic));
      break;

    case "legendary":
      basePrice = priceFloor.plus(priceFloor.times(basicMultipleLegendary));
      premiumPrice = basePrice.times(basePrice.times(premiumMultipleLegendary));
      break;

    default:
      break;
  }

  return {
    base: basePrice.toFixed(2),
    premium: premiumPrice.toFixed(2)
  };
}
