


///  E X P O R T

export type PaginationArgumentType = {
  after: number
  first: number
};

export type PaginationResponseType = {
  pageInfo: {
    cursor: string
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
};
