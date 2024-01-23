


/// util

import type { PaginationArgument } from "../pagination/schema.ts";

export enum CAATag {
  iodef = "iodef",
  issue = "issue",
  issuewild = "issuewild"
}

export enum RecordClass {
  CH = "CH",
  CS = "CS",
  HS = "HS",
  IN = "IN"
}

export enum RecordType {
  A = "A",
  AAAA = "AAAA",
  CAA = "CAA",
  CNAME = "CNAME",
  DNAME = "DNAME",
  DNSKEY = "DNSKEY",
  DS = "DS",
  HINFO = "HINFO",
  MX = "MX",
  NAPTR = "NAPTR",
  NS = "NS",
  NSEC = "NSEC",
  NSEC3 = "NSEC3",
  NULL = "NULL",
  OPT = "OPT",
  PTR = "PTR",
  RP = "RP",
  RRSIG = "RRSIG",
  SOA = "SOA",
  SRV = "SRV",
  SSHFP = "SSHFP",
  TLSA = "TLSA",
  TXT = "TXT"
}

interface RecordRequestOptions {
  class: RecordClass;
  name: string;
  type: RecordType;
}



/// export

export interface Record {
  class: RecordClass;
  name: string;
  ttl: number;
  type: RecordType;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface RecordCreate {
  params: {
    class?: RecordClass; /// defaults to "IN"
    name: string;
    ttl?: number;        /// defaults to 300
    type: RecordType;
    [key: string]: any;
  }
}

export interface RecordRequest {
  params: {
    id: string;
    name: string;
  }
}

export interface RecordsRequest {
  params: Partial<RecordRequestOptions>;
  pagination: PaginationArgument;
}

export interface RecordUpdate {
  params: {
    id: string;
  }
  updates: {
    ttl: number;
  }
}



/// be sure to keep this file in sync with `/schema/record.graphql`
