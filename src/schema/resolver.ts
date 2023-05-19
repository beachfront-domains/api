


/// util

import {
  create as createCustomer,
  del as deleteCustomer,
  getCustomer as customer,
  getCustomers as customers,
  update as updateCustomer
} from "../component/customer/index.ts";

import {
  create as createDomain,
  del as deleteDomain,
  getDomain as domain,
  getDomains as domains,
  update as updateDomain
} from "../component/domain/index.ts";

import {
  create as createExtension,
  del as deleteExtension,
  getExtension as extension,
  getExtensions as extensions,
  update as updateExtension
} from "../component/extension/index.ts";

import {
  create as createInvoice,
  del as deleteInvoice,
  getInvoice as invoice,
  getInvoices as invoices,
  update as updateInvoice
} from "../component/invoice/index.ts";

import {
  create as createPaymentMethod,
  del as deletePaymentMethod,
  getPaymentMethod as paymentMethod,
  getPaymentMethods as paymentMethods,
  update as updatePaymentMethod
} from "../component/payment/index.ts";

import { search } from "../component/search/index.ts";

import {
  create as createSession,
  del as deleteSession,
  getSession as session,
  getSessions as sessions,
  update as updateSession
} from "../component/session/index.ts";

import {
  welcome as login,
  verify
} from "../component/access/index.ts";



/// export

export const Query = {
  customer,
  customers,
  domain,
  domains,
  extension,
  extensions,
  invoice,
  invoices,
  login,
  paymentMethod,
  paymentMethods,
  search,
  session,
  sessions,
  verify
};

export const Mutation = {
  createCustomer,
  createDomain,
  createExtension,
  createInvoice,
  createPaymentMethod,
  createSession,
  deleteCustomer,
  deleteDomain,
  deleteExtension,
  deleteInvoice,
  deletePaymentMethod,
  deleteSession,
  updateCustomer,
  updateDomain,
  updateExtension,
  updateInvoice,
  updatePaymentMethod,
  updateSession
};
