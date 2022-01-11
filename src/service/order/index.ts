


///  U T I L

import {
  get as getOrder,
  getMore as getOrders
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
  getOrder,
  getOrders,
  update
};
