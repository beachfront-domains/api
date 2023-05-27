


/// util

import type { Customer } from "src/component/customer/schema.ts";



/// export

export default (customer: Customer): boolean => String(customer.role).toLowerCase() === "admin";
