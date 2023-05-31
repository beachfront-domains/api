


/// util

import type { PaginationArgument } from "../pagination/schema.ts";

interface ExtensionsRequestParams {
  // emoji: number;      /// boolean / 0 = false, 1 = true
  // idn: number;        /// boolean / 0 = false, 1 = true
  // length: number;
  // numeric: number;    /// boolean / 0 = false, 1 = true
  // registry: string; // TODO: save as lowercase ASCII?
  tier: "DEFAULT" | "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  // startsWith: string;

  // NOTE
  // : `emoji`, `idn`, `length`, `numeric`, `startsWith`, `created`, and `updated`
  //   are disabled until range filtering is figured out
}



/// export

export enum ExtensionTier {
  DEFAULT = "DEFAULT",
  COMMON = "COMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY"
}

export interface Extension {
  name: string;
  pairs: string[];    // related extension names
  premium: string[];  // high-quality SLDs
  registry: string;   // TODO | should be an ID in the future
  tier: ExtensionTier;
  ///
  created: Date;
  id: string;
  updated: Date;
}

export interface ExtensionCreate {
  params: {
    name: string;
    pairs?: string[];    // related extension names
    premium?: string[];  // high-quality SLDs
    registry?: string;   // TODO | should be an ID in the future
    tier?: ExtensionTier;
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
    pairs: string[];
    premium: string[];
    registry?: string;
  }
}

export interface ExtensionsRequest {
  pagination: PaginationArgument;
  params: Partial<ExtensionsRequestParams>;
}



/// be sure to keep this file in sync with `schema/extension.graphql`
