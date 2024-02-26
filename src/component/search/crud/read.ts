


/// import

import { Big } from "dep/x/big.ts";
import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  // accessControl,
  client,
  hnsPrice,
  // log,
  // maxPaginationLimit,
  objectIsEmpty,
  personFromSession,
  randomSelection,
  stringTrim,
  validateZeroWidth
} from "src/utility/index.ts";

import tlds from "src/utility/tlds.ts";

import e from "dbschema";

import type { LooseObject /*, SearchResponse*/ } from "src/utility/index.ts";
import type { Extension } from "../../extension/schema.ts";
import type { SearchRequest, SearchResult } from "../schema.ts";

const thisFilePath = import.meta.filename;

// import dictionary from "../utility/dictionary.ts";
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
    log.warning(`[${thisFilePath}]› Missing required parameter(s).`);
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
        query[key] = toASCII(         /// remove ambiguity
          String(
            stringTrim(String(value)) /// remove excess
          ).replace(/\s/g, "")        /// remove spaces
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
      return { detail: results, viewer: owner };
    }

    case query.name && validateZeroWidth(query.name): {
      log.warning(`[${thisFilePath}]› Query contains invalid characters.`);
      return { detail: results, viewer: owner };
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
    log.warning(`[${thisFilePath}]› Invalid extension.\n${query.extension}/`);
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
    log.warning(`[${thisFilePath}]› Extension does not exist.\n${query.extension}/`);
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
  //     log.warning(`[${thisFilePath}]› Error analyzing sentiment.`);
  //     log.error(error);

  //     return { detail: results };
  //   }
  // }

  /// TLD OVERRIDES <<<

  const { pairs } = extensionExists;

  /// TODO
  /// : in UI, add sparkle to pair results

  if (pairs && pairs.length > 0) {
    pairs.forEach(async(pair) => {
      const domain = `${query.sld}.${pair}`;
      const searchResult = await findDomain(domain);
      const hns = await hnsPrice();

      if (!searchResult)
        return;

      const { available, created, premium, priceUSD } = searchResult;

      /// TODO
      /// : add `pair` key, boolean

      pairResults.push({
        available,
        created,
        extension: extensionExists,
        name: domain,
        premium,
        priceHNS: __formatHNS(priceUSD, hns),
        priceUSD
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

      log.warning(`[${thisFilePath}]› How the heck did this occur?`);
      return { detail: results, viewer: owner };
    }

    const { available, created, premium, priceUSD } = searchResult;

    results.push({
      available,
      created,
      extension: extensionExists,
      name: domain,
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

    log.warning(`[${thisFilePath}]› Error retrieving search results.`);
    log.error(Object.keys(error));
    // log.error(error);
    log.error(source);

    return { detail: results, viewer: owner };
  }
}



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
      premium,
      priceHNS: __formatHNS(priceUSD, hnsPrice),
      priceUSD
    });
  }));

  // relatedTLDs = [...new Set(relatedTLDs)];
  // return names;

  return [...new Set(names)]; /// remove duplicates
}

// TODO
// : create function that takes an SLD and applies it to 25 random TLDs
// : randomize the final list as well

function isValidDomain(domain: string) {
  /// TODO
  /// : add to utility.ts

  const domainRegex = /^(?!-)([A-Za-z0-9-\p{Emoji}]{1,63}(?<!-)\.?)+(0x01|0xa0|acapella|acappella|adults|afrobeat|afrohaus|airhead|airtime|alladat|ani|antifascist|aperitif|apocalypse|architech|astre|astres|astronautica|astronautical|await|backend|balaklava|bald|baldy|ballpoint|banjo|baremetal|bareserver|bareservers|barnacle|battlechip|battlechips|beachfront|bigblackdick|bigmood|biochip|biochips|bitmap|bitmaps|blvck|bootsector|braggart|brandalism|brinner|bubblegum|buttock|buttocks|buttsecks|canvass|caters|cerulean|cherub|chillwave|chown|chroot|cinephile|coda|codesh|colors|compile|conglomerate|coroutine|corsage|craftwork|creek|crud|cursor|cursors|cxnt|datastore|datastores|datastruct|datastructs|dedsec|dedware|dedwares|dedwarez|deepthrust|deepthrusts|dehost|demex|destroy|digestif|dingbat|dingbats|dinner|diskette|diskettes|disrespect|dist|diviner|diviners|divinity|doomscroll|doomsurf|dopameme|dribble|dribbles|drives|ecmascript|editor|editors|endif|exclamation|executable|external|extracurricular|fairpoint|freq|futuros|futurus|gamestart|garterbelt|glacier|gleefresh|goodscroll|grandiose|grundare|guffaw|halide|handyname|herbivore|hereinafter|hexa|hieroglyph|hieroglyphic|hieroglyphics|hieroglyphs|highball|homeroom|horoscopy|hsla|htop|httpx|humanoid|humanoids|hyphen|hyphop|illuminatus|impresario|inasmuch|incorpo|indexof|infocenter|infolink|initial|initials|innanet|insomuch|interior|internetpoint|internetpoints|jargon|jomo|kitsune|kolor|kolors|labia|labio|leapyear|lefty|lewk|lewks|libr|liek|lieu|liss|litre|localroot|lolwut|loupe|loverboi|loverboy|lunch|lynk|marshmallow|maru|marvelous|megatech|meicho|melanin|microsystem|microsystems|mideast|millennium|milliamp|millihenry|millivolt|moemoe|monochrome|moodring|moodrings|moonroom|mvc|nameserve|nbsp|nendoroid|nendoroids|neue|newline|nonsequitur|normie|normy|novae|nullstack|onprem|oooh|operand|outwork|pacote|pagefault|paizuri|param|parameter|params|pearlstone|permafrost|pharaoh|pharaohs|pigeon|playsmart|plethora|pluriverse|pondering|ponderings|postseason|postseasons|potemkin|puns|pxem|pynk|righty|rootserve|saturnalia|savepoint|savepoints|scrot|scrots|secks|serene|shimbun|shinbun|shindeiru|shinderu|shitpost|shitposts|shmup|shorthand|sidereal|sike|slanguage|snapback|snapbacks|soie|soundfont|soundfonts|soundteam|soundteams|southpaw|starboard|sugoi|sunroom|sushirrito|svpply|symbols|technobabble|telephoto|theblackfriday|thecybermonday|thique|tiddies|transmit|uchu|undernet|univeige|uranet|usenetwork|vendo|viii|ware|waveform|webbrowser|webrowser|webscape|websurf|weirdo|whizbang|woebegone|wordplay|xn--apritif-cya|xn--beaut-fsa|xn--co8hfc|xn--cr8h|xn--gi8hva|xn--pn8h7e|xn--pr9hoa|xn--qj8h57g|xn--r9j070h|xn--ri8hkv|xn--seorita-5za|xn--uch-70a|xor|xra|xref|yaga|yitties|yitty|yoink|yuck|yuletide|zaddy)$/u; /// `u` flag is for Unicode (emoji) support
  return domainRegex.test(domain);

  /*
    const domainFormatRegex = /^(?!-)([A-Za-z0-9-\p{Emoji}]{1,63}(?<!-)\.?)+[A-Za-z]{2,}$/u;
    const whitelist = ["0x01", "0xa0", "acapella", "afrobeat", ...]; // Add all your whitelisted domains here

    function isValidDomain(domain: string): boolean {
      // Check if the domain matches the general format
      if (!domainFormatRegex.test(domain)) return false;

      // Check if the domain is in the whitelist
      return whitelist.includes(domain);
    }

    /// recommended by ChatGPT4
  */
}

async function findDomain(suppliedDomain: string) {
  if (!isValidDomain(suppliedDomain)) {
    log.warning(`[${thisFilePath}]› findDomain > Invalid domain\n${suppliedDomain}`);
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
    log.warning(`[${thisFilePath}]› findDomain > Extension doesn't exist`);
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
    log.warning(`[${thisFilePath}]› Error analyzing sentiment.`);
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
