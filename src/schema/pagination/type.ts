


///  E X P O R T

export type PaginationArgument = {
  after: Date;
  first: number;
};

export type PaginationResponse = {
  pageInfo: {
    cursor: string;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};



/// be sure to keep this file in sync with `schema/pagination.graphql`
