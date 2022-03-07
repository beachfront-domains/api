


///  U T I L

import type {
  PaymentMethodKind,
  PaymentMethodVendor
} from "./type";

import type { PaginationArgument } from "../pagination/index";

interface __PaymentMethodRequestOptions {
  customer: string; /// customer ID
  kind: PaymentMethodKind;
  vendor: PaymentMethodVendor;
}



///  E X P O R T

export interface PaymentMethodCreate {
  options: {
    customer?: string; /// ID of customer, will be supplied via `context`
    kind: PaymentMethodKind;
    /// Based on `kind`, `mask` will either be the last 4 digits of a credit card
    /// or the first half of a cryptocurrency wallet address
    mask: string;
    vendor: PaymentMethodVendor;
    // Won't exist until created
    // vendorId: string; /// ID of payment method in vendor system
  }
}

export interface PaymentMethodRequest {
  options: {
    id?: string;
    vendorId?: string;
  }
}

export interface PaymentMethodUpdate {
  changes: {
    mask?: string;
  }
  options: {
    id?: string;
    vendorId?: string;
  }
}

export interface PaymentMethodsRequest {
  options: Partial<__PaymentMethodRequestOptions>;
  pagination: PaginationArgument;
};
