


///  I M P O R T

import cheerio from "cheerio";
import got from "got";

///  U T I L

interface FunctionResponse {
  antonyms: string[];
  synonyms: string[];
}



///  E X P O R T

export default async(suppliedWord: string): Promise<FunctionResponse> => {
  let antonyms: string[] = [];
  let synonyms: string[] = [];

  try {
    const response = await got(`https://www.thesaurus.com/browse/${encodeURIComponent(String(suppliedWord))}`);

    if (response.statusCode !== 200) {
      return {
        antonyms,
        synonyms
      };
    }

    const $ = cheerio.load(response.body, { ignoreWhitespace: true });

    // @ts-ignore
    antonyms = $("body #antonyms").find("ul li a");
    // @ts-ignore
    synonyms = $("body #meanings").find("ul li a");

    // @ts-ignore
    antonyms = antonyms.map(function() {
      // @ts-ignore
      const text = $(this).text();

      if (!text.includes("-"))
        return text.trim();

      // @ts-ignore
    }).get().sort();

    // @ts-ignore
    synonyms = synonyms.map(function() {
      // @ts-ignore
      const text = $(this).text();

      if (!text.includes("-"))
        return text.trim();

      // @ts-ignore
    }).get().sort();
  } catch(error) {
    /// IGNORE
    /// Probably not a dictionary word
  } finally {
    return {
      antonyms,
      synonyms
    };
  }
}
