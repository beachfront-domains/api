


/// util

import type { PaginationArgument } from "../pagination/schema.ts";

interface SearchRequestParams {
  emoji: number;
  extension: string;
  idn: number;
  length: number;
  name: string;
  number: number;
  startsWith: string;
}



/// export

export interface SearchRequest {
  pagination: PaginationArgument;
  params: Partial<SearchRequestParams>;
}

export interface SearchResult {
  available: number;
  created: string;
  duration: number;
  name: string;
  premium: number;
  priceHNS: string;
  priceUSD: string;
}



/// be sure to keep this file in sync with `schema/search.graphql`
