


///  U T I L

import type { Customer } from "~schema/customer/index";



///  E X P O R T

export default (customer: Customer): boolean => {
  return customer.role === "admin";
};
