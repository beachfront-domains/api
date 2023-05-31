


/// import

import { cheerio } from "dep/x/cheerio.ts";
import { wretch } from "dep/x/wretch.ts";



/// export

export default async(suppliedWord: string): Promise<boolean> => {
  let isWord = false;

  try {
    const response = await wretch(`https://www.dictionary.com/browse/${encodeURIComponent(suppliedWord)}`)
      .get()
      .res();

    if (response.status !== 200)
      return false;

    // let $ = cheerio.load('<div>Hello</div>', null, false);
    // console.log($.html());

    // // "<div>Hello</div>"
    // https://github.com/cheeriojs/cheerio/issues/1031#issuecomment-748677236

    const $ = cheerio.load(await response.text());
    const word = $("body #top-definitions-section").find("h1").text().trim();

    if (word)
      isWord = true;
  } catch(_) {
    /// IGNORE
    /// Probably not a dictionary word
  }

  return isWord;
}



// TODO
// : extract this file and apply to Neuenet
