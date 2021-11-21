


///  U T I L

import type { PaginationArgument } from "../pagination/index";

interface __ExtensionsRequestOptions {
  emoji: boolean;
  idn: boolean;
  length: number;
  number: boolean;
  registry: string;
  startsWith: string;
}



///  E X P O R T

export interface ExtensionCreate {
  options: {
    ascii?: string;
    name?: string;
  }
}

export interface ExtensionRequest {
  options: {
    ascii?: string;
    id?: string;
    name?: string;
  }
}

export interface ExtensionUpdate {
  changes: {
    ascii?: string;
    name?: string;
  }
  options: {
    ascii?: string;
    id?: string;
    name?: string;
  }
}

export interface ExtensionsRequest {
  options: Partial<__ExtensionsRequestOptions>;
  pagination: PaginationArgument;
};
