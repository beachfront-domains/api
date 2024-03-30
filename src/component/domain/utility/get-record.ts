


/// import

import { wretch } from "dep/x/wretch.ts";

/// util

import { nameserverKey, neuenic } from "src/utility/index.ts";



/// export

export default async(domain: string): Promise<Array<any>> => {
  const domainRecords = [];

  try {
    const { rrsets } = await wretch(
      `${neuenic}/${domain}`, {
        headers: { "X-Api-Key": nameserverKey }
      })
      .get()
      .json();

    for (const rr of rrsets) {
      const { name, records, ttl, type } = rr;

      domainRecords.push({
        name,
        records: processRecords(records),
        ttl,
        type
      });
    }
  } catch(_) {
    /// IGNORE > does not exist
  }

  return domainRecords;
}



/// helper

function processRecords(records: Array<any>): Array<any> {
  const processedRecords = [];

  for (const record of records) {
    processedRecords.push(record.content);
  }

  return processedRecords;
}
