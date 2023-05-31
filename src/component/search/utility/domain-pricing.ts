


/// import

import { Big } from "dep/x/big.ts";
import { toUnicode } from "dep/x/tr46.ts";

/// util

import dictionary from "./dictionary.ts";

interface PriceRequest {
  extension: string;
  premium: number;
  sld: string;
  tier: string;
}

interface PriceResponse {
  domain: string;
  priceUSD: string;
}

const beachfrontMarkupBase = {
  default: new Big("5.25"),
  common: new Big("10.60"),
  rare: new Big("15"),
  epic: new Big("20.50"),
  legendary: new Big("25"),
  mythic: new Big("2000")
};

const beachfrontMarkupPremium = {
  default: new Big("50.69"),
  common: new Big("100.50"),
  rare: new Big("150"),
  epic: new Big("200.50"),
  legendary: new Big("250"),
  mythic: new Big("5000")
};

const multiplier = {
  dictionary: new Big("0.3"),
  oneCharacter: new Big("40"),
  premium: new Big("600"),
  threeCharacters: new Big("20"),
  twoCharacters: new Big("30")
};

const registryPricingBase = {
  default: new Big("3.75"),
  common: new Big("4.50"),
  rare: new Big("6"),
  epic: new Big("7.50"),
  legendary: new Big("9"),
  mythic: new Big("3000")
};

const registryPricingPremium = {
  default: new Big("70.31"),
  common: new Big("202.50"),
  rare: new Big("720"),
  epic: new Big("1687.50"),
  legendary: new Big("3240"),
  mythic: new Big("10000")
};



/// export

export default async(args: PriceRequest): Promise<PriceResponse> => {
  const { extension, premium, sld, tier } = args;

  // TODO
  // : if `sld` is an emoji, skip `isDictionaryWord` function

  const isDictionaryWord = await dictionary(toUnicode(sld));
  const isPremium = premium;

  let finalPrice = new Big(0);
  let operand1 = new Big(0); /// multiplier.premium
  let operand2 = new Big(0); /// tier price base * multiplier.*character(s)
  let operand3 = new Big(0); /// multiplier.dictionary

  if (isPremium === 1)
    operand1 = multiplier.premium;

  if (sld.length < 4) {
    switch(sld.length) {
      case 1:
      default: {
        operand2 = new Big(generateMarkup(tier)).times(multiplier.oneCharacter);
        break;
      }

      case 2: {
        operand2 = new Big(generateMarkup(tier)).times(multiplier.twoCharacters);
        break;
      }

      case 3: {
        operand2 = new Big(generateMarkup(tier)).times(multiplier.threeCharacters);
        break;
      }
    }

    if (isDictionaryWord)
      operand3 = operand2.times(multiplier.dictionary);
  } else {
    operand2 = new Big(generateMarkup(tier));

    if (isDictionaryWord)
      operand3 = operand2.times(multiplier.dictionary);
  }

  finalPrice = isPremium === 1 ?
    new Big(generateMarkup(tier, 1))
      .plus(operand1)
      .plus(operand2)
      .plus(operand3) :
        operand1
          .plus(operand2)
          .plus(operand3);

  return {
    domain: `${sld}.${extension}`,
    priceUSD: finalPrice.toFixed(2)
  };
}



/// helper

function generateMarkup(suppliedTier: string, isPremium?: number) {
  switch(suppliedTier.toUpperCase()) {
    case "DEFAULT": {
      return isPremium === 1 ?
        registryPricingPremium.default.plus(beachfrontMarkupPremium.default) :
        registryPricingBase.default.plus(beachfrontMarkupBase.default);
    }

    case "COMMON": {
      return isPremium === 1 ?
        registryPricingPremium.common.plus(beachfrontMarkupPremium.common) :
        registryPricingBase.common.plus(beachfrontMarkupBase.common);
    }

    case "RARE": {
      return isPremium === 1 ?
        registryPricingPremium.rare.plus(beachfrontMarkupPremium.rare) :
        registryPricingBase.rare.plus(beachfrontMarkupBase.rare);
    }

    case "EPIC": {
      return isPremium === 1 ?
        registryPricingPremium.epic.plus(beachfrontMarkupPremium.epic) :
        registryPricingBase.epic.plus(beachfrontMarkupBase.epic);
    }

    case "LEGENDARY": {
      return isPremium === 1 ?
        registryPricingPremium.legendary.plus(beachfrontMarkupPremium.legendary) :
        registryPricingBase.legendary.plus(beachfrontMarkupBase.legendary);
    }

    case "MYTHIC":
    default: {
      return isPremium === 1 ?
        registryPricingPremium.mythic.plus(beachfrontMarkupPremium.mythic) :
        registryPricingBase.mythic.plus(beachfrontMarkupBase.mythic);
    }
  }
}



// TODO
// : extract this file and apply to Neuenet
