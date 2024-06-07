


/// export

export const isDevelopment = Deno.args.includes("development"); // Deno.build.os !== "linux";

export const appURL = isDevelopment ? "http://localhost:2513" : "https://beachfront.domains";
export const databaseParams = { database: "primary" };
export const maxPaginationLimit = 50;
