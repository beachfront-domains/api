


/// util

import type { PaginationArgument } from "../pagination/schema.ts";

interface CustomersRequestParams {
  staff: number;
  timezone: string;
  verified: number;
  // NOTE
  // : `created` and `updated` are disabled
  //   until range filtering is figured out
}



/// export

export enum CustomerLoginMethods {
  LINK = "LINK",
  TOKEN = "TOKEN"
}

export enum CustomerRoles {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER"
}

export interface Customer {
  email: string;
  loginMethod: CustomerLoginMethods;
  name: string;
  role: CustomerRoles;
  staff: number;
  timezone: string;
  username: string;
  verified: number;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface CustomerCreate {
  params: {
    email: string;
    loginMethod?: CustomerLoginMethods;
    name?: string;
    role?: CustomerRoles;
    staff?: number;
    timezone?: string;
    username?: string;
  }
}

export interface CustomerRequest {
  params: {
    email?: string;
    id?: string;
    // NOTE
    // : requesting via `username` is disabled
    //   until EdgeDB has better filtering
  }
}

export interface CustomersRequest {
  pagination: PaginationArgument;
  params: Partial<CustomersRequestParams>;
}

export interface CustomerUpdate {
  params: {
    email?: string;
    id?: string;
    // NOTE
    // : requesting via `username` is disabled
    //   until EdgeDB has better filtering
  }
  updates: {
    email?: string;
    loginMethod?: CustomerLoginMethods;
    name?: string;
    role?: CustomerRoles;
    staff?: number;
    timezone?: string;
    username?: string;
  }
}



/// be sure to keep this file in sync with `schema/customer.graphql`
