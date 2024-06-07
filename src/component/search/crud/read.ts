


/// import

import { Big } from "dep/x/big.ts";
import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  client,
  hnsPrice,
  isValidDomain,
  isValidSLD,
  // maxPaginationLimit,
  objectIsEmpty,
  personFromSession,
  randomSelection,
  stringTrim,
  validateZeroWidth
} from "src/utility/index.ts";

import e from "dbschema";
import { phase1 as tlds } from "src/utility/tlds.ts";

import type { LooseObject /*, SearchResponse*/ } from "src/utility/index.ts";
import type { Extension } from "../../extension/schema.ts";
import type { SearchRequest, SearchResult } from "../schema.ts";

const thisFilePath = import.meta.filename;

import getPricing from "../utility/domain-pricing.ts";
import removeVowels from "../utility/remove-vowels.ts";
import sentimentAnalysis from "../utility/sentiment.ts";
import thesaurus from "../utility/thesaurus.ts";

const protectedTLDs = [
  "melanin"
];



/// export

// TODO
// 𐄂 take input, lowercase it, and convert to punycode (prune)
// 𐄂 take input and split "."
// 𐄂 ensure there is only one "."
// 𐄂 first half is "name"
// 𐄂 second half is "tld" (name)
// : max results should be ~50
// : toggle to show mature TLDs

export default async(_root, args: SearchRequest, ctx, _info?) => {
  const { /*pagination,*/ params } = args;
  const pairResults = ([] as SearchResult[]);
  const owner = await personFromSession(ctx) || null;
  const query = ({} as LooseObject);
  const results = ([] as SearchResult[]);
  const vowelessResult = ([] as SearchResult[]);

  if (!params || objectIsEmpty(params)) {
    log.warn(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: results, viewer: owner };
  }

  // TODO
  // : cache result of this search for later retrieval...but what about domain availability?
  //   : that could change at any time

  /// NOTE
  /// `name` is a required param (for now)

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "name": {
        query[key] = toASCII(removeSpecialCharacters(String(value)));
        break;
      }

      default:
        break;
    }
  });

  function removeSpecialCharacters(input: string) {
    // Variable to track if the first period has been encountered
    let firstPeriodEncountered = false;

    // Function to replace special characters except for allowed patterns
    const replaceSpecialCharacters = (char: string): string => {
        const specialCharactersRegex = /(?<!x)n--|[^a-zA-Z0-9\s\-:;().]/g;

        if (char === "." && !firstPeriodEncountered) {
          firstPeriodEncountered = true;
          return char;
        }

        return char.replace(specialCharactersRegex, '');
    };

    // Process each character in the string
    let result = "";

    for (const char of input) {
      result += replaceSpecialCharacters(char);
    }

    return result;

    /// via ChatGPT 4o
  }

  // console.log(">>> query");
  // console.log(query);

  /// vibe check
  switch(true) {
    case !query.name:
    case query.name && query.name.length === 0: {
      log.warn(`[${thisFilePath}]› Vibe check failed.`);
      return { detail: results, viewer: owner };
    }

    case query.name && !isValidSLD(query.name.split(".")[0]):
    case query.name && validateZeroWidth(query.name): {
      log.warn(`[${thisFilePath}]› Query contains invalid characters.`);
      return { detail: results, viewer: owner };
    }

    default:
      break;
  }

  if (query.name.includes(".")) {
    if (query.name.split(".").length !== 2) {
      // TODO
      // : should we silently ignore this error?
      log.warn(`[${thisFilePath}]› Too many dots.`);
      return { detail: results };
    }

    query.extension = query.name.split(".")[1];
    query.sld = query.name.split(".")[0];
  } else {
    query.sld = query.name;
  }

  if (query.extension && query.extension.length < 3) {
    /// NOTE
    /// `ani` is the shortest extension we own
    log.warn(`[${thisFilePath}]› Invalid extension.\n${query.extension}/`);
    return { detail: results, viewer: owner };
  }

  if (!query.extension) {
    const randomExtensions = randomSelection(tlds, 50);
    const hns = await hnsPrice();

    await Promise.all(randomExtensions.map(async(randomExtension) => {
      const domain = `${query.sld}.${randomExtension}`;
      const searchResult = await findDomain(domain);
      const { available, created, extension, premium, priceUSD } = searchResult;

      results.push({
        available,
        created,
        extension,
        name: domain,
        pair: 0,
        paired: [],
        premium,
        priceHNS: __formatHNS(priceUSD, hns),
        priceUSD
      });
    }));

    return { detail: results, viewer: owner };
  }

  const doesExtensionExist = e.select(e.Extension, ext => ({
    ...e.Extension["*"],
    filter_single: e.op(ext.name, "=", query.extension)
  }));

  const extensionExistenceResult = await doesExtensionExist.run(client);

  if (!extensionExistenceResult) {
    log.warn(`[${thisFilePath}]› Extension does not exist.\n${query.extension}/`);
    return { detail: results, viewer: owner };
  }

  const extensionExists = (extensionExistenceResult as Extension);

  /// >>> TLD OVERRIDES

  const test = await blockNegativeNames(extensionExists.name, query.sld);

  if (!test)
    return { detail: results };

  // if (extensionExistenceResult.name === "melanin") {
  //   /// NOTE
  //   /// : we don't want negative names being registered

  //   log.info("melanin sentiment analysis...");

  //   try {
  //     const { sentiment } = await sentimentAnalysis(query.sld);

  //     if (sentiment === "negative")
  //       return { detail: results };
  //   } catch(error) {
  //     log.warn(`[${thisFilePath}]› Error analyzing sentiment.`);
  //     log.error(error);

  //     return { detail: results };
  //   }
  // }

  /// TLD OVERRIDES <<<

  const { pairs } = extensionExists;

  /// TODO
  /// : in UI, add sparkle to pair results

  if (pairs && pairs.length > 0) {
    let formattedPairs = [];

    /// TODO
    /// : fix `pairs` in EdgeDB database to properly do an array of extensions

    if (pairs[0].includes(","))
      pairs[0].split(",").map(pair => formattedPairs.push(pair.trim()));
    else
      formattedPairs = pairs;

    formattedPairs.map(async(pair) => {
      const domain = `${query.sld}.${pair}`;
      const searchResult = await findDomain(domain);
      const hns = await hnsPrice();

      if (!searchResult)
        return;

      const { available, created, premium, priceUSD } = searchResult;
      const hammockPrice = (priceUSD / 2).toFixed(2);

      pairResults.push({
        available,
        created,
        extension: extensionExists,
        name: domain,
        pair: 1,
        paired: [],
        premium,
        priceHNS: __formatHNS(hammockPrice, hns),
        priceUSD: hammockPrice
      });
    });
  }

  // TODO
  // RECOMMENDATION ENGINE

  /// NOTE
  /// > homoglyph detection and removal happens on the API side

  // TODO
  // : clean input
  // : cycle through array of portfolio extensions
  //   : how to do a cached search in RethinkDB?
  //   : run this search when API boots in order to have it cached?
  // : search registry API
  // : search internal API

  // TODO
  // : test for "pagination" and "variables" existence
  // : if domain is reserved, require code to purchase
  // : ignore invalid punycode (do this on Neuenet's API)

  // TODO
  // : prevent blank calls

  try {
    const { antonyms, synonyms } = await thesaurus(query.sld);
    const domain = query.name;
    const searchResult = await findDomain(domain);
    const hns = await hnsPrice();

    if (!searchResult) {
      // TODO
      // : figure out how this occurs
      //   : extension does not exist...maybe check for error response declaring so?

      /// NOTE
      /// : if HNS price comes back as zero,
      ///   hide it on the front-end (app)

      console.group("Zero domains found");
      console.info(query);
      console.groupEnd();

      log.warn(`[${thisFilePath}]› How the heck did this occur?`);
      return { detail: results, viewer: owner };
    }

    const { available, created, premium, priceUSD } = searchResult;

    results.push({
      available,
      created,
      extension: extensionExists,
      name: domain,
      pair: 0,
      paired: [],
      premium,
      priceHNS: __formatHNS(priceUSD, hns),
      priceUSD
    });

    // TODO
    // : add "h4ck3r m0d3"

    /// NO VWLS
    if (!query.sld.startsWith("xn--") && removeVowels(query.sld).length > 3) {
      const domainSansVowels = `${removeVowels(query.sld)}.${query.extension}`;

      /// Customer search may already lack vowels...no need to run this function if so
      if (domainSansVowels !== domain) {
        const searchResult = await findDomain(domainSansVowels);

        if (searchResult) {
          const { available, created, premium, priceUSD } = searchResult;

          vowelessResult.push({
            available,
            created,
            extension: extensionExists,
            name: domainSansVowels,
            pair: 0,
            paired: [],
            premium,
            priceHNS: __formatHNS(priceUSD, hns),
            priceUSD
          });
        }
      }
    }

    // TODO
    // : look up extension and find similar

    // const relatedTLDs = await __rawNeighborSearch(query.extension);

    // await Promise.all(relatedTLDs.map(async(extension: string) => {
    //   if (extension === query.extension)
    //     return; /// We do not need to see a duplicate result

    //   const domain = `${query.ascii}.${extension}`;
    //   const searchResult = await findDomain(domain);

    //   if (!searchResult)
    //     return;

    //   const { available, created, duration, premium, price } = searchResult;

    //   results.push({
    //     ascii: toASCII(domain),
    //     available,
    //     created,
    //     duration,
    //     hns: __formatHNS(price, hns),
    //     name: toUnicode(domain),
    //     premium,
    //     price
    //   });
    // }));

    const antonymsArray = protectedTLDs.includes(query.extension) ?
      [] :
      await createCollection(antonyms, query.extension, hns); // : SearchResult[]
    const synonymsArray = await createCollection(synonyms, query.extension, hns); // : SearchResult[]
    // const owner = await personFromSession(ctx);

    // TODO
    // : save results to database with an ID
    //   - send ID with response, so pagination can work

    pairResults.map(pair => {
      results[0].paired.push(pair.name);
    });

    return {
      detail: [
        // TODO
        // : randomize?
        ...new Set([
          ...results,
          ...pairResults,
          ...vowelessResult,
          ...synonymsArray,
          ...antonymsArray
        ])
      ],
      // pageInfo: {
      //   // cursor
      //   // hasNextPage
      //   // hasPreviousPage
      // },
      viewer: owner
    };
  } catch(error) {
    // TODO
    // : rate limiting?

    const { source } = error;

    log.warn(`[${thisFilePath}]› Error retrieving search results.`);
    log.error(Object.keys(error));
    // log.error(error);
    log.error(source);

    return { detail: results, viewer: owner };
  }
}



/// helper

async function createCollection(suppliedArray: string[], suppliedExtension: string, hnsPrice: number) {
  const names: SearchResult[] = [];

  await Promise.all(suppliedArray.map(async(word: string) => {
    const positiveVibes = await blockNegativeNames(suppliedExtension, word);

    // console.log(">>> positiveVibes");
    // console.log(word, positiveVibes);
    // console.log("<<<\n");

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
      pair: 0,
      paired: [],
      premium,
      priceHNS: __formatHNS(priceUSD, hnsPrice),
      priceUSD
    });
  }));

  // relatedTLDs = [...new Set(relatedTLDs)];
  // return names;

  return [...new Set(names)]; /// remove duplicates
}

async function findDomain(suppliedDomain: string) {
  if (!isValidDomain(suppliedDomain)) {
    log.warn(`[${thisFilePath}]› findDomain > Invalid domain\n${suppliedDomain}`);
    console.log(isValidDomain(suppliedDomain));
    return null;
  }

  const extension = suppliedDomain.split(".")[1];
  const sld = suppliedDomain.split(".")[0];
  let creationDate;
  let isAvailable = 1;
  let isPremium = 0;

  const doesExtensionExist = e.select(e.Extension, ext => ({
    ...e.Extension["*"],
    filter_single: e.op(ext.name, "=", extension)
  }));

  const doesDomainExist = e.select(e.Domain, domain => ({
    ...e.Domain["*"],
    filter_single: e.op(domain.name, "=", suppliedDomain)
  }));

  const extensionExistenceResult = await doesExtensionExist.run(client);
  const domainExistenceResult = await doesDomainExist.run(client);

  if (!extensionExistenceResult) {
    log.warn(`[${thisFilePath}]› findDomain > Extension doesn't exist: ${extension}`);
    return null;
  }

  const extensionExists = (extensionExistenceResult as Extension);

  if (domainExistenceResult) {
    creationDate = domainExistenceResult.created;
    isAvailable = 0;
  }

  const { premium, tier } = extensionExists;

  /// Check to see if desired name is considered premium
  premium && premium.map((premiumSLD: string) => {
    if (premiumSLD === sld)
      isPremium = 1;
  });

  /// Grab TLD pricing
  const { priceUSD } = await getPricing({ extension, premium: isPremium, sld, tier: String(tier) });

  return {
    available: isAvailable,
    created: creationDate,
    extension: extensionExists,
    name: suppliedDomain,
    paired: [],
    premium: isPremium,
    priceUSD
  };
}

async function blockNegativeNames(tld: string, sld: string): Promise<boolean> {
  /// NOTE
  /// : returns true if sentiment is neutral/positive
  /// : returns false if sentiment is negative

  let positiveSentiment = true;

  if (!protectedTLDs.includes(tld))
    return positiveSentiment;

  /// NOTE
  /// : we don't want negative names being registered

  // log.info(`${tld} > sentiment analysis...`);

  try {
    const sentiment = await sentimentAnalysis(sld);

    // log.info(`SENTIMENT >>> ${sentiment}\n${sld}`);

    if (sentiment === "negative")
      positiveSentiment = false;
  } catch(error) {
    log.warn(`[${thisFilePath}]› Error analyzing sentiment.`);
    log.error(error);

    positiveSentiment = false;
  }

  // log.info(`>>> SLD\n${sld}`)
  // log.info(positiveSentiment);
  // log.info("\n")

  return positiveSentiment;
}

function __formatHNS(priceInUSD: number|string, hns: number|string) {
  if (!hns || hns === 0 || hns === "0")
    return 0;

  return new Big(priceInUSD).div(new Big(hns)).toFixed(2);
}
