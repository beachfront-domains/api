


/// util

import { PaymentVendorName } from "../schema.ts";



/// export

export default (obj: { id: string, name: keyof typeof PaymentVendorName }): { id: string, name: keyof typeof PaymentVendorName } => { // | null
  // if (!obj.id) // || typeof obj.name !== PaymentVendorName)
  //   return null;

  const trimmedName = PaymentVendorName[obj.name.trim().toUpperCase()]; // || null;

  // if (!trimmedName)
  //   return null;

  return {
    id: String(obj.id),
    name: trimmedName
  };
}
