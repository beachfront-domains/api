


/// util

import type { Customer } from "src/component/customer/schema.ts";



/// export

export interface DetailObject {
  created?: Date;
  id?: string;
  updated?: Date;
  [key: string]: any;
}

export interface LooseObject {
  [key: string]: any;
}

export type SearchResponse = Promise<{
  detail: Array<DetailObject> | null,
  pageInfo: {
    cursor: string | null,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  },
  viewer: Customer | null
}>;

export type StandardBooleanResponse = Promise<{ success: boolean }>;
export type StandardResponse = Promise<{ detail: DetailObject | null, error?: { code: string; message: string; }}>;

export type StandardPlentyResponse = Promise<{
  detail: Array<DetailObject> | null,
  pageInfo: {
    cursor: string | null,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}>;
