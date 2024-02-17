


/// export

export const appURL = "http://localhost:2513";
export const isDevelopment = Deno.args.includes("--development") || Deno.args.includes("--staging");
export const maxPaginationLimit = 50;

export const databaseParams = {
  database: "beachfront"
  // host: "127.0.0.1", port: 31101
};
