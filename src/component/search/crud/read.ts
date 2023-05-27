


/// import

import { Big } from "dep/x/big.ts";
import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  accessControl,
  databaseParams,
  hnsPrice,
  // log,
  // maxPaginationLimit,
  objectIsEmpty,
  personFromSession,
  stringTrim,
  validateZeroWidth
} from "src/utility/index.ts";

import type { DetailObject, LooseObject, SearchResponse } from "src/utility/index.ts";
import type { SearchRequest, SearchResult } from "../schema.ts";

const thisFilePath = "/src/component/search/crud/read.ts";

import dictionary from "../utility/dictionary.ts";
import getPricing from "../utility/domain-pricing.ts";
import removeVowels from "../utility/remove-vowels.ts";
import thesaurus from "../utility/thesaurus.ts";



/// export

// TODO
// 𐄂 take input, lowercase it, and convert to punycode (prune)
// 𐄂 take input and split "."
// 𐄂 ensure there is only one "."
// 𐄂 first half is "name"
// 𐄂 second half is "tld" (name)
// : max results should be ~50
// : toggle to show mature TLDs

export default (async(_root, args: SearchRequest, ctx, _info?) => {
  const client = createClient(databaseParams);
  const { /*pagination,*/ params } = args;
  const query: LooseObject = {};
  const results: SearchResult[] = [];
  let basePrice = 0;
  let isPremium = false;
  let premiumPrice = 0;

  if (objectIsEmpty(params)) {
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
    return { detail: results };
  }

  // TODO
  // : cache result of this search for later retrieval...but what about domain availability?
  //   : that could change at any time

  /// NOTE
  /// `name` is a required param (for now)

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "name": {
        query[key] = toASCII(  /// remove ambiguity
          String(
            stringTrim(value)  /// remove excess
          ).replace(/\s/g, "") /// remove spaces
        );
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  switch(true) {
    case !query.name:
    case query.name && query.name.length === 0: {
      log.warning(`[${thisFilePath}]› Vibe check failed.`);
      return { detail: results };
    }

    case query.name && validateZeroWidth(query.name): {
      log.warning(`[${thisFilePath}]› Query contains invalid characters.`);
      return { detail: results };
    }

    default:
      break;
  }

  if (query.name.includes(".")) {
    if (query.name.split(".").length !== 2) {
      // TODO
      // : should we silently ignore this error?
      log.warning(`[${thisFilePath}]› Too many dots.`);
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
    log.warning(`[${thisFilePath}]› Invalid extension.`);
    return { detail: results };
  }

  const doesExtensionExist = e.select(e.Extension, ext => ({
    ...e.Extension["*"],
    filter_single: e.op(ext.name, "=", extension)
  }));

  const extensionExistenceResult = await doesExtensionExist.run(client);

  if (!extensionExistenceResult) {
    log.warning(`[${thisFilePath}]› Extension does not exist.`);
    return { detail: results };
  }

  const { pairs } = extensionExistenceResult;

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
  // : maybe only look for "name" since we punycode the input _anyway_...no need for "unicode"
  // : if domain is reserved, require code to purchase
  // : ignore invalid punycode (do this on Neuenet's API)

  // TODO
  // : prevent blank calls

  try {
    const { antonyms, synonyms } = await thesaurus(query.sld);
    const domain = query.name;
    const searchResult = await __findDomain(domain);
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

      log.warning(`[${thisFilePath}]› How the heck did this occur?`);
      return { detail: results };
    }

    const { available, created, premium, priceUSD } = searchResult;

    results.push({
      available,
      created,
      domain,
      premium,
      priceHNS: __formatHNS(priceUSD, hns),
      priceUSD
    });

    /// NO VWLS
    if (!query.sld.startsWith("xn--") && removeVowels(query.sld).length > 3) {
      const domainSansVowels = `${removeVowels(query.sld)}.${query.extension}`;

      /// Customer search may already lack vowels...no need to run this function if so
      if (domainSansVowels !== domain) {
        const searchResult = await __findDomain(domainSansVowels);

        if (searchResult) {
          const { available, created, premium, priceUSD } = searchResult;

          results.push({
            available,
            created,
            domain: domainSansVowels,
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
    //   const searchResult = await __findDomain(domain);

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

    const antonymsArray: SearchResult[] = await __findNames(antonyms, query.extension, hns);
    const synonymsArray: SearchResult[] = await __findNames(synonyms, query.extension, hns);
    const owner = await personFromSession(ctx);

    return {
      detail: [
        // TODO
        // : randomize?
        ...new Set([
          ...results,
          ...synonymsArray,
          ...antonymsArray
        ])
      ],
      // pageInfo: {
      //   // cursor
      //   // hasNextPage
      //   // hasPreviousPage
      // },
      viewer: owner ? owner : null
    };
  } catch(error) {
    // TODO
    // : rate limiting?

    log.warning(`[${thisFilePath}]› Error retrieving search results.`);
    log.error(error);

    return { detail: results };
  }
}) satisfies SearchResponse;



/// helper

// async function __rawNeighborSearch(suppliedTLD: string): Promise<string[]> {
//   const databaseConnection = await r.connect(databaseParams);
//   let relatedTLDs: string[] = [];

//   /// We expect a TLD to be supplied
//   if (!suppliedTLD) {
//     databaseConnection.close();
//     return relatedTLDs;
//   }

//   // TODO
//   // : search registry API for `collection`

//   // gotql.query('mygraphqlendpoint.com.br/api', query, options)
//   //   .then(response => console.log(response.data))
//   //   .catch(console.error)

//   let baseQuery: LooseObject = await r.table(tldDatabase)
//     .filter({ name: suppliedTLD })
//     .run(databaseConnection);

//   baseQuery = baseQuery[0];

//   /// TLD does not exist
//   if (!baseQuery)
//     return relatedTLDs;

//   const { collection } = baseQuery;

//   const tldQuery: LooseObject = await r.table(tldDatabase)
//     .orderBy({ index: r.asc("name") })
//     .filter((row: RDatum) => {
//       return row("collection")
//         .contains(collection[0])
//         .or(row("collection").contains(collection[1]))
//         .or(row("collection").contains(collection[2]))
//         .or(row("collection").contains(collection[3]));
//         /// ^ these extra "or"s silently fail, huzzah!
//     })
//     .pluck("name")
//     .run(databaseConnection);

//   tldQuery.map((tld: LooseObject) => {
//     relatedTLDs.push(tld.name); /// or ascii?
//   });

//   relatedTLDs = [...new Set(relatedTLDs)]; /// remove possible duplicates

//   return relatedTLDs;
// }

async function __findNames(suppliedArray: string[], suppliedExtension: string, hnsPrice: number) {
  const names: SearchResult[] = [];

  await Promise.all(suppliedArray.map(async(word: string) => {
    const domain = `${word}.${suppliedExtension}`;
    const searchResult = await __findDomain(domain);

    if (!searchResult)
      return;

    const { available, created, premium, priceUSD } = searchResult;

    names.push({
      available,
      created,
      domain: toASCII(domain),
      premium,
      priceHNS: __formatHNS(priceUSD, hnsPrice),
      priceUSD
    });
  }));

  return names;
}

async function __findDomain(suppliedDomain: string) {
  const extension = suppliedDomain.split(".")[1];
  const sld = suppliedDomain.split(".")[0];
  let creationDate = null;
  let isAvailable = true;
  let isPremium = false;

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

  /// NOTE
  /// We've checked for extension's existence before this function
  /// was called, no need for error checking. We call this again for
  /// pricing information.

  if (domainExistenceResult) {
    creationDate = domainExistenceResult.created;
    isAvailable = false;
  }

  const { premium, tier } = extensionExistenceResult;

  /// Check to see if desired name is considered premium
  premium.map((premiumSLD: string) => {
    if (premiumSLD === sld)
      isPremium = true;
  });

  /// Grab TLD pricing
  const { priceUSD } = await getPricing({ extension, premium: isPremium, sld, tier });

  return {
    available: isAvailable,
    created: creationDate,
    domain: suppliedDomain,
    premium: isPremium,
    priceUSD
  };
}

function __formatHNS(priceInUSD: number|string, hns: number|string) {
  if (!hns || hns === 0 || hns === "0")
    return 0;

  return new Big(priceInUSD).div(new Big(hns)).toFixed(2);
}
