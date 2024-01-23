


/// export

export {
  get as getCustomer,
  getMore as getCustomers
} from "./crud/read.ts";

export { default as count }  from "./utility/count.ts";
export { default as create } from "./crud/create.ts";
export { default as del }    from "./crud/delete.ts";
export { default as update } from "./crud/update.ts";
