


///  N A T I V E

import { join } from "path";
import process from "process";

///  I M P O R T

import { importSchema } from "graphql-import";

///  U T I L

import type {
  Customer,
  CustomerCreate,
  CustomerRequest,
  CustomersRequest,
  CustomerUpdate
} from "./customer/index";

import type {
  Domain,
  DomainCreate,
  DomainRequest,
  DomainsRequest,
  DomainUpdate
} from "./domain/index";

import type {
  Extension,
  ExtensionCreate,
  ExtensionRequest,
  ExtensionsRequest,
  ExtensionUpdate
} from "./extension/index";

import type {
  Order,
  OrderCreate,
  OrderRequest,
  OrderUpdate,
  OrdersRequest
} from "./order/index";

import type {
  PaginationArgument,
  PaginationResponse
} from "./pagination/type";

import type {
  PaymentMethod,
  PaymentMethodCreate,
  PaymentMethodRequest,
  PaymentMethodsRequest,
  PaymentMethodUpdate
} from "./payment/index";

import type {
  SearchRequest,
  SearchResult
} from "./search/index";

import type {
  Session,
  SessionCreate,
  SessionRequest,
  SessionsRequest,
  SessionUpdate
} from "./session/index";

const theSchema = importSchema(join(process.cwd(), join("schema", "schema.graphql")));



///  E X P O R T

export default () => theSchema;

export type {
  Customer,
  CustomerCreate,
  CustomerRequest,
  CustomersRequest,
  CustomerUpdate,
  Domain,
  DomainCreate,
  DomainRequest,
  DomainsRequest,
  DomainUpdate,
  Extension,
  ExtensionCreate,
  ExtensionRequest,
  ExtensionsRequest,
  ExtensionUpdate,
  Order,
  OrderCreate,
  OrderRequest,
  OrdersRequest,
  OrderUpdate,
  PaginationArgument,
  PaginationResponse,
  PaymentMethod,
  PaymentMethodCreate,
  PaymentMethodRequest,
  PaymentMethodsRequest,
  PaymentMethodUpdate,
  SearchRequest,
  SearchResult,
  Session,
  SessionCreate,
  SessionRequest,
  SessionsRequest,
  SessionUpdate
};
