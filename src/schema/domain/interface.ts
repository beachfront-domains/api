


///  U T I L

import { DomainStatusCode } from "./type";
import type { PaginationArgument } from "../pagination/index";

interface __DomainsRequestOptions {
  extension: string; /// get all domains under an extension
  emoji: boolean;
  idn: boolean;
  length: number;
  number: boolean;
  owner: string; /// customer ID
  startsWith: string;
}



///  E X P O R T

export interface DomainCreate {
  options: {
    ascii?: string;
    expiry?: string;
    extension: string; /// ID of extension
    name: string;
    owner?: {
      location: string;
      name: string;
    };
    status?: DomainStatusCode;
  }
}

export interface DomainRequest {
  options: {
    id?: string;
    name?: string;
  }
}

export interface DomainUpdate {
  changes: {
    expiry?: string;
    owner?: {
      location: string;
      name: string;
    };
  }
  options: {
    id?: string;
    name?: string;
  }
}

export interface DomainsRequest {
  options: Partial<__DomainsRequestOptions>;
  pagination: PaginationArgument;
};
