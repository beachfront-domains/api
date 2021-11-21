


///  I M P O R T

import Big from "big.js";
import punycode from "idna-uts46-hx";

///  U T I L

import dictionary from "./dictionary";

const characterMultiplier1 = new Big("40"); /// one character
const characterMultiplier2 = new Big("30"); /// two characters
const characterMultiplier3 = new Big("20"); /// three characters
const dictionaryMultiplier = new Big("0.3");
const premiumNameMultiplier = new Big("600");

interface priceRequestInterface {
  extension: string;
  name: string;
  premium: boolean;
  priceBase: number | string;
  pricePremium: number | string;
};

interface priceResponse {
  domain: string;
  price: string;
}

///  T I E R   U T I L

const nnDefaultBasic = new Big("3.75");
const nnDefaultPremium = new Big("70.31");
const markupDefaultBasic = new Big("5.25");
const markupDefaultPremium = new Big("50.69");

const nnCommonBasic = new Big("4.50");
const nnCommonPremium = new Big("202.50");
const markupCommonBasic = new Big("10.60");
const markupCommonPremium = new Big("100.50");

const nnRareBasic = new Big("6");
const nnRarePremium = new Big("720");
const markupRareBasic = new Big("15");
const markupRarePremium = new Big("150");

const nnEpicBasic = new Big("7.50");
const nnEpicPremium = new Big("1687.50");
const markupEpicBasic = new Big("20.50");
const markupEpicPremium = new Big("200.50");

const nnLegendaryBasic = new Big("9");
const nnLegendaryPremium = new Big("3240");
const markupLegendaryBasic = new Big("25");
const markupLegendaryPremium = new Big("250");

const nnMythicBasic = new Big("3000");
const nnMythicPremium = new Big("10000");
const markupMythicBasic = new Big("2000");
const markupMythicPremium = new Big("5000");



///  E X P O R T

function generateMarkup(suppliedPrice: number | string, isPremium?: boolean) {
  // console.log(suppliedPrice);
  // console.log(typeof suppliedPrice);
  // console.log(isPremium);
  // console.log("———");

  if (isPremium) {
    switch (suppliedPrice) {
      case "70.31":
        return nnDefaultPremium.plus(markupDefaultPremium);

      case "202.50":
        return nnCommonPremium.plus(markupCommonPremium);

      case "720":
        return nnRarePremium.plus(markupRarePremium);

      case "1687.50":
        return nnEpicPremium.plus(markupEpicPremium);

      case "3240":
        return nnLegendaryPremium.plus(markupLegendaryPremium);

      case "10000":
      default:
        return nnMythicPremium.plus(markupMythicPremium);
    }
  } else {
    switch (suppliedPrice) {
      case "3.75":
        return nnDefaultBasic.plus(markupDefaultBasic);

      case "4.50":
        return nnCommonBasic.plus(markupCommonBasic);

      case "6.00":
        return nnRareBasic.plus(markupRareBasic);

      case "7.50":
        return nnEpicBasic.plus(markupEpicBasic);

      case "9.00":
        return nnLegendaryBasic.plus(markupLegendaryBasic);

      case "3000":
      default:
        return nnMythicBasic.plus(markupMythicBasic);
    }
  }
}

export default async(suppliedContent: priceRequestInterface): Promise<priceResponse> => {
  const { extension, name, premium, priceBase, pricePremium } = suppliedContent;
  const isDictionaryWord = await dictionary(punycode.toUnicode(String(name)));

  // console.log(tldQuery);
  // console.log(">>> —")

  let finalPrice = new Big(0);
  let isPremium = false;
  let isOneCharacter = false;
  let isTwoCharacters = false;
  let isThreeCharacters = false;
  let operand1 = new Big(0); /// premiumNameMultiplier
  let operand2 = new Big(0); /// priceBase * characterMultiplier
  let operand3 = new Big(0); /// dictionaryMultiplier

  switch(true) {
    case premium:
      isPremium = true;
      break;

    case String(name).length === 1:
      isOneCharacter = true;
      break;

    case String(name).length === 2:
      isTwoCharacters = true;
      break;

    case String(name).length === 3:
      isThreeCharacters = true;
      break;

    default:
      break;
  }

  if (isPremium)
    operand1 = premiumNameMultiplier;

  if (String(name).length < 4) {
    switch(true) {
      case isOneCharacter:
      default:
        operand2 = new Big(generateMarkup(priceBase)).times(characterMultiplier1);
        break;

      case isTwoCharacters:
        operand2 = new Big(generateMarkup(priceBase)).times(characterMultiplier2);
        break;

      case isThreeCharacters:
        operand2 = new Big(generateMarkup(priceBase)).times(characterMultiplier3);
        break;
    }

    if (isDictionaryWord)
      operand3 = operand2.times(dictionaryMultiplier);
  } else {
    operand2 = new Big(generateMarkup(priceBase));

    if (isDictionaryWord)
      operand3 = operand2.times(dictionaryMultiplier);
  }

  finalPrice = isPremium ?
    new Big(generateMarkup(pricePremium, true))
      .plus(operand1)
      .plus(operand2)
      .plus(operand3) :
        operand1
          .plus(operand2)
          .plus(operand3);

  // console.log(`${name}.${extension}`);
  // console.log(priceBase);
  // console.log(finalPrice + "\n");

  return {
    domain: `${name}.${extension}`,
    price: finalPrice.toFixed(2)
  };
}



// TODO
// : extract this file and apply to Neuenet
