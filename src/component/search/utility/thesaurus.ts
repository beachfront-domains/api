


/// import

import { toASCII } from "dep/x/tr46.ts";
import { wretch } from "dep/x/wretch.ts";

/// util

import { serviceNinja } from "src/utility/index.ts";

interface ThesaurusResponse {
  antonyms: string[];
  synonyms: string[];
}



/// export

export default async(suppliedWord: string): Promise<ThesaurusResponse> => {
  let antonyms: any[] = [];
  let synonyms: any[] = [];

  try {
    const data = await wretch(
      `https://api.api-ninjas.com/v1/thesaurus?word=${encodeURIComponent(suppliedWord)}`, {
        headers: { "X-Api-Key": serviceNinja }
      })
      .get()
      .json();

    if (!data) {
      return {
        antonyms,
        synonyms
      };
    }

    const { antonyms: ants, synonyms: syns } = (data as { antonyms: Array<string>, synonyms: Array<string> });

    antonyms = [...new Set(ants.flat())].sort();
    synonyms = [...new Set(syns.flat())].sort();

    antonyms = antonyms.map((word: string) => processWord(word))
      .filter((word: string) => word); /// Remove empty strings

    synonyms = synonyms.map((word: string) => processWord(word))
      .filter((word: string) => word); /// Remove empty strings
  } catch(_) {
    /// IGNORE
    /// Probably not a dictionary word
    console.group("/src/component/search/utility/thesaurus.ts");
    console.error(_);
    console.groupEnd();
  }

  return {
    antonyms,
    synonyms
  };
}



/// helper

function processWord(word: string) {
  const unwantedCharactersRegex = /\w+[\W]/;

  if (word && !unwantedCharactersRegex.test(word))
    return toASCII(word.toLowerCase());
  else
    return null!; /// https://stackoverflow.com/a/66994737
}



// TODO
// : extract this file and apply to Neuenet
