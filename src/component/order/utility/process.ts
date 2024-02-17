


/// util

import { PaymentVendorName } from "../schema.ts";

type VendorObject = {
  id: string,
  name: keyof typeof PaymentVendorName
};



/// export

export default (obj: VendorObject): VendorObject => {
  const trimmedName = PaymentVendorName[obj.name.trim().toUpperCase()];

  return {
    id: String(obj.id),
    name: trimmedName
  };
}
