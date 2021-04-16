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
};

interface FunctionResponse extends FunctionResponseInterface {
  detail?: {
    results: {} | []
  };
}



///  E X P O R T

// @ts-ignore
export async function _searchDomainsRAW(suppliedData: Partial<SLDRequestInterface>): Promise<FunctionResponse> {
  // TBD
}

export async function searchDomains(suppliedData: Partial<SLDRequestInterface>): Promise<FunctionResponse> {
  const databaseConnection = await r.connect(databaseOptions);
  const query: LooseObjectInterface = {};
  const results = [];
  let isPremium = false;
  let premiumPrice = 0.00;

  // TODO
  // : test for "pagination" and "variables" existence
  // : maybe only look for "name" since we punycode the input _anyway_...no need for "unicode"
  // : if domain is reserved, require code to purchase

  const { variables } = suppliedData;

  // @ts-ignore | TS2769
  Object.entries(variables).forEach(([key, value]) => {
    if (key === "owner" || key === "status")
      return; /// IGNORE

    query[key] = String(value).toLowerCase();
  });

  // console.log(suppliedData); // pagination: {...}, variables: {...}
  // console.log("——————————");

  // @ts-ignore | TS2532
  if (regexZeroWidth(query.name)) {
    // TODO
    // : add homoglyph detection
    databaseConnection.close();

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

  // console.log("name", desiredName);
  // console.log(desiredName.split("."));
  // console.log();

  if (desiredName.includes(".")) {
    /// Excessive periods are ignored
    /// Just snag the first split pair
    query.name = desiredName.split(".")[0];
    query.tld = desiredName.split(".")[1];
  } else {
    if (desiredName.length < 3) {
      /// Ignore short length, extension-less names
      return {
        detail: {
          results: []
        },
        httpCode: 401,
        message: "Query is too short, add more characters and/or an extension.",
        success: false
      };
    }

    query.name = desiredName;
  }

  if (query.tld) {
    let tldQuery: LooseObjectInterface = await r.table(tldDatabase)
      .filter({ name: query.tld })
      .run(databaseConnection);

    try {
      tldQuery = tldQuery[0];

      // TODO
      // : query for SLD to test if premium

      console.log(tldQuery);
      console.log(";; tld");

      if (!tldQuery) {
        databaseConnection.close();

        return {
          detail: {
            results: []
          },
          httpCode: 401,
          message: "Extension does not exist (at least, not on beachfront/)…Yet?",
          success: false
        };
      }

      const { premium } = tldQuery;

      premium.map((premiumSLD: any) => {
        if (premiumSLD.name === query.name) {
          isPremium = true;
          // TODO
          // : set "premiumPrice" to "premiumSLD.price"
          premiumPrice = 500.75;
        }
      });
    } catch(error) {
      /// IGNORE
    }
  }

  const { antonyms, synonyms } = await thesaurus(query.name);

  // console.log();
  // await thesaurus(query.name);
  console.log(";; thesaurus");

  // @ts-ignore TS2740: Type "any[]" is missing the following properties from type "Customer": <...>.
  let response: LooseObjectInterface = await r.table(sldDatabase)
    .filter(query)
    .run(databaseConnection);

  try {
    // response = response[0];
    console.log(response);
    console.log(";; sld info");
    databaseConnection.close();

    // console.log(await dictionary(punycode.toUnicode(query.name))); // boolean
    // console.log(";; ooh");

    if (response.length === 0) {
      console.log("desired domain is available");

      // expiry: string
      // id: string
      // // marketplace: boolean
      // name: string
      // owner: Customer
      // registrar: string
      // status: Status
      // tld: string
      // unicode: string

      if (query.tld) {
        const domain = `${query.name}.${query.tld}`;

        results.push({
          available: true,
          created: null,
          // @ts-ignore | TS2532
          name: punycode.toAscii(domain, { transitional: false }),
          premium: isPremium,
          price: premiumPrice,
          unicode: punycode.toUnicode(domain)
        });
      }
    } else {
      console.log("desired domain may be taken but look at all these other options");
    }

    // TODO
    // : pull down list of premium SLDs when querying TLD
    // : match premium SLD list when mapping thesaurus words
    // : also have to check that these thesaurus words are not taken
    // : UGH, recursive crap!

    /// NO VWLS
    results.push({
      available: true,
      created: null,
      // @ts-ignore | TS2532
      name: punycode.toAscii(`${removeVowels(query.name)}.${query.tld}`, { transitional: false }),
      premium: false,
      price: 0.00,
      unicode: punycode.toUnicode(`${removeVowels(query.name)}.${query.tld}`)
    });

    synonyms.map((word: string) => {
      const domain = `${word}.${query.tld}`;

      results.push({
        available: true,
        created: null,
        // @ts-ignore | TS2532
        name: punycode.toAscii(domain, { transitional: false }),
        premium: false,
        price: 0.00,
        unicode: punycode.toUnicode(domain)
      });
    });

    antonyms.map((word: string) => {
      const domain = `${word}.${query.tld}`;

      results.push({
        available: true,
        created: null,
        // @ts-ignore | TS2532
        name: punycode.toAscii(domain, { transitional: false }),
        premium: false,
        price: 0.00,
        unicode: punycode.toUnicode(domain)
      });
    });

    // if (!response)
    //   return {};

    // @ts-ignore TS2740: Type "LooseObjectInterface" is missing the following properties from type "Customer": <...>.
    // return response;

    return {
      detail: {
        // results: response
        results
      },
      httpCode: 200,
      message: "Found some domain options for you",
      success: true
    };
  } catch(error) {
    databaseConnection.close();

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
