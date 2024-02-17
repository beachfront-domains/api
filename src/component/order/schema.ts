


/// util

// import type { BagItem } from "../bag/schema.ts";
import type { PaginationArgument } from "../pagination/schema.ts";



/// export

export enum PaymentVendorName {
  OPENNODE = "OPENNODE",
  SQUARE = "SQUARE",
  STRIPE = "STRIPE"
}

export interface Order {
  // bag: BagItem[];
  bag: string;         /// ID
  currency: string;
  customer: string;    /// ID
  number: number;      /// auto-incremented ID
  paid: number;        /// Boolean / 0: false / 1: true
  promo: string;
  total: string;
  vendor: {
    id: string;        /// ID
    name: keyof typeof PaymentVendorName;
  };
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface OrderCreate {
  params: {
    bag: string;       /// ID
    currency?: string;
    customer: string;  /// ID
    paid?: number;     /// Boolean / 0: false / 1: true
    promo?: string;
    // total?: string;    /// should be calculated within the API
    vendor: {
      id: string;      /// ID
      name: keyof typeof PaymentVendorName;
    };
  }
}

export interface OrderRequest {
  params: {
    id: string;
  }
}

export interface OrderUpdate {
  params: {
    id: string;
  }
  updates: {
    currency?: string;
    paid?: number;     /// Boolean / 0: false / 1: true
    promo?: string;
  }
}

export interface OrdersRequest {
  pagination: PaginationArgument;
  params: Partial<{
    created: Date;
    customer: string;  /// ID
    updated: Date;
  }>;
}



/// be sure to keep this file in sync with `schema/order.graphql`
