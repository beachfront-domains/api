


/// util

import { LooseObject, thesaurusKey } from "src/utility/index.ts";

interface ThesaurusResponse {
  antonyms: string[];
  synonyms: string[];
}



/// export

export default (async(suppliedWord: string) => {
  const unwantedCharactersRegex = /[^\s-\.]/g;
  let antonyms: any = [];
  let synonyms: any = [];

  try {
    const { data } = await fetch(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(suppliedWord)}?key=${thesaurusKey}`);

    switch(true) {
      case !data:
      case !data[0]:
      case !data[0].meta: {
        return {
          antonyms,
          synonyms
        };
      }

      default:
        break;
    }

    const words = data[0].meta;
    const { ants, syns } = words;

    antonyms = [...new Set(ants.flat())].sort();
    synonyms = [...new Set(syns.flat())].sort();

    antonyms = antonyms.map((word: string) => {
      if (word && !unwantedCharactersRegex.test(word))
        return word;
      else
        return "";
    }).filter((word: string) => word); /// Remove empty strings

    synonyms = synonyms.map((word: string) => {
      if (word && !unwantedCharactersRegex.test(word))
        return word;
      else
        return "";
    }).filter((word: string) => word); /// Remove empty strings
  } catch(_) {
    /// IGNORE
    /// Probably not a dictionary word
  }

  return {
    antonyms,
    synonyms
  };
}) satisfies ThesaurusResponse;



// TODO
// : extract this file and apply to Neuenet
