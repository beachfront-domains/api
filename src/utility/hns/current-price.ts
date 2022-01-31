


///  I M P O R T

import axios from "axios";

///  U T I L

import { coinmarketcapKey } from "~util/index";
import type { LooseObject } from "~util/index";



///  E X P O R T

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
