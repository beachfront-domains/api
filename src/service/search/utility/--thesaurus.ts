


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
  let antonyms: any = [];
  let synonyms: any = [];

  try {
    const response = await got(`https://www.thesaurus.com/browse/${encodeURIComponent(String(suppliedWord))}`);

    if (response.statusCode !== 200) {
      return {
        antonyms,
        synonyms
      };
    }

    const $ = cheerio.load(response.body);
    const unwantedCharactersRegex = /\s|-|\./g;

    antonyms = $("body #antonyms").find("ul li a");
    synonyms = $("body #meanings").find("ul li a");

    antonyms = antonyms.map((word: any) => {
      word = antonyms[word];
      const text = $(word).text().trim();

      if (!unwantedCharactersRegex.test(text))
        return text;
    }).get().sort();

    synonyms = synonyms.map((word: any) => {
      word = synonyms[word];
      const text = $(word).text().trim();

      if (!unwantedCharactersRegex.test(text))
        return text;
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



// TODO
// : extract this file and apply to Neuenet
