


/// import

import axios from "axios";
import cheerio from "cheerio";



/// export

export default async(suppliedWord: string): Promise<boolean> => {
  let isWord: boolean = false;

  try {
    const response = await axios.get(`https://www.dictionary.com/browse/${encodeURIComponent(String(suppliedWord))}`);

    if (response.status !== 200)
      return false;

    const $ = cheerio.load(response.data, { normalizeWhitespace: true });
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
