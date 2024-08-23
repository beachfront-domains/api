


/// import

import { importQL } from "dep/x/alpha.ts";
import { join } from "dep/std.ts";

/// util

const schema = importQL(join("schema", "schema.graphql"));



/// export

export default () => schema;

export type {
  Bag,
  BagCreate,
  BagRequest,
  BagsRequest,
  BagUpdate
} from "../component/bag/schema.ts";

export type {
  Customer,
  CustomerCreate,
  CustomerRequest,
  CustomersRequest,
  CustomerUpdate
} from "../component/customer/schema.ts";

export type {
  Domain,
  DomainCreate,
  DomainRequest,
  DomainsRequest,
  DomainUpdate
} from "../component/domain/schema.ts";

export type {
  Extension,
  ExtensionCreate,
  ExtensionRequest,
  ExtensionsRequest,
  ExtensionUpdate
} from "../component/extension/schema.ts";

// export type {
//   Invoice,
//   InvoiceCreate,
//   InvoiceRequest,
//   InvoiceUpdate,
//   InvoicesRequest
// } from "../component/invoice/schema.ts";

// export type {
//   PaginationArgument,
//   PaginationResponse
// } from "../component/pagination/schema.ts";

export type {
  Login,
  LoginCreate,
  LoginRequest
} from "../component/login/schema.ts";

export type {
  Order,
  OrderCreate,
  OrderRequest,
  OrdersRequest,
  OrderUpdate
} from "../component/order/schema.ts";

// export type {
//   PaymentMethod,
//   PaymentMethodCreate,
//   PaymentMethodRequest,
//   PaymentMethodsRequest,
//   PaymentMethodUpdate
// } from "../component/payment/schema.ts";

export type {
  SearchRequest,
  SearchResult
} from "../component/search/schema.ts";

export type {
  Session,
  SessionCreate,
  SessionRequest,
  SessionsRequest,
  SessionUpdate
} from "../component/session/schema.ts";

export type {
  Website,
  WebsiteCreate,
  WebsiteRequest,
  WebsitesRequest,
  WebsiteUpdate
} from "../component/website/schema.ts";
