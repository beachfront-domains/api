


/// export

export interface DetailObject {
  created: Date;
  id: string;
  updated: Date;
  [key: string]: any;
}

export interface LooseObject {
  [key: string]: any;
}

export type StandardBooleanResponse = Promise<{ success: boolean }>;
export type StandardResponse = Promise<{ detail: DetailObject | null }>;

export type StandardPlentyResponse = Promise<{
  detail: Array<DetailObject> | null,
  pageInfo: {
    cursor: string | null,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}>;
