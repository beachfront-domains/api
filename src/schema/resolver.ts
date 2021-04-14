


///  I M P O R T

import { resolvers } from "graphql-scalars";
import DecimalScalar from "../graphql/scalar/decimal";

///  U T I L

import {
  getCustomer as customer,
  updateCustomer
} from "~service/human/index";

import { getDomain as domain } from "~service/domain/index";
import { searchDomains as search } from "~service/search/index";

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
  /// scalars
  ...resolvers,
  DecimalScalar,
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
  updateCustomer,
  /// sld
  domain,
  /// search
  search
};



// deleteCustomer,
// exportCustomer,
// customers: getCustomers,
