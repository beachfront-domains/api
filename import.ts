/// import

import { createClient } from "edgedb";
import { join } from "std/path/mod.ts";
import { log } from "dep/std.ts";
import { parse } from "std/csv/mod.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import { databaseParams, stringTrim } from "src/utility/index.ts";
import { ExtensionTier } from "src/component/extension/schema.ts";
import e from "dbschema";

import type { Extension } from "src/component/extension/schema.ts";

const client = createClient(databaseParams);
const createArray = (arr) => arr.map((item) => toASCII(String(item))).sort();
const portfolio = await Deno.readTextFileSync(join("import", "portfolio.csv"));
const rawPortfolioData = parse(portfolio, { skipFirstRow: true, strip: true });
const portfolioData = rawPortfolioData.filter((extension) =>
  extension.tier.length > 0
);
const portfolioLength = portfolioData.length;
let i = 0;

/// program

portfolioData.map(async (extension) => {
  const query = {} as Extension;

  Object.entries(extension).forEach(([key, value]) => {
    switch (key) {
      case "pairs":
      case "premium": {
        query[key] = value.length > 0 ? createArray([value]) : [];
        break;
      }

      case "unicode": {
        query.name = toASCII(String(value));
        break;
      }

      case "tier": {
        query[key] = ExtensionTier[stringTrim(String(value).toUpperCase())] ===
            stringTrim(String(value).toUpperCase())
          ? ExtensionTier[stringTrim(String(value).toUpperCase())]
          : ExtensionTier.DEFAULT;
        break;
      }

      default:
        break;
    }
  });

  query.registry = "beachfront";

  try {
    const databaseQuery = e.select(
      e.insert(e.Extension, { ...query }),
      () => ({ ...e.Extension["*"] }),
    );
    await databaseQuery.run(client);

    i++;
    console.log(`processed ${i}/${portfolioLength} ::: ${query.name}`);
  } catch (_) {
    log.error(`Exception caught while importing "${query.name}".`);
    log.error(_);
  }
});

/// run importer (note: will need to manually `control+c` when it's finished):
/// > deno run --allow-env --allow-net --allow-read --unstable --import-map import_map.json import.ts

/// clear database (run in EdgeDB REPL):
/// > delete Extension
/// > filter .registry = "beachfront";
