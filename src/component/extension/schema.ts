


/// util

import type { PaginationArgument } from "../pagination/schema.ts";

interface ExtensionsRequestOptions {
  // emoji: number;      /// boolean / 0 = false, 1 = true
  // idn: number;        /// boolean / 0 = false, 1 = true
  // length: number;
  // numeric: number;    /// boolean / 0 = false, 1 = true
  registry: string; // TODO: save as lowercase ASCII?
  // startsWith: string;

  // NOTE
  // : `emoji`, `idn`, `length`, `numeric`, `startsWith`, `created`, and `updated`
  //   are disabled until range filtering is figured out
}



/// export

export interface Extension {
  name: string; /// ASCII
  registry: string;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface ExtensionCreate {
  params: {
    name?: string;
  }
}

export interface ExtensionRequest {
  params: {
    id?: string;
    name?: string;
  }
}

export interface ExtensionUpdate {
  params: {
    id?: string;
    name?: string;
  }
  updates: {
    registry?: string;
  }
}

export interface ExtensionsRequest {
  pagination: PaginationArgument;
  params: Partial<ExtensionsRequestOptions>;
}



/// be sure to keep this file in sync with `schema/extension.graphql`
