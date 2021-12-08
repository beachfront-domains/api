


///  U T I L

import type { PaginationArgument } from "../pagination/index";

interface __CartItem {
  duration: number;
  name: string;
  price: string;
}

interface __SessionsRequestOptions {
  created: string;
  customer: string; /// ID
  updated: string;
}



///  E X P O R T

export interface SessionCreate {
  options: {
    cart?: __CartItem[];
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
    cart: __CartItem[];
  }
  options: {
    id: string;
  }
}

export interface SessionsRequest {
  options: Partial<__SessionsRequestOptions>;
  pagination: PaginationArgument;
};
