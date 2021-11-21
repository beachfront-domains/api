


///  U T I L

import type { PaginationArgument } from "../pagination/index";



interface __SessionsRequestOptions {
  created: string;
  customer: string; /// ID
  updated: string;
}



///  E X P O R T

export interface SessionCreate {
  options: {
    cart: string[];
    customer?: string; /// ID
  }
}

export interface SessionRequest {
  options: {
    id: string;
  }
}

export interface SessionUpdate {
  changes: {
    cart: string[];
  }
  options: {
    id: string;
  }
}

export interface SessionsRequest {
  options: Partial<__SessionsRequestOptions>;
  pagination: PaginationArgument;
};
