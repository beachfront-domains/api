


///  I M P O R T

import { resolvers } from "graphql-scalars";

///  U T I L

import DecimalScalar from "../graphql/scalar/decimal";

import {
  create as createCustomer,
  del as deleteCustomer,
  getCustomer as customer,
  getCustomers as customers,
  update as updateCustomer
} from "~service/customer/index";

import {
  create as createDomain,
  del as deleteDomain,
  getDomain as domain,
  getDomains as domains,
  update as updateDomain
} from "~service/domain/index";

import {
  create as createExtension,
  del as deleteExtension,
  getExtension as extension,
  getExtensions as extensions,
  update as updateExtension
} from "~service/extension/index";

import { search } from "~service/search/index";

import {
  create as createSession,
  del as deleteSession,
  getSession as session,
  getSessions as sessions,
  update as updateSession
} from "~service/session/index";



///  E X P O R T

export default {
  ...resolvers,
  DecimalScalar,

  /// customer
  createCustomer,
  customer,
  customers,
  deleteCustomer,
  updateCustomer,

  /// domain
  createDomain,
  deleteDomain,
  domain,
  domains,
  updateDomain,

  /// extension
  createExtension,
  deleteExtension,
  extension,
  extensions,
  updateExtension,

  /// search
  search,

  /// session
  createSession,
  deleteSession,
  session,
  sessions,
  updateSession
};
