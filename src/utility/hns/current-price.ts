


/// import

import axios from "axios";

/// util

import { coinmarketcapKey } from "src/utility/index.ts";
import type { LooseObject } from "src/utility/index.ts";



/// export

export default async(): Promise<number> => {
  let value = 0;

  try {
    const { data } = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=HNS&convert=USD", {
      headers: { "X-CMC_PRO_API_KEY": coinmarketcapKey }
    });

    value = data?.data?.HNS?.quote?.USD?.price || 0;
  } catch(error) {
    console.group("[module] utility/hns/current-price");
    console.error((error as any).toString());
    console.groupEnd();
    value = 0;
  } finally {
    return value;
  }
}
