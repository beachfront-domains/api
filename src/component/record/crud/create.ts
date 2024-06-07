


/// import

import { createClient } from "edgedb";
import { log } from "dep/std.ts";

/// util

import e from "dbschema";
import { accessControl, databaseParams, processRecordData } from "src/utility/index.ts";
import { CAATag, RecordClass, RecordType } from "../schema.ts";

import type { DetailObject, StandardPlentyResponse } from "src/utility/index.ts";
import type { RecordCreate } from "../schema.ts";

import type {
  // CAARecord,
  // DNSKEYRecord,
  // DSRecord,
  // HINFORecord,
  // MXRecord,
  // NSECRecord,
  // NSEC3Record,
  // NULLRecord,
  // OPTRecord,
  // PlainRecord,
  Record,
  // RPRecord,
  // RRSIGRecord,
  // SOARecord,
  // SRVRecord,
  // SSHFPRecord,
  // TXTRecord
} from "nameserver/record.ts";

// const thisFilePath = "/src/component/record/crud/create.ts";
const thisFilePath = import.meta.filename;



/// export

export default async (_root, args: RecordCreate, ctx, _info?): StandardPlentyResponse => {
  if (!await accessControl(ctx))
    return { detail: null };

  const client = createClient(databaseParams);
  const { params } = args;
  const query = ({} as any);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "class": {
        query[key] = RecordClass[String(value).toUpperCase()] === String(value).toUpperCase() ?
          String(value).toUpperCase() :
          "IN";
        break;
      }

      case "flags": {
        /// will be validated later
        /// CAA, DNSKEY, NSEC3, and OPT are integers
        /// NAPTR is string
        query[key] = value;
        break;
      }

      case "certificate":
      case "cpu":
      case "data":
      case "digest":
      case "exchange":
      case "fingerprint":
      case "key":
      case "mbox":
      case "mname":
      case "name":
      case "nextDomain":
      case "os":
      case "regexp":
      case "replacement":
      case "rname":
      case "salt":
      case "services":
      case "signature":
      case "signersName":
      case "target":
      case "txt":
      case "typeCovered":
      case "value": {
        query[key] = String(value);
        break;
      }

      case "algorithm":
      case "digestType":
      case "expire":
      case "hash":
      case "issuerCritical":
      case "iterations":
      case "keyTag":
      case "labels":
      case "matchingType":
      case "minimum":
      case "order":
      case "originalTTL":
      case "port":
      case "preference":
      case "priority":
      case "refresh":
      case "retry":
      case "selector":
      case "serial":
      case "usage":
      case "weight": {
        query[key] = Number(value) || 0;
        break;
      }

      case "expiration":
      case "inception": {
        // TODO
        // : ensure this is a date / check RFC and dolo
        query[key] = value;
        break;
      }

      case "rrtypes": {
        query[key] = ensureArrayOfStrings(value) || null;
        break;
      }

      case "tag": {
        query[key] = CAATag[String(value).toLowerCase()] === String(value).toLowerCase() ?
          String(value).toLowerCase() :
          null;
        break;
      }

      case "ttl": {
        query[key] = Number(value) || 300;
        break;
      }

      case "type": {
        query[key] = RecordType[String(value).toUpperCase()] === String(value).toUpperCase() ?
          String(value).toUpperCase() :
          null;
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.name || !query.type) {
    const err = "Missing required parameter(s).";

    log.warn(`[${thisFilePath}]› ${err}`);
    return { detail: response };
  }

  if (query.type === "CAA") {
    if (!query.tag || !query.value) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    /// `value` should not contain whitespace
    const constraint = /^\S+$/;

    if (!constraint.test(query.value)) {
      const err = `Invalid CAA "value" content.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    if (query.flags) {
      /// `flags` should be a number between 0-255
      if (!ensureNumberWithinRange(query.flags, 0, 255)) {
        const err = `Invalid CAA "flags" value.`;

        log.warn(`[${thisFilePath}]› ${err}`);
        return { detail: response };
      }

      query.flags = Number(query.flags);
    } else {
      query.flags = 0;
    }

    /// `issuerCritical` should only have value of 0 or 1
    if (query.issuerCritical && (query.issuerCritical !== 0 || query.issuerCritical !== 1)) {
      const err = `Invalid "issuerCritical" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }
  }

  if (query.type === "DNSKEY") {
    /// `algorithm` should be one of the below values (`15` is recommended)
    const validAlgorithmValues = [5, 7, 8, 10, 12, 13, 14, 15, 16];

    if (!validAlgorithmValues.includes(Number(query.algorithm))) {
      const err = `Invalid DNSKEY "algorithm" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    /// `flags` should be one of the below values
    const validFlagValues = [0, 256, 257];

    if (!validFlagValues.includes(Number(query.flags))) {
      const err = `Invalid DNSKEY "flags" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    query.flags = Number(query.flags);

    /// `protocol` MUST be 3 / we don't actually have this in the schema, just a note.
    /// query.protocol = 3;
  }

  if (query.type === "DS") {
    if (!query.algorithm || !query.digest || !query.digestType || !query.keyTag) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }
  }

  if (query.type === "HINFO") {
    if (!query.cpu || !query.os) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }
  }

  if (query.type === "MX") {
    if (!query.exchange || !query.preference) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    /// `preference` should be a number between 0-65535
    if (!ensureNumberWithinRange(query.preference, 0, 65535)) {
      const err = `Invalid MX "preference" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }
  }

  if (query.type === "NAPTR") {
    if (!query.flags || !query.order || !query.preference || !query.regexp || !query.replacement || !query.services) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    /// `order` should be a number between 0-65535
    if (!ensureNumberWithinRange(query.order, 0, 65535)) {
      const err = `Invalid NAPTR "order" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    /// `preference` should be a number between 0-65535
    if (!ensureNumberWithinRange(query.preference, 0, 65535)) {
      const err = `Invalid NAPTR "preference" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    query.flags = String(query.flags);
  }

  if (query.type === "NSEC") {
    if (!query.nextDomain || !query.rrtypes) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    // TODO
    // : check `query.rrtypes` against enum of valid resource record types
  }

  if (query.type === "NSEC3") {
    if (!query.algorithm || !query.flags || !query.iterations || !query.nextDomain || !query.rrtypes || !query.salt) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    query.flags = Number(query.flags);

    // TODO
    // : check `query.rrtypes` against enum of valid resource record types
  }

  if (query.type === "RP") {
    if (!query.mbox || !query.txt) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }
  }

  if (query.type === "RRSIG") {
    if (!query.algorithm || !query.expiration || !query.inception || !query.keyTag ||
        !query.labels || !query.originalTTL || !query.signature || !query.signersName  || !query.typeCovered) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }
  }

  if (query.type === "SOA") {
    if (!query.expire || !query.minimum || !query.mname || !query.refresh || !query.retry || !query.rname || !query.serial) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }
  }

  if (query.type === "SRV") {
    if (!query.port || !query.priority || !query.target || !query.weight) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }
  }

  if (query.type === "SSHFP") {
    if (!query.algorithm || !query.fingerprint || !query.hash) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    /// `algorithm` should be a number between 1-4 (0 is reserved)
    if (!ensureNumberWithinRange(query.algorithm, 1, 4)) {
      const err = `Invalid SSHFP "algorithm" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    /// `hash` should be either 1 or 2 (0 is reserved)
    if (query.hash !== 1 && query.hash !== 2) {
      const err = `Invalid SSHFP "hash" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }
  }

  if (query.type === "TLSA") {
    if (!query.certificate || !query.matchingType || !query.selector || !query.usage) {
      const err = "Missing required parameter(s).";

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    /// `matchingType` should be a number between 0-2
    if (!ensureNumberWithinRange(query.matchingType, 0, 2)) {
      const err = `Invalid TLSA "matchingType" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    /// `selector` should be either 0 or 1
    if (query.selector !== 0 && query.selector !== 1) {
      const err = `Invalid TLSA "selector" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }

    /// `usage` should be a number between 0-3
    if (!ensureNumberWithinRange(query.usage, 0, 3)) {
      const err = `Invalid TLSA "usage" value.`;

      log.warn(`[${thisFilePath}]› ${err}`);
      return { detail: response };
    }
  }

  /// NOTE
  /// : database sets `class` and `ttl` values by default (IN and 300, respectively)...should it be 3600?
  ///   : 300 is 5 minutes, 3600 is an hour

  let databaseQuery;

  switch((query.type as Record["type"])) {
    case "A":
    case "AAAA":
    case "CNAME":
    case "DNAME":
    case "NS":
    case "PTR":
    case "TXT": {
      // TODO
      // : validate `data` against `type`
      //   - shouldn't be possible to save IPv6 data in an IPv4 type
      databaseQuery = e.select(
        e.insert(e.dns.PlainRecord, { ...query }),
        () => ({ ...e.dns.PlainRecord["*"] })
      );
      break;
    }

    case "CAA": {
      databaseQuery = e.select(
        e.insert(e.dns.CAARecord, { ...query }),
        () => ({ ...e.dns.CAARecord["*"] })
      );
      break;
    }

    case "DNSKEY": {
      databaseQuery = e.select(
        e.insert(e.dns.DNSKEYRecord, { ...query }),
        () => ({ ...e.dns.DNSKEYRecord["*"] })
      );
      break;
    }

    case "DS": {
      databaseQuery = e.select(
        e.insert(e.dns.DSRecord, { ...query }),
        () => ({ ...e.dns.DSRecord["*"] })
      );
      break;
    }

    case "HINFO": {
      query.data = {
        cpu: query.cpu,
        os: query.os
      };

      delete query.cpu;
      delete query.os;

      databaseQuery = e.select(
        e.insert(e.dns.HINFORecord, { ...query }),
        () => ({ ...e.dns.HINFORecord["*"] })
      );
      break;
    }

    case "MX": {
      databaseQuery = e.select(
        e.insert(e.dns.MXRecord, { ...query }),
        () => ({ ...e.dns.MXRecord["*"] })
      );
      break;
    }

    case "NAPTR": {
      databaseQuery = e.select(
        e.insert(e.dns.NAPTRRecord, { ...query }),
        () => ({ ...e.dns.NAPTRRecord["*"] })
      );
      break;
    }

    case "NSEC": {
      databaseQuery = e.select(
        e.insert(e.dns.NSECRecord, { ...query }),
        () => ({ ...e.dns.NSECRecord["*"] })
      );
      break;
    }

    case "NSEC3": {
      databaseQuery = e.select(
        e.insert(e.dns.NSEC3Record, { ...query }),
        () => ({ ...e.dns.NSEC3Record["*"] })
      );
      break;
    }

    case "RP": {
      databaseQuery = e.select(
        e.insert(e.dns.RPRecord, { ...query }),
        () => ({ ...e.dns.RPRecord["*"] })
      );
      break;
    }

    case "RRSIG": {
      databaseQuery = e.select(
        e.insert(e.dns.RRSIGRecord, { ...query }),
        () => ({ ...e.dns.RRSIGRecord["*"] })
      );
      break;
    }

    case "SOA": {
      query.data = e.tuple({
        expire: query.expire,
        minimum: query.minimum,
        mname: query.mname,
        "`refresh`": query.refresh,
        retry: query.retry,
        rname: query.rname,
        serial: query.serial
      });

      delete query.expire;
      delete query.minimum;
      delete query.mname;
      delete query.refresh;
      delete query.retry;
      delete query.rname;
      delete query.serial;

      databaseQuery = e.select(
        e.insert(e.dns.SOARecord, { ...query }),
        () => ({ ...e.dns.SOARecord["*"] })
      );
      break;
    }

    case "SRV": {
      query.data = {
        port: query.port,
        priority: query.priority,
        target: query.target,
        weight: query.weight
      };

      delete query.port;
      delete query.priority;
      delete query.target;
      delete query.weight;

      databaseQuery = e.select(
        e.insert(e.dns.SRVRecord, { ...query }),
        () => ({ ...e.dns.SRVRecord["*"] })
      );
      break;
    }

    case "SSHFP": {
      databaseQuery = e.select(
        e.insert(e.dns.SSHFPRecord, { ...query }),
        () => ({ ...e.dns.SSHFPRecord["*"] })
      );
      break;
    }

    case "TLSA": {
      databaseQuery = e.select(
        e.insert(e.dns.TLSARecord, { ...query }),
        () => ({ ...e.dns.TLSARecord["*"] })
      );
      break;
    }

    default:
      break;
  }

  try {
    response = await databaseQuery.run(client);
    const processedData = processRecordData(response, true);

    if (processedData) {
      /// we need to transform this string into an object for `__resolveType`
      if (typeof processedData.data !== "object")
        processedData.data = { data: processedData.data };

      /// `flags` can either be a string or integer
      if (Object.prototype.hasOwnProperty.call(processedData.data, "flags")) {
        const originalFlagValue = processedData.data.flags;

        processedData.data.flags = {
          flags: isNaN(originalFlagValue) ? originalFlagValue : Number(originalFlagValue)
        };

        // TODO
        // : for some reason, `flags` with a numerical value doesn't appear in the GraphQL response
        //   with `... on FlagInt` so use `... on FlagString` instead and parseInt(flags.flags) in your UI
      }
    }

    // @ts-ignore | TS2322 <annoying deno complaint>
    return { detail: [processedData] };
  } catch(_) {
    console.log(_);
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    return { detail: response };
  }
}



/// helper

function ensureArrayOfStrings(arr: any[]): string[] | null {
  if (!Array.isArray(arr))
    return null;

  for (const item of arr) {
    if (typeof item !== "string")
      return null;
  }

  return arr as string[];
}

function ensureNumberWithinRange(suppliedValue: string|number, minumumValue: number, maximumValue: number) {
  /// we want `0` to be treated as a (minimum) value, not "false"
  if (!suppliedValue || typeof minumumValue === "undefined" || !maximumValue)
    return false;

  if (Number(suppliedValue) < minumumValue || Number(suppliedValue) > maximumValue)
    return false;

  return true;
}
