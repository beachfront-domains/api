


/// util

import type { PaginationArgument } from "../pagination/schema.ts";
import type { PaymentKind } from "../payment/schema.ts";
import type { ExtensionTier } from "../extension/schema.ts";



/// export

export interface BagItem {
  /// NOTE
  /// : for products without duration, like merch, duration is `0`
  duration: number;
  name: string;
  paired: Array<string>;
  premium: number;
  price: string;
  tier: ExtensionTier;
}

export interface Bag {
  bag: BagItem[];
  currency: PaymentKind;
  customer?: string; /// ID
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface BagCreate {
  params: {
    bag: BagItem[];
    currency?: PaymentKind;
    customer?: string; /// ID
  }
}

export interface BagRequest {
  params: {
    id: string;
  }
}

export interface BagUpdate {
  params: {
    id: string;
  }
  updates: {
    bag: BagItem[];
    currency: PaymentKind;
    /// NOTE
    /// : visitor could be anonymous and later login
    customer?: string; /// ID
  }
}

export interface BagsRequest {
  pagination: PaginationArgument;
  params: Partial<{
    created: string;
    currency: PaymentKind;
    customer: string; /// ID
    updated: string;
  }>;
}



/// be sure to keep this file in sync with `schema/bag.graphql`
