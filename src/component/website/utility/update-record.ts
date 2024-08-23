


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

export default async(domain: Object<any>): Promise<boolean> => {
  const { action, content, name, ttl, type } = domain;
  const newRecord = [];
  let { hostname } = domain;

  const toCreate = !action || String(action).toLowerCase() === "create";
  const toDelete = String(action).toLowerCase() === "delete";
  const toUpdate = String(action).toLowerCase() === "update";

  if (hostname.endsWith("."))
    hostname = hostname.slice(0, -1);

  const { rrsets } = await wretch(
    `${neuenic}/${name}`, {
      headers: { "X-Api-Key": nameserverKey }
    }).get().json();

  if (toCreate) {
    const typeRecords = rrsets.filter(rrset => rrset.type === type);

    if (typeRecords.length) {
      if (typeRecords[0].type === "CNAME")
        throw new Error("Violation of DNS to have more than one CNAME.");

      const processedExistingRecords = typeRecords.flatMap(typeRecord => {
        const { name: existingName, records, ttl: existingTTL, type: existingType } = typeRecord;

        return [
          ...records.map(record => ({
            content: processStringContent(record.content, existingType),
            disabled: record.disabled,
            name: existingName,
            ttl: existingTTL,
            type: existingType
          })),
          {
            content: processStringContent(domain.content, type),
            disabled: false,
            name,
            ttl,
            type
          }
        ];
      });

      newRecord.push({
        changetype: "REPLACE",
        name: `${hostname}.`,
        records: [...new Set(processedExistingRecords)],
        ttl,
        type
      });
    } else {
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
  }

  if (toDelete) {
    const typeRecords = rrsets.filter(rrset => rrset.type === type);

    if (typeRecords.length) {
      const processedExistingRecords = typeRecords.flatMap(typeRecord => {
        const { name: existingName, records, ttl: existingTTL, type: existingType } = typeRecord;

        return records
          .filter(record => record.content !== domain.content)
          .map(record => ({
            content: processStringContent(record.content, existingType),
            disabled: record.disabled,
            name: existingName,
            ttl: existingTTL,
            type: existingType
          }));
      });

      newRecord.push({
        changetype: "REPLACE",
        name: `${hostname}.`,
        records: [...new Set(processedExistingRecords)],
        ttl,
        type
      });
    }
  }

  /// NOTE
  /// : PowerDNS requires records to be overwritten and grouped in batches when you want several of a type.
  ///   : so, several TXT records, for example. Common use case, PITA to figure out with PowerDNS because
  ///     their docs don't mention this.

  if (toUpdate) {
    const typeRecords = rrsets.find(rrset => rrset.type === type);

    if (typeRecords) {
      const {
        name: existingRecordName,
        ttl: existingRecordTTL,
        type: existingRecordType
      } = typeRecords;

      const [originalContent, newContent] = content.split(":::");

      const processedExistingRecords = typeRecords.records.map(existingRecord => {
        const { content: existingRecordContent, disabled: existingRecordStatus } = existingRecord;

        if (
          existingRecordContent === processStringContent(originalContent, type) &&
          existingRecordType === type &&
          existingRecordName === `${hostname}.`
        ) {
          return {
            content: newContent ?
              processStringContent(newContent, type) :
              existingRecordContent,
            disabled: existingRecordStatus,
            name: existingRecordName,
            ttl,
            type: existingRecordType
          };
        } else {
          return {
            content: existingRecordContent,
            disabled: existingRecordStatus,
            name: existingRecordName,
            ttl: existingRecordTTL,
            type: existingRecordType
          };
        }
      });

      newRecord.push({
        changetype: "REPLACE",
        name: `${hostname}.`,
        records: [...new Set(processedExistingRecords)],
        ttl,
        type
      });
    }
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
    return false;
  }
}



/// helper

function processStringContent(content: string, type: string) {
  const similarHostnameTypes = ["CNAME", "TXT"];

  if (content.length > 0 && type.toUpperCase() === "CNAME") {
    if (!content.endsWith("."))
      return `${content}.`;
    else
      return `${content}`;

    /// CNAME requires a trailing dot, at least for bare TLDs
  }

  if (content.length > 0 && similarHostnameTypes.includes(type.toUpperCase()))
    return `"${content}"`; /// TXT needs to be in quotes

  return content;
}
