


///  U T I L

import type { OrderEnum, PaymentEnum } from "./type";
import type { PaginationArgument } from "../pagination/index";

interface __OrdersRequestOptions {
  customer: string; /// customer ID
  payment: string;
  promo: string;
  success: boolean;
  type: string;
}



///  E X P O R T

export interface OrderCreate {
  options: {
    amount: number;
    contents: string[];
    customer: string; /// ID of customer
    payment: PaymentEnum;
    promo?: string;
    success: boolean;
    type: OrderEnum;
  }
}

export interface OrderRequest {
  options: {
    id: string;
  }
}

export interface OrderUpdate {
  changes: {
    // TODO
    // : not sure if updates would ever be
    //   made, outside of `success` parameter
    payment?: PaymentEnum;
    success?: boolean;
  }
  options: {
    id: string;
  }
}

export interface OrdersRequest {
  options: Partial<__OrdersRequestOptions>;
  pagination: PaginationArgument;
};
