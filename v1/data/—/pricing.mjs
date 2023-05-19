


///  I M P O R T

import Big from "big.js";
import got from "got";
import { order } from "@webb/order-object";

///  U T I L

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



///  E X P O R T

export async function getNiamiInfo(suppliedName) {
  const info = {
    rarity: null,
    rating: null
  };

  try {
    const response = await got(`https://api.niami.io/domain/${suppliedName}`).json();
    const { data } = response;

    if (!data) {
      console.log("— NO DATA");
      info.domain = suppliedName;
    } else {
      info.domain = data.name_unicode;
      info.rarity = data.rating.rarity;
      info.rating = data.rating.score;

      if (suppliedName === "beachfront") {
        const { base, premium } = generateTLDPricing(info.rarity);

        info.pricing = {
          base: new Big("3000").toFixed(2),
          premium: new Big("10000").toFixed(2)
        };
      } else {
        info.pricing = generateTLDPricing(info.rarity);
      }
    }
  } catch(error) {
    console.error(error.toString());
    // console.error("— ERROR");
    console.error(`"${suppliedName}" may need to be rated on Niami\n`);

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
