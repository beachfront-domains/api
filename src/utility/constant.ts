


/// import

import { parse } from "dep/std.ts";

/// util

const { environment } = parse(Deno.args);



/// export

export const isDevelopment = environment === "development";
export const maxPaginationLimit = 100;

export const databaseParams = {
  database: "beachfront"
  // host: "127.0.0.1", port: 31101
};
