


/// import

import { log } from "dep/std.ts";

/// util

import sentimentAnalysis from "../utility/sentiment.ts";

/// var

const protectedTLDs = [
  "melanin"
];



/// export

export async function createCollection(suppliedArray: string[], suppliedExtension: string, hnsPrice: number) {
  const names: SearchResult[] = [];

  await Promise.all(suppliedArray.map(async(word: string) => {
    const positiveVibes = await blockNegativeNames(suppliedExtension, word);

    if (!positiveVibes)
      return;

    const domain = `${word}.${suppliedExtension}`;
    const searchResult = await findDomain(domain);

    if (!searchResult)
      return;

    const { available, created, extension, premium, priceUSD } = searchResult;

    names.push({
      available,
      created,
      extension,
      name: toASCII(domain),
      premium,
      priceHNS: __formatHNS(priceUSD, hnsPrice),
      priceUSD
    });
  }));

  // relatedTLDs = [...new Set(relatedTLDs)];
  // return names;

  return [...new Set(names)]; /// remove duplicates
}



/// helper

async function blockNegativeNames(tld: string, sld: string): Promise<boolean> {
  /// NOTE
  /// : returns true if sentiment is neutral/positive
  /// : returns false if sentiment is negative

  let positiveSentiment = true;

  if (!protectedTLDs.includes(tld))
    return positiveSentiment;

  /// NOTE
  /// : we don't want negative names being registered

  try {
    const sentiment = await sentimentAnalysis(sld);

    if (sentiment === "negative")
      positiveSentiment = false;
  } catch(error) {
    log.warn(`[${thisFilePath}]› Error analyzing sentiment.`);
    log.error(error);

    positiveSentiment = false;
  }

  return positiveSentiment;
}
