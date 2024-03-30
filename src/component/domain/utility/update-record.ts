


/// import

import { wretch } from "dep/x/wretch.ts";

/// util

import { default as getRecords } from "./get-record.ts";
import { nameserverKey, neuenic } from "src/utility/index.ts";

type Searchable = {
  [key: string]: any;
};



/// export

export default async(domain: Object<any>): Promise<Array<any>> => {
  const { content, name, ttl, type } = domain;
  let { hostname } = domain;

  // curl -X PATCH \
  //   "http://localhost:8008/api/v1/servers/localhost/zones/example.org." \
  //   -H "Content-Type: application/json" \
  //   -H "X-API-Key: 1P@ssw0rd\!" \
  //   --data '{"rrsets": [{"name": "test.example.org.", "type": "A", "ttl": 3600, "changetype": "REPLACE", "records": [{"content": "192.168.0.5", "disabled": false}]}]}'

  console.log(">>> domain");
  console.log(domain);

  // TODO
  // 𐄂 grab DNS record, THEN overwrite with supplied values
  // : add `hostname` to options
  // : increment serial? (happens automatically with records automatically created via API)

  if (hostname.endsWith("."))
    hostname = hostname.slice(0, -1);

  const { rrsets } = await wretch(
    `${neuenic}/${name}`, {
      headers: { "X-Api-Key": nameserverKey }
    })
    .get()
    .json();

  // TODO
  // : this entire file could be made better
  //   : needs more flexibility and intelligence

  const originalRecord = searchInArray(rrsets, { name: `${hostname}.`, type })[0];
  let newRecord = {};

  if (originalRecord) {
    newRecord = {
      ...originalRecord,
      changetype: "REPLACE"
    };

    if (content) {
      newRecord.records = [{
        content,
        disabled: false
      }];
    }

    if (ttl)
      newRecord.ttl = ttl;
  } else {
    // TODO
    console.warn("umm...no original record?");
    return false;
  }

  try {
    await wretch(
      `${neuenic}/${name}.`, {
        headers: { "X-Api-Key": nameserverKey }
      })
      .patch({
        api_rectify: true,
        kind: "Native",
        rrsets: [newRecord]
      });

    /// NOTE
    /// : for some reason, we have to trigger this fetch in order for PowerDNS
    ///   to return **updated** DNS records in /src/component/domain/update.ts
    ///   WHY FETCH TWICE?! Who the hell knows SMH.

    await getRecords(name);
    return true;
  } catch({ json }) {
    const { error } = json;

    if (error)
      console.error(error);

    return false;
  }
}



/// helper

function searchInArray(objects: Searchable[], criteria: Searchable): Searchable[] {
  return objects.filter(object => Object.keys(criteria).every(key => {
    if (typeof criteria[key] === "object" && criteria[key] !== null)
      return searchInArray([object[key]], criteria[key]).length > 0;
    else
      return object[key] === criteria[key];
  }));

  /// via ChatGPT 4
}
