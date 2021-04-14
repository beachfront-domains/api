// TODO
// : take input, lowercase it, and convert to punycode (prune)
// : take input and split "."
// : ensure there is only one "."
// : first half is "unicode"
// : second half is "tld" (unicode)
// : max results should be ~50


// getDomain
// getManyDomain




///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, LooseObjectInterface } from "~util/index";
import type { SLD } from "~module/sld/type";

const sldDatabase = "slds";

interface SLDRequestInterface {
  name: string;
  tld: string;
  unicode: string;
};



///  E X P O R T

export async function getDomain(suppliedData: Partial<SLDRequestInterface>): Promise<SLD | {}> {
  const databaseConnection = await r.connect(databaseOptions);
  const query: LooseObjectInterface = {};

  Object.entries(suppliedData).forEach(([key, value]) => {
    query[key] = String(value);
  });

  // @ts-ignore TS2740: Type "any[]" is missing the following properties from type "Customer": <...>.
  let response: LooseObjectInterface = await r.table(sldDatabase)
    .filter((sld: any) => {
      // if (query.username)
      //   return customer("username").match(`(?i)^${query.username}$`);

      return query;
    })
    .run(databaseConnection);

  try {
    response = response[0];
    databaseConnection.close();

    if (!response)
      return {};

    // @ts-ignore TS2740: Type "LooseObjectInterface" is missing the following properties from type "Customer": <...>.
    return response;
  } catch(error) {
    databaseConnection.close();

    console.info("Error retrieving domain");
    console.error(error);

    return {};
  }
}
