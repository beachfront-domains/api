


/// util

export interface Record {
  class: "CH" | "CS" | "HS" | "IN";
  name: string;
  ttl: number;
  type: "A" |
        "AAAA" |
        "CAA" |
        "CNAME" |
        "DNAME" |
        "DNSKEY" |
        "DS" |
        "HINFO" |
        "MX" |
        "NAPTR" |
        "NS" |
        "NSEC" |
        "NSEC3" |
        // "NULL" |
        // "OPT" |
        "PTR" |
        "RP" |
        "RRSIG" |
        "SOA" |
        "SRV" |
        "SSHFP" |
        "TLSA" |
        "TXT";
}



/// export

export interface PlainRecord extends Record {
  /// A / AAAA / CNAME / DNAME / NS / PTR / TXT
  data: string;
}

export interface CAARecord extends Record {
  flags?: number;
  issuerCritical?: number; // boolean | null;
  tag: "iodef" | "issue" | "issuewild";
  value: string;
}

export interface DNSKEYRecord extends Record {
  algorithm: number;
  flags: number;
  key: string; // Uint8Array
}

export interface DSRecord extends Record {
  algorithm: number;
  digest: string; // Uint8Array
  digestType: number;
  keyTag: number;
}

export interface HINFORecord extends Record {
  data: {
    cpu: string;
    os: string;
  };
}

export interface MXRecord extends Record {
  exchange: string;
  preference: number;
}

export interface NAPTRRecord extends Record {
  flags: string;
  order: number;
  preference: number;
  regexp: string;
  replacement: string;
  services: string;
}

export interface NSECRecord extends Record {
  nextDomain: string;
  rrtypes: Array<string>;
}

export interface NSEC3Record extends Record {
  algorithm: number;
  flags: number;
  iterations: number;
  nextDomain: string; // Uint8Array
  rrtypes: Array<string>;
  salt: string; // Uint8Array
}

// export interface NULLRecord extends Record {
//   data: string; // Uint8Array
// }

// export interface OPTRecord extends Record {
//   flags: number;
//   options: Array<{
//     code: number | string;
//     data?: string; // Uint8Array
//     family?: number; /// 1 for IPv4, 2 for IPv6
//     ip?: string;
//     length?: number;
//     scopePrefixLength?: number;
//     sourcePrefixLength?: number;
//     tags?: Array<number>;
//     timeout?: number;
//   }>;
//   udpPayloadSize: number;
// }

export interface RPRecord extends Record {
  mbox: string;
  txt: string;
}

export interface RRSIGRecord extends Record {
  algorithm: number;
  expiration: number; /// timestamp
  inception: number;  /// timestamp
  keyTag: number;
  labels: number;
  originalTTL: number;
  signature: string; // Uint8Array
  signersName: string;
  typeCovered: string;
}

export interface SOARecord extends Record {
  data: {
    expire: number;
    minimum: number;
    mname: string;
    refresh: number;
    retry: number;
    rname: string;
    serial: number; // | string
  };
}

export interface SRVRecord extends Record {
  data: {
    port: number;
    priority: number;
    target: string;
    weight: number;
  };
}

export interface SSHFPRecord extends Record {
  algorithm: number;
  fingerprint: string;
  hash: number;
}

export interface TLSARecord extends Record {
  certificate: string; // Uint8Array
  matchingType: number;
  selector: number;
  usage: number;
}
