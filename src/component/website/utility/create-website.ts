


/// import

import { log } from "dep/std.ts";
import { wretch } from "dep/x/wretch.ts";

/// util

import {
  GOLFER,
  nameserverKey,
  neuenic,
  prettyFilePath,
  sandcastleURL,
  SANDCASTLE
} from "src/utility/index.ts";

const thisFilePath = prettyFilePath(import.meta.filename);



/// export

export default async(params: { content: string, customer: string, domain: string }) => {
  const { content, customer, domain } = params;

  // TODO
  // : ensure website exists (golfer), init website otherwise

  async function create() {
    // curl -d '{ "customer": "2b4a6644-238a-11ef-aa6d-97f24c8434b8", "domain": "www.lynk" }' -H "Content-Type: application/json" -H "Authorization: Bearer 53CR3T" -X POST http://localhost:3700/api/site | jq
    try {
      const data = await wretch(`${sandcastleURL}/api`, { headers: { "Authorization": `Bearer ${SANDCASTLE}` }})
        .post({ data: content, customer, domain })
        .json();

      return data;
    } catch(error) {
      throw error;
    }
  }

  try {
    await create();
    log.info(`>>> ${domain} website created`);

    return true;
  } catch(error) {
    const { text, url } = error;
    log.error(thisFilePath + "\n" + `      [${url}]› ${text}`);
    throw error;
  }
}
