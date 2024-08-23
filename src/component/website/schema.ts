


/// util

import type { PaginationArgument } from "../pagination/schema.ts";



/// export

export interface Website {
  content: string;   /// Markdown
  domain: string;    /// format: `sld.extension` in ASCII
  owner: string;     /// ID of customer
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface WebsiteCreate {
  params: {
    content: string;   /// Markdown
    domain: string;    /// format: `sld.extension` in ASCII
    owner?: string;    /// ID of customer
  }
}

export interface WebsiteRequest {
  params: {
    domain?: string; /// format: `sld.extension` in ASCII
    id?: string;
  }
}

export interface WebsitesRequest {
  pagination: PaginationArgument;
  params: {
    owner: string; /// customer ID
  };
}

export interface WebsiteUpdate {
  params: {
    domain?: string; /// format: `sld.extension` in ASCII
    id?: string;
  }
  updates: {
    content: string; /// Markdown
    owner?: string;  /// ID of customer
  }
}



/// be sure to keep this file in sync with `schema/website.graphql`
