


/// import

import { log } from "dep/std.ts";
import { wretch } from "dep/x/wretch.ts";

/// util

import { serviceNinja } from "src/utility/index.ts";
import type { LooseObject } from "src/utility/index.ts";

const thisFilePath = import.meta.filename;

enum Sentiment {
  negative = "negative",
  neutral = "neutral",
  positive = "positive",
  weak_positive = "weak_positive"
}



/// export

export default async(suppliedWord: string): Promise<Sentiment> => {
  try {
    const data = await wretch(
      `https://api.api-ninjas.com/v1/sentiment?text==${encodeURIComponent(suppliedWord)}`, {
        headers: { "X-Api-Key": serviceNinja }
      })
      .get()
      .json<{ sentiment?: string; }>()
      .catch(error => log.error(`[${thisFilePath}]› ${error}`));

    if (!data || !data.sentiment)
      return Sentiment.neutral;

    return Sentiment[data.sentiment.toLowerCase() as keyof typeof Sentiment] || Sentiment.neutral;
  } catch(_) {
    /// IGNORE
    // const { status, url } = _;

    // console.group("/src/component/search/utility/sentiment.ts");
    // console.error(status, url);
    // console.error(`>>> ${suppliedWord}`);
    // console.groupEnd();

    log.error(`[${thisFilePath}]› Third-party service error`);
    // log.error(Object.keys(_));
    log.error(_);
    // log.error(Error.trace(_));

    return Sentiment.neutral;
  }
}



// TODO
// : extract this file and apply to Neuenet
