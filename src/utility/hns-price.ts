


/// import

import { log } from "dep/std.ts";

/// util

import { coinmarketcapKey } from "src/utility/index.ts";
import type { LooseObject } from "src/utility/index.ts";

const thisFilePath = "/src/utility/hns/current-price.ts";



/// export

export default (async() => {
  let value = 0;

  try {
    const { data } = await fetch("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=HNS&convert=USD", {
      headers: { "X-CMC_PRO_API_KEY": coinmarketcapKey }
    });

    value = data?.data?.HNS?.quote?.USD?.price || 0;
  } catch(_) {
    log.error(`[${thisFilePath}]› Error retrieving HNS price.`);
    value = 0;
  }

  return value;
}) satisfies Promise<number>;
