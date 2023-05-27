


/// import

import { parse } from "dep/std.ts";



/// export

export const { coinmarketcapKey, thesaurusKey } = parse(Deno.args);
export const maxPaginationLimit = 100;

// TODO
// : support `Deno.args`

export const databaseParams = {
  database: "beachfront"
  // host: "127.0.0.1", port: 31101
};
