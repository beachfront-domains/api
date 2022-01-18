


///  U T I L

import type { Customer } from "../customer";



///  E X P O R T

export type Session = {
  cart: string[];
  customer: Customer;
  ///
  created: string;
  id: string;
  updated: string;
};



/// be sure to keep this file in sync with `schema/session.graphql`
