


///  I M P O R T

import cheerio from "cheerio";
import got from "got";



///  E X P O R T

export default async(suppliedWord: string): Promise<boolean> => {
  let isWord: boolean = false;

  try {
    const response = await got(`https://www.dictionary.com/browse/${encodeURIComponent(String(suppliedWord))}`);

    if (response.statusCode !== 200)
      return false;

    const $ = cheerio.load(response.body, { ignoreWhitespace: true });
    const word = $("body #top-definitions-section").find("h1").text().trim();

    if (word)
      isWord = true;
  } catch(error) {
    /// IGNORE
    /// Probably not a dictionary word
  } finally {
    return isWord;
  }
}



// TODO
// : extract this file and apply to Neuenet
