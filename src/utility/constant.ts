


/// export

export const isDevelopment = Deno.args.includes("development"); // Deno.build.os !== "linux";

export const appURL = isDevelopment ? "http://localhost:2513" : "https://beachfront.domains";
export const databaseParams = { database: "primary" };
export const maxPaginationLimit = 50;
export const sandcastleURL = isDevelopment ? "http://localhost:3700" : "https://sandcastle.beachfront.domains";
