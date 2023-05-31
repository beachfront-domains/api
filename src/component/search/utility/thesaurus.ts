


/// import

import { toASCII } from "dep/x/tr46.ts";
import { wretch } from "dep/x/wretch.ts";

/// util

import { serviceThesaurus } from "src/utility/index.ts";

interface ThesaurusResponse {
  antonyms: string[];
  synonyms: string[];
}



/// export

export default async(suppliedWord: string): Promise<ThesaurusResponse> => {
  let antonyms: any[] = [];
  let synonyms: any[] = [];

  try {
    const data = await wretch(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(suppliedWord)}?key=${serviceThesaurus}`)
      .get()
      .json();

    if (!data![0]!.meta) {
      return {
        antonyms,
        synonyms
      };
    }

    const { ants, syns } = data![0]!.meta;

    antonyms = [...new Set(ants.flat())].sort();
    synonyms = [...new Set(syns.flat())].sort();

    antonyms = antonyms.map((word: string) => processWord(word))
      .filter((word: string) => word); /// Remove empty strings

    synonyms = synonyms.map((word: string) => processWord(word))
      .filter((word: string) => word); /// Remove empty strings
  } catch(_) {
    /// IGNORE
    /// Probably not a dictionary word
  }

  return {
    antonyms,
    synonyms
  };
}



/// helper

function processWord(word: string) {
  const unwantedCharactersRegex = /\w+[\W]\w+/g;

  if (word && !unwantedCharactersRegex.test(word))
    return toASCII(word.toLowerCase());
  else
    return null!; /// https://stackoverflow.com/a/66994737
}



// TODO
// : extract this file and apply to Neuenet
