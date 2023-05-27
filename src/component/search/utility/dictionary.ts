


/// import

import { cheerio } from "dep/x/cheerio.ts";



/// export

export default (async(suppliedWord: string) => {
  let isWord: boolean = false;

  try {
    const response = await fetch(`https://www.dictionary.com/browse/${encodeURIComponent(suppliedWord)}`);

    if (response.status !== 200)
      return false;

    const $ = cheerio.load(response.data, { normalizeWhitespace: true });
    const word = $("body #top-definitions-section").find("h1").text().trim();

    if (word)
      isWord = true;
  } catch(_) {
    /// IGNORE
    /// Probably not a dictionary word
  }

  return isWord;
}) satisfies Promise<boolean>;



// TODO
// : extract this file and apply to Neuenet
