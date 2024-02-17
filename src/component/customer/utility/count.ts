


/// import

import { log } from "dep/std.ts";

/// util

import { client } from "src/utility/index.ts";
import e from "dbschema";
// const thisFilePath = "/src/component/customer/utility/count.ts";
const thisFilePath = import.meta.filename;



/// export

export default async(): Promise<number> => {
  let documentCount = 0;

  try {
    const getAllDocuments = e.select(e.Customer, () => ({ id: true }));
    const response = await getAllDocuments.run(client);

    documentCount = response.length;
  } catch(_) {
    log.warning(`[${thisFilePath}]› Error retrieving document count.`);
  }

  return documentCount;
}
