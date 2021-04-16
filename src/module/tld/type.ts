


///  U T I L

import type { PremiumSLD, ReservedSLD } from "../sld/type";



///  E X P O R T

export type TLD = {
  id: string
  name: string
  nope: string[]
  pair: string[]
  premium: PremiumSLD[]
  premiumPrice: number
  price: number
  reserved: ReservedSLD[]
  unicode: string
  //
  created: string
  updated: string
};
