


/// util

import type { PaginationArgument } from "../pagination/schema.ts";



/// export

export interface SearchRequest {
  options: {
    ascii?: string;
    emoji?: boolean;
    extension?: string;
    idn?: boolean;
    length?: number;
    name?: string;
    number?: boolean;
    startsWith?: string;
  }
}

export interface SearchResult {
  ascii: string;
  available: boolean;
  created: string;
  duration: number;
  hns: string;
  name: string;
  premium: boolean;
  price: string;
}



/// be sure to keep this file in sync with `schema/search.graphql`
