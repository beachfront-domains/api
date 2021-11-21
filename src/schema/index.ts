


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
  CustomerUpdate,
  CustomersRequest
} from "./customer/index";

import type {
  Domain,
  DomainCreate,
  DomainRequest,
  DomainUpdate,
  DomainsRequest
} from "./domain/index";

import type {
  Extension,
  ExtensionCreate,
  ExtensionRequest,
  ExtensionUpdate,
  ExtensionsRequest
} from "./extension/index";

import type {
  PaginationArgument,
  PaginationResponse
} from "./pagination/type";

import type {
  SearchRequest,
  SearchResult
} from "./search/index";

import type {
  Session,
  SessionCreate,
  SessionRequest,
  SessionUpdate,
  SessionsRequest
} from "./session/index";

const theSchema = importSchema(join(process.cwd(), join("schema", "schema.graphql")));



///  E X P O R T

export default () => theSchema;

export type {
  Customer,
  CustomerCreate,
  CustomerRequest,
  CustomerUpdate,
  CustomersRequest,
  Domain,
  DomainCreate,
  DomainRequest,
  DomainUpdate,
  DomainsRequest,
  Extension,
  ExtensionCreate,
  ExtensionRequest,
  ExtensionUpdate,
  ExtensionsRequest,
  PaginationArgument,
  PaginationResponse,
  SearchRequest,
  SearchResult,
  Session,
  SessionCreate,
  SessionRequest,
  SessionUpdate,
  SessionsRequest
};
