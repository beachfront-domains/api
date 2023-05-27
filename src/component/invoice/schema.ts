


/// util

import type { PaginationArgument } from "../pagination/schema.ts";

interface InvoicesRequestParams {
  customer: string; /// customer ID
  paid: number;
  // payment: InvoiceType;
  // promo: string;

  // NOTE
  // : `payment`, `promo`, `created`, and `updated`
  //   are disabled until range filtering is figured out
}



/// export

export enum InvoiceType {
  ACH = "ACH",
  BTC = "BTC",
  CREDITCARD = "CREDITCARD",
  ETH = "ETH",
  HNS = "HNS",
  WIRE = "WIRE"
}

export enum InvoiceVendor {
  OPENNODE = "OPENNODE",
  SQUARE = "SQUARE",
  STRIPE = "STRIPE"
}

export interface Invoice {
  amount: number;
  contents: string[]; /// format: ["register|eat.lunch", "renew|buy.dinner"]
  customer: string;   /// ID of customer
  invoiceId: number;    /// incremented ID
  paid: number;
  payment: InvoiceType;
  promo: string;
  vendor: InvoiceVendor;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface InvoiceCreate {
  params: {
    amount: number;
    contents: string[]; /// format: ["register|eat.lunch", "renew|buy.dinner"]
    customer: string;   /// ID of customer
    paid: number;
    payment: InvoiceType;
    promo?: string;
    vendor: InvoiceVendor;
  }
}

export interface InvoiceRequest {
  params: {
    id?: string;
    invoiceId?: number;
  }
}

export interface InvoiceUpdate {
  params: {
    id?: string;
    invoiceId?: number;
  }
  updates: {
    paid?: number;
    // - credit card payment could fail but bitcoin payment successful
    // - payment with one vendor could fail but another vendor works
    // ...that's when success would flip from `false` to `true`
    payment?: InvoiceType;
    vendor?: InvoiceVendor;
  }
}

export interface InvoicesRequest {
  pagination: PaginationArgument;
  params: Partial<InvoicesRequestParams>;
}



/// be sure to keep this file in sync with `schema/invoice.graphql`
