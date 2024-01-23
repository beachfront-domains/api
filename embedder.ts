


/// import

import * as embedder from "https://deno.land/x/embedder/mod.ts";

/// util

const options = {
  mappings: [
    {
      destDir: "embed/static",
      sourceDir: "static"
    }
  ],
  importMeta: import.meta
};



/// program

if (import.meta.main)
  await embedder.main({ options });
