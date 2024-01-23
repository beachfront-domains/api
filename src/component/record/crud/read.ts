


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import e from "dbschema";

import {
  accessControl,
  andOperation,
  databaseParams,
  processRecordData
} from "src/utility/index.ts";

import { RecordType } from "../schema.ts";

import type { Record } from "../record.ts";
import type { RecordRequest } from "../schema.ts";

import type {
  DetailObject,
  LooseObject,
  StandardResponse
} from "src/utility/index.ts";

const thisFilePath = "/src/component/record/crud/read.ts";



/// export

export const get = async(_root, args: RecordRequest, ctx, _info?): StandardResponse => {
  // TODO
  // : ensure `ctx` is in fact just a string (apiKey)
  if (!await accessControl(ctx))
    return { detail: null };

  const client = createClient(databaseParams);
  const { params } = args;
  const query = ({} as LooseObject);
  let databaseQuery;
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "name": {
        query[key] = String(value);
        break;
      }

      case "type": {
        query[key] = RecordType[String(value).toUpperCase()] === String(value).toUpperCase() ?
          String(value).toUpperCase() :
          null;
        break;
      }

      default: {
        break;
      }
    }
  });

  switch((query.type as Record["type"])) {
    case "A":
    case "AAAA":
    case "CNAME":
    case "DNAME":
    case "NS":
    case "PTR":
    case "TXT": {
      databaseQuery = e.select(e.PlainRecord, doc => ({
        ...e.PlainRecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "CAA": {
      databaseQuery = e.select(e.CAARecord, doc => ({
        ...e.CAARecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "DNSKEY": {
      databaseQuery = e.select(e.DNSKEYRecord, doc => ({
        ...e.DNSKEYRecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "DS": {
      databaseQuery = e.select(e.DSRecord, doc => ({
        ...e.DSRecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "HINFO": {
      databaseQuery = e.select(e.HINFORecord, doc => ({
        ...e.HINFORecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "MX": {
      databaseQuery = e.select(e.MXRecord, doc => ({
        ...e.MXRecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "NAPTR": {
      databaseQuery = e.select(e.NAPTRRecord, doc => ({
        ...e.NAPTRRecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "NSEC": {
      databaseQuery = e.select(e.NSECRecord, doc => ({
        ...e.NSECRecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "NSEC3": {
      databaseQuery = e.select(e.NSEC3Record, doc => ({
        ...e.NSEC3Record["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    // case "NULL": {
    //   databaseQuery = e.select(e.NULLRecord, doc => ({
    //     ...e.NULLRecord["*"],
    //     filter: andOperation(
    //       e.op(doc.name, "=", query.name),
    //       e.op(doc.type, "=", e.RecordType[query.type])
    //     )
    //   }));

    //   break;
    // }

    // case "OPT": {
    //   databaseQuery = e.select(e.OPTRecord, doc => ({
    //     ...e.OPTRecord["*"],
    //     filter: andOperation(
    //       e.op(doc.name, "=", query.name),
    //       e.op(doc.type, "=", e.RecordType[query.type])
    //     )
    //   }));

    //   break;
    // }

    case "RP": {
      databaseQuery = e.select(e.RPRecord, doc => ({
        ...e.RPRecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "RRSIG": {
      databaseQuery = e.select(e.RRSIGRecord, doc => ({
        ...e.RRSIGRecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "SOA": {
      databaseQuery = e.select(e.SOARecord, doc => ({
        ...e.SOARecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "SRV": {
      databaseQuery = e.select(e.SRVRecord, doc => ({
        ...e.SRVRecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "SSHFP": {
      databaseQuery = e.select(e.SSHFPRecord, doc => ({
        ...e.SSHFPRecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    case "TLSA": {
      databaseQuery = e.select(e.TLSARecord, doc => ({
        ...e.TLSARecord["*"],
        filter: andOperation(
          e.op(doc.name, "=", query.name),
          e.op(doc.type, "=", e.RecordType[query.type])
        )
      }));

      break;
    }

    default:
      break;
  }

  try {
    response = await databaseQuery.run(client);

    const processedData = response && response.map(record => {
      const structuredData = processRecordData(record, true);

      if (structuredData) {
        /// we need to transform this string into an object for `__resolveType`
        if (typeof structuredData.data !== "object")
          structuredData.data = { data: structuredData.data };

        /// `flags` can either be a string or integer
        if (Object.prototype.hasOwnProperty.call(structuredData.data, "flags")) {
          const originalFlagValue = structuredData.data.flags;

          structuredData.data.flags = {
            flags: isNaN(originalFlagValue) ? originalFlagValue : Number(originalFlagValue)
          };

          // TODO
          // : for some reason, `flags` with a numerical value doesn't appear in the GraphQL response
          //   with `... on FlagInt` so use `... on FlagString` instead and parseInt(flags.flags) in your UI
        }
      }

      return structuredData;
    }) || null;

    return { detail: processedData };
  } catch(_) {
    console.log(_);
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while retrieving document.`);
    return { detail: response };
  }
};
