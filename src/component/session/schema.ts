


/// util

import type { PaginationArgument } from "../pagination/schema.ts";

interface SessionsRequestParams {
  created: string;
  customer: string; /// ID
  updated: string;
}



/// export

export interface CartItem {
  /// NOTE
  /// : for products without duration, like merch, duration is `0`
  duration: number;
  name: string;
  price: string;
}

export interface Session {
  cart: CartItem[];
  customer: string; /// ID
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface SessionCreate {
  params: {
    cart: CartItem[];
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
    /// NOTE
    /// : visitor could be anonymous and later login
    customer?: string; /// ID
  }
}

export interface SessionsRequest {
  pagination: PaginationArgument;
  params: Partial<SessionsRequestParams>;
}



/// be sure to keep this file in sync with `schema/session.graphql`
