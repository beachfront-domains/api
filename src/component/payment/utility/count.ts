


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import { databaseParams } from "src/utility/index.ts";
import e from "dbschema";
const thisFilePath = "/src/component/payment/utility/count.ts";



/// export

export default async(): Promise<number> => {
  const client = createClient(databaseParams);
  let documentCount = 0;

  try {
    const getAllDocuments = e.select(e.Payment, () => ({ id: true }));
    const response = await getAllDocuments.run(client);

    documentCount = response.length;
  } catch(_) {
    log.warning(`[${thisFilePath}]› Error retrieving document count.`);
  }

  return documentCount;
}
