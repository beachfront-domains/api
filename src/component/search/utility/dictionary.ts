


/// import

import { log } from "dep/std.ts";
import { wretch } from "dep/x/wretch.ts";

/// util

import { serviceNinja } from "src/utility/index.ts";

const thisFilePath = import.meta.filename;



/// export

export default async(suppliedWord: string): Promise<boolean> => {
  let isWord = false;

  try {
    const data = await wretch(
      `https://api.api-ninjas.com/v1/dictionary?word=${encodeURIComponent(suppliedWord)}`, {
        headers: { "X-Api-Key": serviceNinja }
      })
      .get()
      .json<{ valid?: boolean; }>()
      .catch(error => {
        const { message: message } = error;
        log.error(`[${thisFilePath}]› ${message}`);
        return isWord;
      });

    if (!data || !data.valid)
      return isWord;

    isWord = true;
  } catch(_) {
    const { cause, response, url, message, json, text, status } = _;
    log.error(`[${thisFilePath}]› Third-party service error: ${message}`);

    json && log.error(JSON.parse(json));
    text && log.error(text);
    url && log.error(url);
  }

  return isWord;
}



// TODO
// : extract this file and apply to Neuenet
