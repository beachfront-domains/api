


///  I M P O R T

import { resolvers } from "graphql-scalars";

///  U T I L

import {
  getCustomer as customer,
  updateCustomer
} from "~service/human/index";

import {
  createKey,
  readKey as key
} from "~service/develop/index";

import {
  login,
  loginViaKey as loginKey,
  validateAccess as authenticate,
  validateToken as createSession
} from "~service/bouncer/index";



///  E X P O R T

export default {
  ...resolvers,
  /// bouncer
  authenticate,
  createSession,
  login,
  loginKey,
  /// develop
  createKey,
  key,
  /// human
  customer,
  updateCustomer
};



// deleteCustomer,
// exportCustomer,
// customers: getCustomers,
