


/// import

import axios from "axios";

/// util

import { LooseObject, thesaurusKey } from "src/utility/index.ts";

interface FunctionResponse {
  antonyms: string[];
  synonyms: string[];
}



/// export

export default async(suppliedWord: string): Promise<FunctionResponse> => {
  const unwantedCharactersRegex = /[^\s-\.]/g;
  let antonyms: any = [];
  let synonyms: any = [];

  try {
    const { data } = await axios.get(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(String(suppliedWord))}?key=${thesaurusKey}`);

    if (!data || !data[0] || !data[0].meta) {
      return {
        antonyms,
        synonyms
      };
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
