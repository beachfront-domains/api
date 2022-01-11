


///  E X P O R T

export enum OrderEnum {
  REGISTER,
  RENEW
};

export enum PaymentEnum {
  ACH,
  BTC,
  CC,
  HNS
};

export type Order = {
  amount: number;
  contents: string[];
  customer: string; /// ID of customer
  payment: PaymentEnum;
  promo: string;
  success: boolean;
  type: OrderEnum;
  ///
  created: string;
  id: string; /// incremented ID
  updated: string;
};



/// be sure to keep this file in sync with `schema/order.graphql`
