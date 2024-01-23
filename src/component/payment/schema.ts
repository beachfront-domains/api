


/// util

import type { PaginationArgument } from "../pagination/schema.ts";

interface PaymentMethodRequestParams {
  customer: string; /// customer ID
  kind: PaymentKind;
}



/// export

export enum PaymentKind {
  BTC = "BTC",
  ETH = "ETH",
  FIAT = "FIAT",
  HNS = "HNS"
}

export interface PaymentMethod {
  customer: string; /// ID of customer
  kind: PaymentKind;
  mask: string;
  vendorId: string; /// format: `<vendor>|<uuid in vendor system>` (vendor is lowercase)
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface PaymentMethodCreate {
  params: {
    customer?: string; /// ID of customer, will be supplied via `context`
    kind: PaymentKind;
    /// Based on `kind`, `mask` will either be the last 4 digits of a credit card
    /// or the first half of a cryptocurrency wallet address
    mask: string;
    // Won't exist until created within create method
    // vendorId: string; /// ID of payment method in vendor system (vendor is lowercase)
  }
}

export interface PaymentMethodRequest {
  params: {
    id?: string;
    vendorId?: string;
  }
}

export interface PaymentMethodUpdate {
  params: {
    id?: string;
    vendorId?: string; /// format: `<vendor>|<uuid in vendor system>` (vendor is lowercase)
  }
  updates: {
    mask?: string;
  }
}

export interface PaymentMethodsRequest {
  pagination: PaginationArgument;
  params: Partial<PaymentMethodRequestParams>;
}



/// be sure to keep this file in sync with `schema/payment.graphql`
