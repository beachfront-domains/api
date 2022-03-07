// TODO
// 𐄂 take input, lowercase it, and convert to punycode (prune)
// 𐄂 take input and split "."
// 𐄂 ensure there is only one "."
// 𐄂 first half is "name"
// 𐄂 second half is "tld" (name)
// : max results should be ~50
// : toggle to show mature TLDs



///  I M P O R T

import Big from "big.js";
// import { gql, request } from "graphql-request";
import { createClient, defaultExchanges, gql } from "@urql/core";
import fetch from "cross-fetch";
import punycode from "idna-uts46-hx";
import { r } from "rethinkdb-ts";
import type { RDatum } from "rethinkdb-ts";

///  U T I L

import { getDomain } from "~service/domain/index";
import { getExtension } from "~service/extension/index";

import {
  databaseOptions,
  LooseObject,
  regexZeroWidth,
  registryAPI
} from "~util/index";

import type {
  // Domain,
  // Extension,
  Customer,
  PaginationArgument,
  SearchRequest,
  SearchResult
} from "~schema/index";

import dictionary from "../utility/dictionary";
import getPricing from "../utility/domain-pricing";
import removeVowels from "../utility/remove-vowels";
import thesaurus from "../utility/thesaurus";

import hnsPrice from "~util/hns/current-price";

const sldDatabase = "domain";
const tldDatabase = "extension";

const registryClient = createClient({
  exchanges: defaultExchanges,
  fetch,
  url: registryAPI
});

// interface VariablesInterface {
//   antonym?: boolean;
//   mature?: boolean;
//   name: string;
//   relatedExtension?: boolean;
//   synonym?: boolean;
// };

// interface SLDRequestInterface {
//   pagination: PaginationArgument;
//   variables: VariablesInterface;
// };

// interface FunctionResponse extends FunctionResponseInterface {
//   detail?: {
//     results: {} | []
//   };
// }

// interface RawSearchResponse {
//   available: boolean;
//   created: string | void;
//   domain: string;
//   duration: number;
//   premium: boolean;
//   price: string;
// }



///  E X P O R T

export default async(data: SearchRequest, context: Customer|void) => {
  console.log(">>> data");
  console.log(data);
  console.log(context);

  const { options } = data;

  if (!options.name || options.name === "null") {
    // console.log("TODO: beachfront app autosends a blank response");
    return { detail: [] };
  }

  /// NOTE
  /// > homoglyph detection and removal happens on the API side

  // if (domainQuery.match(regexDomain))
  //   searchQueryStore.set(domainQuery);

  // console.log(">>> data");
  // console.log(data);

  // TODO
  // : clean input
  // : cycle through array of portfolio extensions
  //   : how to do a cached search in RethinkDB?
  //   : run this search when API boots in order to have it cached?
  // : search registry API
  // : search internal API

  const query: LooseObject = {};
  const results: SearchResult[] = [];
  let isPremium = false;
  let basePrice = 0;
  let premiumPrice = 0;

  // TODO
  // : test for "pagination" and "variables" existence
  // : maybe only look for "name" since we punycode the input _anyway_...no need for "unicode"
  // : if domain is reserved, require code to purchase
  // : ignore invalid punycode (do this on Neuenet's API)

  // const { variables } = data;

  Object.entries(options).forEach(([key, value]) => {
    query[key] = value;
  });

  if (regexZeroWidth(query.name)) {
    console.group("Query contains invalid characters");
    console.info(String(query.name));
    console.groupEnd();

    return {
      detail: []
    };
  }

  const desiredName = __stringCleaner(query.name);

  // TODO
  // : get query.name as well, punycode transitional
  // : prevent blank calls

  switch(true) {
    case desiredName.length === 0:
    case desiredName.split(".").length !== 2:
      console.log("TODO: no extension");
      return { detail: [] };

    default:
      break;
  }

  /// Excessive periods are silently ignored
  /// Just snag the first split pair
  query.ascii = desiredName.split(".")[0];
  query.extension = desiredName.split(".")[1];
  /// Re-use `query.name`
  query.name = punycode.toUnicode(query.ascii);

  // TODO
  // if name or tld is too short, abort

  try {
    const { antonyms, synonyms } = await thesaurus(query.name);
    const domain = `${query.ascii}.${query.extension}`;
    const searchResult = await __findDomain(domain);
    const hns = await hnsPrice();

    if (!searchResult) {
      // TODO
      // : figure out how this occurs
      //   : extension does not exist
      // : how to handle price being zero?
      // : silently fail and do not send anything?

      console.group("Zero domains found");
      console.info(query);
      console.groupEnd();

      return {
        detail: []
      };
    }

    const { available, created, duration, premium, price } = searchResult;

    results.push({
      ascii: punycode.toAscii(domain),
      available,
      created,
      duration,
      hns: __formatHNS(price, hns),
      name: punycode.toUnicode(domain),
      premium,
      price
    });

    /// NO VWLS
    if (removeVowels(query.name).length > 3) {
      const domainSansVowels = `${removeVowels(query.name)}.${query.extension}`;

      /// Customer search may already lack vowels...no need to run this function if so
      if (punycode.toUnicode(domainSansVowels) !== punycode.toUnicode(domain)) {
        const searchResult = await __findDomain(domainSansVowels);

        if (searchResult) {
          const { available, created, duration, premium, price } = searchResult;

          results.push({
            ascii: punycode.toAscii(domainSansVowels),
            available,
            created,
            duration,
            hns: __formatHNS(price, hns),
            name: punycode.toUnicode(domainSansVowels),
            premium,
            price
          });
        }
      }
    }

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
    //     ascii: punycode.toAscii(domain),
    //     available,
    //     created,
    //     duration,
    //     hns: __formatHNS(price, hns),
    //     name: punycode.toUnicode(domain),
    //     premium,
    //     price
    //   });
    // }));

    const antonymsArray: SearchResult[] = await __findNames(antonyms, query.extension, hns);
    const synonymsArray: SearchResult[] = await __findNames(synonyms, query.extension, hns);

    return {
      detail: [
        ...new Set([
          ...results,
          ...synonymsArray,
          ...antonymsArray
        ])
      ]
      // pageInfo: {
      //   // cursor
      //   // hasNextPage
      //   // hasPreviousPage
      // },
      // viewer: "" // customer object, only ID
    };
  } catch(error) {
    console.group("Error retrieving domain search results");
    console.error(String(error) + "\n");
    console.groupEnd();

    /// rate limiting?

    return {
      detail: results
    };
  }
}

///  H E L P E R
/*
async function __rawNeighborSearch(suppliedTLD: string): Promise<string[]> {
  const databaseConnection = await r.connect(databaseOptions);
  let relatedTLDs: string[] = [];

  /// We expect a TLD to be supplied
  if (!suppliedTLD) {
    databaseConnection.close();
    return relatedTLDs;
  }

  // TODO
  // : search registry API for `collection`

  // gotql.query('mygraphqlendpoint.com.br/api', query, options)
  //   .then(response => console.log(response.data))
  //   .catch(console.error)

  let baseQuery: LooseObject = await r.table(tldDatabase)
    .filter({ name: suppliedTLD })
    .run(databaseConnection);

  baseQuery = baseQuery[0];

  /// TLD does not exist
  if (!baseQuery)
    return relatedTLDs;

  const { collection } = baseQuery;

  const tldQuery: LooseObject = await r.table(tldDatabase)
    .orderBy({ index: r.asc("name") })
    .filter((row: RDatum) => {
      return row("collection")
        .contains(collection[0])
        .or(row("collection").contains(collection[1]))
        .or(row("collection").contains(collection[2]))
        .or(row("collection").contains(collection[3]));
        /// ^ these extra "or"s silently fail, huzzah!
    })
    .pluck("name")
    .run(databaseConnection);

  tldQuery.map((tld: LooseObject) => {
    relatedTLDs.push(tld.name); /// or ascii?
  });

  relatedTLDs = [...new Set(relatedTLDs)]; /// remove possible duplicates

  return relatedTLDs;
}
*/

async function __findNames(suppliedArray: string[], suppliedExtension: string, hnsPrice: number) {
  const names: SearchResult[] = [];

  await Promise.all(suppliedArray.map(async(word: string) => {
    const domain = `${word}.${suppliedExtension}`;
    const searchResult = await __findDomain(domain);

    if (!searchResult)
      return;

    const { available, created, duration, premium, price } = searchResult;

    names.push({
      ascii: punycode.toAscii(domain),
      available,
      created,
      duration,
      hns: __formatHNS(price, hnsPrice),
      name: punycode.toUnicode(domain),
      premium,
      price
    });
  }));

  return names;
}

async function __findDomain(suppliedDomain: string) {
  const ascii = suppliedDomain.split(".")[0];
  const extension = suppliedDomain.split(".")[1];
  let basePrice = 0;
  let creationDate = "";
  let isAvailable = true;
  let isPremium = false;
  let premiumPrice = 0;

  const query = gql`
    query GetDomain($options: DomainQuery) {
      domain(options: $options) {
        detail {
          ascii
          extension {
            collection
            id
            name
            premium
            price
            pricePremium
          }
          id
          name
          registrant {
            location
            name
          }
          registrar {
            id
            name
          }
        }
      }
    }
  `;

  const variables = {
    options: {
      name: suppliedDomain
    }
  }

  const internalDomainSearch = await getDomain({ options: { name: suppliedDomain }});
  const internalExtensionSearch = await getExtension({ options: { ascii: extension }});
  const { data: registrySearch } = await registryClient.query(query, variables).toPromise();

  if (!registrySearch)
    return;

  // if (internalDomainSearch.detail.id.length === 0) {
  //   console.log("Domain is not registered with beachfront/");
  // }

  if (internalExtensionSearch.detail.id.length === 0) {
    console.group("Extension does not exist");
    console.log(suppliedDomain);
    console.groupEnd();
    return false;
  }

  if (registrySearch.domain.detail.id.length !== 0)
    isAvailable = false;

  const {
    premium,
    price: extensionBasePrice,
    pricePremium: extensionPremiumPrice
  } = registrySearch.domain.detail.extension;

  /// Check to see if desired name is considered premium
  premium.map((premiumSLD: { ascii: string; }) => {
    if (premiumSLD.ascii === ascii)
      isPremium = true;
  });

  /// Grab TLD pricing
  const { price } = await getPricing({
    extension,
    name: punycode.toUnicode(ascii),
    premium: isPremium,
    priceBase: extensionBasePrice,
    pricePremium: extensionPremiumPrice
  });

  return {
    available: isAvailable,
    created: creationDate, /// if name is taken, populate this
    domain: suppliedDomain,
    duration: 2,
    premium: isPremium,
    // price: String(10),
    price
  };
}

function __formatHNS(priceInUSD: number|string, hns: number|string) {
  return new Big(priceInUSD).div(new Big(hns)).toFixed(2);
}

function __stringCleaner(suppliedString: string) {
  if (!suppliedString)
    return "";

  return punycode.toAscii(String(suppliedString).replace(/\s/g, "").trim());
}
