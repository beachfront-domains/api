


///  U T I L

import {
  get as getCustomer,
  getMore as getCustomers
} from "./crud/read";

import count from "./utility/count";
import create from "./crud/create";
import del from "./crud/delete";
import update from "./crud/update";



///  E X P O R T

export {
  count,
  create,
  del,
  getCustomer,
  getCustomers,
  update
};
