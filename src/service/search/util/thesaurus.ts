


///  I M P O R T

import got from "got";

///  U T I L

import { LooseObjectInterface, thesaurusKey } from "~util/index";

interface FunctionResponse {
  antonyms: string[];
  synonyms: string[];
}

interface APIResponse {
  def: Array<LooseObjectInterface[]>,
  fl: string,
  hwi: {
    hw: string
  },
  meta: {
    ants: string[],
    id: string,
    offensive: boolean,
    section: string,
    src: string,
    stems: string[],
    syns: string[],
    target: LooseObjectInterface[],
    uuid: string
  },
  shortdef: string[]
}



///  E X P O R T

export default async(suppliedWord: string): Promise<FunctionResponse> => {
  const unwantedCharactersRegex = /\s|-|\./g;
  let antonyms: any = [];
  let synonyms: any = [];

  try {
    let response: APIResponse[] = await got(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(String(suppliedWord))}?key=${thesaurusKey}`).json();

    if (!response || !response[0] || !response[0].meta) {
      return {
        antonyms,
        synonyms
      };
    }

    const words = response[0].meta;
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
    }).filter((word: string) => word); /// Remove empty string
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
