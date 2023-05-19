


/// util

import type { Customer } from "../customer/schema.ts";
import type { PaginationArgument } from "../pagination/schema.ts";

interface CartItem {
  duration: number;
  name: string;
  price: string;
}

interface SessionsRequestOptions {
  created: string;
  customer: string; /// ID
  updated: string;
}



/// export

export type Session {
  cart: string[];
  customer: Customer;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface SessionCreate {
  params: {
    cart?: CartItem[];
    customer?: string; /// ID
  }
}

export interface SessionRequest {
  params: {
    id: string;
  }
}

export interface SessionUpdate {
  params: {
    id: string;
  }
  updates: {
    cart: CartItem[];
    customer?: string; /// ID
  }
}

export interface SessionsRequest {
  pagination: PaginationArgument;
  params: Partial<SessionsRequestOptions>;
}



/// be sure to keep this file in sync with `schema/session.graphql`
