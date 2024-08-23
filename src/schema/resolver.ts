


/// util

import {
  create as createBag,
  del as deleteBag,
  getBag as bag,
  getBags as bags,
  update as updateBag
} from "../component/bag/index.ts";

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

// import {
//   create as createInvoice,
//   del as deleteInvoice,
//   getInvoice as invoice,
//   getInvoices as invoices,
//   update as updateInvoice
// } from "../component/invoice/index.ts";

import {
  create as createLogin,
  del as deleteLogin,
  getLogin as login
} from "../component/login/index.ts";

import {
  create as createOrder,
  del as deleteOrder,
  getOrder as order,
  getOrders as orders,
  update as updateOrder
} from "../component/order/index.ts";

// import {
//   create as createPaymentMethod,
//   del as deletePaymentMethod,
//   getPaymentMethod as paymentMethod,
//   getPaymentMethods as paymentMethods,
//   update as updatePaymentMethod
// } from "../component/payment/index.ts";

import { search } from "../component/search/index.ts";

import {
  create as createSession,
  del as deleteSession,
  getSession as session,
  getSessions as sessions,
  update as updateSession
} from "../component/session/index.ts";

// import {
//   welcome as login,
//   verify
// } from "../component/access/index.ts";

import {
  create as createWebsite,
  // del as deleteWebsite,
  getWebsite as website,
  getWebsites as websites,
  // update as updateWebsite
} from "../component/website/index.ts";



/// export

export const Query = {
  bag,
  bags,
  customer,
  customers,
  domain,
  domains,
  extension,
  extensions,
  // invoice,
  // invoices,
  login,
  order,
  orders,
  // paymentMethod,
  // paymentMethods,
  search,
  session,
  sessions,
  website,
  websites
};

export const Mutation = {
  createBag,
  createCustomer,
  createDomain,
  createExtension,
  // createInvoice,
  createLogin,
  createOrder,
  // createPaymentMethod,
  createSession,
  createWebsite,
  deleteBag,
  deleteCustomer,
  deleteDomain,
  deleteExtension,
  // deleteInvoice,
  deleteLogin,
  deleteOrder,
  // deletePaymentMethod,
  deleteSession,
  updateBag,
  updateCustomer,
  updateDomain,
  updateExtension,
  // updateInvoice,
  updateOrder,
  // updatePaymentMethod,
  updateSession
};
