


///  U T I L

import type { PaginationArgument } from "../pagination/index";



interface __CustomersRequestOptions {
  role: "admin" | "customer";
  staff: boolean;
  timezone: string;
  verified: boolean;
  created: string; // ?
  updated: string; // ?
}



///  E X P O R T

export interface CustomerCreate {
  options: {
    email: string;
    loginMethod?: "link" | "token";
    name?: string;
    role?: "admin" | "customer";
    staff?: boolean;
    timezone?: string;
    username?: string;
  }
}

export interface CustomerRequest {
  options: {
    email?: string;
    id?: string;
    stripeId?: string;
    username?: string;
  }
}

export interface CustomerUpdate {
  changes: {
    email?: string;
    loginMethod?: "link" | "token";
    name?: string;
    role?: "admin" | "customer";
    staff?: boolean;
    timezone?: string;
    username?: string;
  }
  options: {
    email?: string;
    id?: string;
    username?: string;
  }
}

export interface CustomersRequest {
  options: Partial<__CustomersRequestOptions>;
  pagination: PaginationArgument;
};
