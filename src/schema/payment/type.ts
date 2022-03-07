


///  E X P O R T

export enum PaymentMethodKind {
  CRYPTOCURRENCY,
  FIAT
}

export enum PaymentMethodVendor {
  OPENNODE,
  SQUARE
}

export type PaymentMethod = {
  customer?: string; /// ID of customer
  kind?: PaymentMethodKind; /// enum
  mask?: string;
  vendor?: PaymentMethodVendor; /// enum
  vendorId?: string; /// ID of payment method in vendor system
  ///
  created: string;
  id: string;
  updated: string;
};



/// be sure to keep this file in sync with `schema/payment.graphql`
