


/// import

import { log } from "dep/std.ts";
import { wretch } from "dep/x/wretch.ts";

/// util

import { default as getRecords } from "./get-record.ts";
import { nameserverKey, neuenic, prettyFilePath } from "src/utility/index.ts";

const thisFilePath = prettyFilePath(import.meta.filename);

type MyObject = {
  comments: string;
  content: string;
  disabled: boolean;
  name: string;
  ttl: number;
  type: string;
};

type Searchable = {
  [key: string]: any;
};



/// export

export default async(domain: Object<any>): Promise<boolean> => { /// Promise<Array<any>>
  const { action, content, name, ttl, type } = domain;
  const newRecord = [];
  let { hostname } = domain;

  const toCreate = !action || String(action).toLowerCase() === "create";
  const toDelete = String(action).toLowerCase() === "delete";
  const toUpdate = String(action).toLowerCase() === "update";

  // TODO
  // 𐄂 grab DNS record, THEN overwrite with supplied values
  // 𐄂 add `hostname` to options
  // 𐄂 increment serial? (happens automatically with records automatically created via API)
  // : this entire file could be made better, needs more flexibility and intelligence.

  if (hostname.endsWith("."))
    hostname = hostname.slice(0, -1);

  const { rrsets } = await wretch(
    `${neuenic}/${name}`, {
      headers: { "X-Api-Key": nameserverKey }
    }).get().json();

  /// NOTE
  /// : when deleting a record, `changetype` should be "DELETE" and `records` should be empty
  /// : if `records` is empty (no `content` or `ttl` supplied), assume deletion
  /// : what if you have several TXT records and only want to delete one of them?
  ///   : just overwrite in `if (existingTypeRecords[0])` function...how to specify though?
  /// : not sure how to do this via the API...it seems like what I'm doing now works...

  if (toCreate) {
    newRecord.push({
      changetype: "REPLACE",
      name: `${hostname}.`,
      records: [{
        content: processStringContent(content, type),
        disabled: false
      }],
      ttl,
      type
    });
  }

  if (toDelete) {
    /// NOTE
    /// > With DELETE, all existing RRs matching name and type will be deleted, including all comments.
    /// > via https://doc.powerdns.com/authoritative/http-api/zone.html#rrset
    /// : so `changetype: "DELETE"` doesn't do what we want, we gotta update instead BUT leave out
    ///   the record we don't want anymore.

    // newRecord.push({
    //   changetype: "DELETE",
    //   content,
    //   name: `${hostname}.`,
    //   records: [],
    //   ttl,
    //   type
    // });

    const doTypeRecordsExist = searchByKeyAndValue(rrsets, "type", type);
    const existingTypeRecords = doTypeRecordsExist[0];
    const processedExistingRecords = [];

    const {
      name: existingRecordName,
      ttl: existingRecordTTL,
      type: existingRecordType
    } = existingTypeRecords;

    for (const existingRecord of existingTypeRecords.records) {
      const { content: existingRecordContent, disabled: existingRecordStatus } = existingRecord; /// we don't use `comments`

      if (
        existingRecordContent === processStringContent(content, type) &&
        existingRecordTTL === ttl &&
        existingRecordType === type &&
        existingRecordName === `${hostname}.`) {
        /// do nothing, this "deletes" the record
      } else {
        processedExistingRecords.push({
          content: existingRecordContent,
          disabled: existingRecordStatus,
          name: existingRecordName,
          ttl: existingRecordTTL,
          type: existingRecordType
        });
      }
    }

    newRecord.push({
      changetype: "REPLACE",
      name: `${hostname}.`,
      records: removeDuplicates([ ...processedExistingRecords ]),
      ttl,
      type
    });
  }

  /// NOTE
  /// : PowerDNS requires records to be overwritten and grouped in batches when you want several of a type.
  ///   : so, several TXT records, for example. Common use case, PITA to figure out with PowerDNS because
  ///     their docs don't mention this.

  if (toUpdate) {
    const doTypeRecordsExist = searchByKeyAndValue(rrsets, "type", type);
    const existingTypeRecords = doTypeRecordsExist[0];
    const processedExistingRecords = [];

    const {
      name: existingRecordName,
      ttl: existingRecordTTL,
      type: existingRecordType
    } = existingTypeRecords;

    const suppliedContent = content.split(":::");
    const originalContent = suppliedContent[0];
    const newContent = suppliedContent[1];

    for (const existingRecord of existingTypeRecords.records) {
      const { content: existingRecordContent, disabled: existingRecordStatus } = existingRecord; /// we don't use `comments`

      if (
        existingRecordContent === processStringContent(originalContent, type) &&
        existingRecordType === type &&
        existingRecordName === `${hostname}.`) {
        /// NOTE
        /// : We update `content` if there that value is updated. With `ttl`, we have no
        ///   way of knowing if it was updated or not, so we don't check for it, but update
        ///   it anyway
        processedExistingRecords.push({
          content: newContent ?
            processStringContent(newContent, type) :
            existingRecordContent,
          disabled: existingRecordStatus,
          name: existingRecordName,
          ttl,
          type: existingRecordType
        });
      } else {
        processedExistingRecords.push({
          content: existingRecordContent,
          disabled: existingRecordStatus,
          name: existingRecordName,
          ttl: existingRecordTTL,
          type: existingRecordType
        });
      }

      // TODO
      // : if record matches close enough, replace...but how to know which record to replace?
      // : add some sort of separator that'll let the API know how to match and replace?
      // : <originalValue>:::<newValue>
      // : the `content` or `ttl` could be changed
      // : use `:::` as separator for `content`
      //   : overwrite default `ttl` with whatever `ttl` is supplied
      // : check for separator in `content` to match old [0] to replace with new [1]
      //   : if no separator, we know `ttl` is the one being updated with new value
    }

    newRecord.push({
      changetype: "REPLACE",
      name: `${hostname}.`,
      records: removeDuplicates([ ...processedExistingRecords ]),
      ttl,
      type
    });
  }

  try {
    await wretch(
      `${neuenic}/${name}.`, {
        headers: { "X-Api-Key": nameserverKey }
      })
      .patch({
        api_rectify: true,
        kind: "Native",
        rrsets: newRecord
      });

    /// NOTE
    /// : for some reason, we have to trigger this fetch in order for PowerDNS
    ///   to return **updated** DNS records in /src/component/domain/update.ts
    ///   WHY FETCH TWICE?! Who the hell knows SMH.

    await getRecords(name);
    return true;
  } catch(uncaughtError) {
    console.log(">>> uncaughtError");
    console.log(uncaughtError);
    throw uncaughtError;
  }
}



/// helper

function processStringContent(content: string, type: string) {
  const similarHostnameTypes = ["CNAME", "TXT"];

  if (content.length > 0 && similarHostnameTypes.includes(type.toUpperCase()))
    return `"${content}"`;

  return content;
}

function removeDuplicates(objects: MyObject[]): MyObject[] {
  const uniqueKeys = new Set<string>();
  const uniqueObjects: MyObject[] = [];

  for (const obj of objects) {
    const key = `${obj.name}|${obj.content.replace(/\s/g, "")}|${obj.type}`; /// these params make an object unique

    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      uniqueObjects.push(obj);
    }
  }

  return uniqueObjects;
}

function searchByKeyAndValue<T extends object>(array: T[], key: keyof T, value: any): T[] {
  return array.filter((item) => item[key] === value);
}

function searchInArray(objects: Searchable[], criteria: Searchable): Searchable[] {
  return objects.filter(object => Object.keys(criteria).every(key => {
    if (typeof criteria[key] === "object" && criteria[key] !== null)
      return searchInArray([object[key]], criteria[key]).length > 0;
    else
      return object[key] === criteria[key];
  }));

  /// via ChatGPT 4
}
