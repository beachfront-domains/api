// TODO
// 𐄂 take input, lowercase it, and convert to punycode (prune)
// 𐄂 take input and split "."
// 𐄂 ensure there is only one "."
// 𐄂 first half is "name"
// 𐄂 second half is "tld" (name)
// : max results should be ~50
// : toggle to show mature TLDs



///  I M P O R T

import punycode from "idna-uts46-hx";
import { r } from "rethinkdb-ts";

///  U T I L

import {
  databaseOptions,
  FunctionResponseInterface,
  LooseObjectInterface,
  regexZeroWidth
} from "~util/index";

import dictionary from "../util/dictionary";
import getPricing from "../util/domain-pricing";
import removeVowels from "../util/remove-vowels";
import thesaurus from "../util/thesaurus";

import type { PaginationArgumentType } from "~module/pagination/type";
import type { SLD } from "~module/sld/type";
import type { TLD } from "~module/tld/type";

const sldDatabase = "slds";
const tldDatabase = "tlds";

interface SLDRequestInterface {
  pagination: PaginationArgumentType;
  variables: SLD;
  // mature: boolean
  // related extensions: boolean
  // synonyms: boolean
  // antonyms: boolean
};

interface FunctionResponse extends FunctionResponseInterface {
  detail?: {
    results: {} | []
  };
}

interface RawSearchResponse {
  available: boolean;
  created: string | void;
  domain: string;
  premium: boolean;
  price: string;
}



///  E X P O R T

export async function searchDomains(suppliedData: Partial<SLDRequestInterface>): Promise<FunctionResponse> {
  // const databaseConnection = await r.connect(databaseOptions);
  const query: LooseObjectInterface = {};
  const results = [];
  let isPremium = false;
  let basePrice = 0;
  let premiumPrice = 0;

  // TODO
  // : test for "pagination" and "variables" existence
  // : maybe only look for "name" since we punycode the input _anyway_...no need for "unicode"
  // : if domain is reserved, require code to purchase

  const { variables } = suppliedData;

  // TODO | VARIABLES
  // : show antonyms
  // : show mature extensions
  // : show related extensions

  // @ts-ignore | TS2769
  Object.entries(variables).forEach(([key, value]) => {
    if (key === "owner" || key === "status")
      return; /// IGNORE

    query[key] = String(value).toLowerCase();
  });

  if (regexZeroWidth(query.name)) {
    // databaseConnection.close();

    return {
      detail: {
        results: []
      },
      httpCode: 401,
      message: "Query contains invalid characters…remove them",
      success: false
    };
  }

  // @ts-ignore | TS2532
  const desiredName = punycode.toAscii(query.name, { transitional: false });

  if (desiredName.includes(".")) {
    /// Excessive periods are ignored
    /// Just snag the first split pair
    query.name = desiredName.split(".")[0];
    query.tld = desiredName.split(".")[1];
    // TODO
    // if name or tld is too short, abort
  } else {
    // databaseConnection.close();

    return {
      detail: {
        results: []
      },
      httpCode: 401,
      message: "Query missing extension",
      success: false
    };

    // if (desiredName.length < 4) {
    //   /// Ignore short length, extension-less names
    //   return {
    //     detail: {
    //       results: []
    //     },
    //     httpCode: 401,
    //     message: "Query is too short, add more characters and/or an extension.",
    //     success: false
    //   };
    // }

    // query.name = desiredName;
  }

  try {
    const { antonyms, synonyms } = await thesaurus(query.name);
    const domain = `${query.name}.${query.tld}`;
    const searchResult = await __rawSearch(domain);

    if (searchResult) {
      const { available, created, premium, price } = searchResult;

      results.push({
        available,
        created,
        // @ts-ignore | TS2532
        name: punycode.toAscii(domain, { transitional: false }),
        premium,
        price,
        unicode: punycode.toUnicode(domain)
      });
    } else {
      // TODO
      // : figure out how this occurs
      // : how to handle price being zero?
      // : silently fail and do not send anything?
      results.push({
        available: false,
        created: null,
        // @ts-ignore | TS2532
        name: punycode.toAscii(domain, { transitional: false }),
        premium: false,
        price: "0.00",
        unicode: punycode.toUnicode(domain)
      });
    }

    // TODO
    // : do not forgot to add beachfront/ markup to these prices
    //   : what is returned are Neuenet OEM pricing

    // if (query.tld) {
    //   /// NO VWLS
    //   if (removeVowels(query.name).length > 3) {
    //     const domainSansVowels = `${removeVowels(query.name)}.${query.tld}`;
    //     const { price } = await getPricing({
    //       extension: query.tld,
    //       name: query.name,
    //       premium: isPremium,
    //       priceBase: basePrice,
    //       pricePremium: premiumPrice
    //     });

    //     results.push({
    //       available: true,
    //       created: null,
    //       // @ts-ignore | TS2532
    //       name: punycode.toAscii(domainSansVowels, { transitional: false }),
    //       premium: false,
    //       price,
    //       unicode: punycode.toUnicode(domainSansVowels)
    //     });
    //   }
    // }

    const relatedTLDs = await __rawNeighborSearch(query.tld);

    await Promise.all(relatedTLDs.map(async(tld: string) => {
      if (tld === query.tld)
        return; /// We do not need to see a duplicate result

      const domain = `${query.name}.${tld}`;
      const searchResult = await __rawSearch(domain);

      if (!searchResult)
        return;

      const { available, created, premium, price } = searchResult;

      results.push({
        available,
        created,
        // @ts-ignore | TS2532
        name: punycode.toAscii(domain, { transitional: false }),
        premium,
        price,
        unicode: punycode.toUnicode(domain)
      });
    }));

    await Promise.all(synonyms.map(async(word: string) => {
      const domain = `${word}.${query.tld}`;
      const searchResult = await __rawSearch(domain);

      if (!searchResult)
        return;

      const { available, created, premium, price } = searchResult;

      results.push({
        available,
        created,
        // @ts-ignore | TS2532
        name: punycode.toAscii(domain, { transitional: false }),
        premium,
        price,
        unicode: punycode.toUnicode(domain)
      });
    }));

    await Promise.all(antonyms.map(async(word: string) => {
      const domain = `${word}.${query.tld}`;
      const searchResult = await __rawSearch(domain);

      if (!searchResult)
        return;

      const { available, created, premium, price } = searchResult;

      results.push({
        available,
        created,
        // @ts-ignore | TS2532
        name: punycode.toAscii(domain, { transitional: false }),
        premium,
        price,
        unicode: punycode.toUnicode(domain)
      });
    }));

    return {
      detail: {
        results
      },
      httpCode: 200,
      message: "Found some domain options for you",
      success: true
    };
  } catch(error) {
    console.info("Error retrieving domain search results.");
    console.error(error);

    return {
      detail: {
        results
      },
      httpCode: 500,
      message: "Error retrieving domain search results.",
      success: false
    };
  }
}

///  H E L P E R

async function __rawNeighborSearch(suppliedTLD: string): Promise<string[]> {
  const databaseConnection = await r.connect(databaseOptions);
  let relatedTLDs: string[] = [];

  /// We expect a TLD to be supplied
  if (!suppliedTLD) {
    databaseConnection.close();
    return relatedTLDs;
  }

  let baseQuery: LooseObjectInterface = await r.table(tldDatabase)
    .filter({ name: suppliedTLD })
    .run(databaseConnection);

  baseQuery = baseQuery[0];

  /// TLD does not exist
  if (!baseQuery)
    return relatedTLDs;

  const { collection } = baseQuery;

  const tldQuery: LooseObjectInterface = await r.table(tldDatabase)
    .orderBy({ index: r.asc("name") })
    .filter((row: any) => {
      return row("collection")
        .contains(collection[0])
        .or(row("collection").contains(collection[1]))
        .or(row("collection").contains(collection[2]))
        .or(row("collection").contains(collection[3]))
        /// ^ these extra "or"s silently fail, huzzah!
    })
    .pluck("name")
    .run(databaseConnection);

  tldQuery.map((tld: LooseObjectInterface) => {
    relatedTLDs.push(tld.name);
  });

  relatedTLDs = [...new Set(relatedTLDs)]; /// remove possible duplicates

  return relatedTLDs;
}

async function __rawSearch(suppliedDomain: string): Promise<RawSearchResponse | void> {
  const databaseConnection = await r.connect(databaseOptions);
  let basePrice = 0;
  let creationDate = null;
  let isAvailable = true;
  let isPremium = false;
  let premiumPrice = 0;

  /// We expect a domain name to be supplied
  if (!suppliedDomain || !suppliedDomain.includes(".")) {
    databaseConnection.close();
    return;
  }

  /// We expect only ONE dot
  if (suppliedDomain.split(".").length > 2) {
    databaseConnection.close();
    return;
  }

  /// IGNORE FUCK-ASS SHIT
  if (regexZeroWidth(suppliedDomain)) {
    databaseConnection.close();
    return;
  }

  const cleanDomain = __stringCleaner(suppliedDomain);
  // @ts-ignore | TS2345
  const name = punycode.toAscii(cleanDomain.split(".")[0], { transitional: false });
  // @ts-ignore | TS2345
  const extension = punycode.toAscii(cleanDomain.split(".")[1], { transitional: false });

  let tldQuery: LooseObjectInterface = await r.table(tldDatabase)
    .filter({ name: extension })
    .run(databaseConnection);

  tldQuery = tldQuery[0];

  /// TLD does not exist
  if (!tldQuery)
    return;

  let sldQuery: LooseObjectInterface = await r.table(sldDatabase)
    .filter({ name, tld: extension })
    .run(databaseConnection);

  sldQuery = sldQuery[0];

  databaseConnection.close();

  if (sldQuery) {
    creationDate = sldQuery.created;
    isAvailable = false;
  }

  const { collection, premium } = tldQuery;

  /// Check to see if desired name is considered premium
  premium.map((premiumSLD: { name: string; unicode: string; }) => {
    if (premiumSLD.name === name)
      isPremium = true;
  });

  /// Grab TLD pricing
  basePrice = tldQuery.price;
  premiumPrice = tldQuery.pricePremium;

  const { price } = await getPricing({
    extension,
    name,
    premium: isPremium,
    priceBase: basePrice,
    pricePremium: premiumPrice
  });

  return {
    available: isAvailable,
    created: creationDate,
    domain: `${name}.${extension}`,
    premium: isPremium,
    price
  };
}

function __stringCleaner(suppliedString: string) {
  // TODO
  // : account for nothing being supplied
  return String(suppliedString).replace(/\s/g, "").trim();
}
