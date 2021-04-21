


///  I M P O R T

import cheerio from "cheerio";
import got from "got";
import env from "vne";

///  U T I L

import { thesaurusKey } from "~util/index";

interface FunctionResponse {
  antonyms: string[];
  synonyms: string[];
}



///  E X P O R T

export default async(suppliedWord: string): Promise<FunctionResponse> => {
  const unwantedCharactersRegex = /\s|-|\./g;
  let antonyms: any = [];
  let synonyms: any = [];

  try {
    let response = await got(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(String(suppliedWord))}?key=${thesaurusKey}`).json();

    // if (response.statusCode !== 200) {
    //   return {
    //     antonyms,
    //     synonyms
    //   };
    // }

    if (!response) {
      return {
        antonyms,
        synonyms
      };
    }

    // @ts-ignore
    response = response[0].meta;
    // @ts-ignore
    const { ants, syns } = response;

    antonyms = [...new Set(ants.flat())].sort();
    synonyms = [...new Set(syns.flat())].sort();

    antonyms = antonyms.map((word: string) => {
      if (word && !unwantedCharactersRegex.test(word))
        return word;
    });

    synonyms = synonyms.map((word: string) => {
      if (word && !unwantedCharactersRegex.test(word))
        return word;
    });
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
