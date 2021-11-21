


///  U T I L

import type { PaginationArgument } from "../pagination/index";



///  E X P O R T

export interface SearchRequest {
  options: {
    ascii?: string;
    emoji?: boolean;
    extension?: string;
    idn?: boolean;
    length?: number;
    name?: string;
    number?: boolean;
    startsWith?: string;
  }
}
