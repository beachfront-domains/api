


///  U T I L

import type { Customer } from "../customer/type";



///  E X P O R T

export type SLD = {
  expiry: string
  id: string
  // marketplace: boolean
  name: string
  owner: Customer
  registrar: string
  status: string
  tld: string
  unicode: string
  //
  created: string
  updated: string
};


export type PremiumSLD = {
  name: string
  price: number
  unicode: string
};

export type ReservedSLD = {
  code: string
  name: string
  price: number
  unicode: string
};
