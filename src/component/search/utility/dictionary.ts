


/// import

import { wretch } from "dep/x/wretch.ts";

/// util

import { serviceNinja } from "src/utility/index.ts";



/// export

export default async(suppliedWord: string): Promise<boolean> => {
  let isWord = false;

  try {
    const data = await wretch(
      `https://api.api-ninjas.com/v1/dictionary?word=${encodeURIComponent(suppliedWord)}`, {
        headers: { "X-Api-Key": serviceNinja }
      })
      .get()
      .json<{ valid?: boolean; }>();

    if (!data || !data.valid)
      return isWord;

    isWord = true;
  } catch(_) {
    /// IGNORE
    /// Probably not a dictionary word
    // const { status, url } = _;

    console.group("/src/component/search/utility/dictionary.ts");
    // console.error(status, url);
    console.error(_);
    console.error(`>>> ${suppliedWord}`);
    console.groupEnd();
  }

  return isWord;
}



// TODO
// : extract this file and apply to Neuenet
