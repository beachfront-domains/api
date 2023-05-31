


/// util

import type { PaginationArgument } from "../pagination/schema.ts";

interface DomainsRequestParams {
  extension: string;  /// get all domains under an extension / extension ID
  // emoji: number;      /// boolean / 0 = false, 1 = true
  // idn: number;        /// boolean / 0 = false, 1 = true
  // length: number;
  // numeric: number;    /// boolean / 0 = false, 1 = true
  owner: string;      /// customer ID
  // startsWith: string;

  // NOTE
  // : `emoji`, `idn`, `length`, `numeric`, `startsWith`, `created`, and `updated`
  //   are disabled until range filtering is figured out
}



/// export

export enum DomainStatusCode {
  /// Server Status Codes are Set by Your Domain's Registry
  /// - https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en
  ADD_PERIOD = "ADD_PERIOD",
  AUTO_RENEW_PERIOD = "AUTO_RENEW_PERIOD",
  INACTIVE = "INACTIVE",
  OK = "OK",
  PENDING_CREATE = "PENDING_CREATE",
  PENDING_DELETE = "PENDING_DELETE",
  PENDING_RENEW = "PENDING_RENEW",
  PENDING_RESTORE = "PENDING_RESTORE",
  PENDING_TRANSFER = "PENDING_TRANSFER",
  PENDING_UPDATE = "PENDING_UPDATE",
  REDEMPTION_PERIOD = "REDEMPTION_PERIOD",
  RENEW_PERIOD = "RENEW_PERIOD",
  SERVER_DELETE_PROHIBITED = "SERVER_DELETE_PROHIBITED",
  SERVER_HOLD = "SERVER_HOLD",
  SERVER_RENEW_PROHIBITED = "SERVER_RENEW_PROHIBITED",
  SERVER_TRANSFER_PROHIBITED = "SERVER_TRANSFER_PROHIBITED",
  SERVER_UPDATE_PROHIBITED = "SERVER_UPDATE_PROHIBITED",
  TRANSFER_PERIOD = "TRANSFER_PERIOD",
  /// Client Status Codes are Set by Your Domain's Registrar
  /// - https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en
  CLIENT_DELETE_PROHIBITED = "CLIENT_DELETE_PROHIBITED",
  CLIENT_HOLD = "CLIENT_HOLD",
  CLIENT_RENEW_PROHIBITED = "CLIENT_RENEW_PROHIBITED",
  CLIENT_TRANSFER_PROHIBITED = "CLIENT_TRANSFER_PROHIBITED",
  CLIENT_UPDATE_PROHIBITED = "CLIENT_UPDATE_PROHIBITED"
}

// TODO
// : owner previously had `name` and `location` values...
// : seems like we should instead locate the customer in our database
//   - if customer exists, update `owner` value
//   - else, apply ghost owner profile

export interface Domain {
  expiry: Date;
  extension: string; /// ID of extension
  name: string;      /// format: `sld.extension` in ASCII
  owner: string;     /// ID of customer
  status: DomainStatusCode;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface DomainCreate {
  params: {
    expiry?: Date;
    extension: string; /// ID of extension
    name: string;      /// format: `sld.extension` in ASCII
    owner?: string;    /// ID of customer
    status?: DomainStatusCode;
  }
}

export interface DomainRequest {
  params: {
    id?: string;
    name?: string; /// format: `sld.extension` in ASCII
  }
}

export interface DomainsRequest {
  pagination: PaginationArgument;
  params: Partial<DomainsRequestParams>;
}

export interface DomainUpdate {
  params: {
    id?: string;
    name?: string;  /// format: `sld.extension` in ASCII
  }
  updates: {
    expiry?: Date;
    owner?: string; /// ID of customer
    status?: DomainStatusCode;
  }
}



/// be sure to keep this file in sync with `schema/domain.graphql`
