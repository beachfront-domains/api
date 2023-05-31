


/// import

import { log } from "dep/std.ts";
import { wretch } from "dep/x/wretch.ts";

/// util

import { serviceCoinmarketcap } from "src/utility/index.ts";

const thisFilePath = "/src/utility/hns-price.ts";



/// export

export default async(): Promise<number> => {
  let value = 0;

  try {
    // @ts-ignore | TS2339 [ERROR]: Property "data" does not exist on type "unknown".
    const { data } = await wretch("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=HNS&convert=USD")
      .headers({ "X-CMC_PRO_API_KEY": serviceCoinmarketcap })
      .get()
      .json();

    value = data?.HNS?.quote?.USD?.price || 0;
  } catch(_) {
    log.error(`[${thisFilePath}]› Error retrieving HNS price.`);
    value = 0;
  }

  return value;
}
