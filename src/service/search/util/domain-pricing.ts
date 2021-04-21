


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



///  E X P O R T

export default async(suppliedContent: priceRequestInterface): Promise<priceResponse> => {
  const { extension, name, premium, priceBase, pricePremium } = suppliedContent;
  const isDictionaryWord = await dictionary(
    punycode.toUnicode(
      String(name)
    )
  );

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
        operand2 = new Big(priceBase).times(characterMultiplier1);
        break;

      case isTwoCharacters:
        operand2 = new Big(priceBase).times(characterMultiplier2);
        break;

      case isThreeCharacters:
        operand2 = new Big(priceBase).times(characterMultiplier3);
        break;
    }

    if (isDictionaryWord)
      operand3 = operand2.times(dictionaryMultiplier);
  } else {
    operand2 = new Big(priceBase);

    if (isDictionaryWord)
      operand3 = operand2.times(dictionaryMultiplier);
  }

  finalPrice = isPremium ?
    new Big(pricePremium).plus(operand1).plus(operand2).plus(operand3) :
    operand1.plus(operand2).plus(operand3);

  return {
    domain: `${name}.${extension}`,
    price: finalPrice.toFixed(2)
  };
}



// TODO
// : extract this file and apply to Neuenet
