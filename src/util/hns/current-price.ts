


///  I M P O R T

import got from "got";

///  U T I L

import { coinmarketcapKey, LooseObjectInterface } from "~util/index";



///  E X P O R T

export default async(): Promise<number> => {
  let value = 0;

  try {
    const body: LooseObjectInterface = await got("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=HNS&convert=USD", {
      headers: { "X-CMC_PRO_API_KEY": coinmarketcapKey }
    }).json();

    value = body?.data?.HNS?.quote?.USD?.price || 0;
  } catch(error) {
    console.error(error.toString());
    console.error("<<<");
    value = 0;
  } finally {
    return value;
  }
}
