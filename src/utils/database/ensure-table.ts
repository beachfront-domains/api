


//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L S

import { databaseOptions, log } from "~util/index";



//  E X P O R T

export default async(table: string, index?: string|string[]) => {
  const databaseConnection = await r.connect(databaseOptions);

  try {
    await ensureCheck();
    log.info(`✨ Table "${table}", ready`);
  } catch(tableConnectionError) {
    await ensureCheck();
    log.info(`⚡️ Created "${table}" table`);
  }

  finally {
    databaseConnection.close();
  }

  async function ensureCheck() {
    const tableList = await r.tableList().run(databaseConnection);

    if (tableList.includes(table)) {
      // Table exists
    } else {
      // Create table
      await r.tableCreate(table).run(databaseConnection);
    }

    const indexList = await r.table(table).indexList()
      .run(databaseConnection);

    // Supplied index is an array
    if (index && Array.isArray(index)) {
      const indexPromises = [];

      index.map(indexItem => {
        if (indexList.includes(indexItem)) {
          // Wait for index to load
          indexPromises.push(r.table(table).indexWait(indexItem)
            .run(databaseConnection));
        } else {
          // Create index
          indexPromises.push(r.table(table).indexCreate(indexItem)
            .run(databaseConnection));
        }
      });

      await Promise.all(indexPromises);
    }

    // Supplied index is a string
    else if (index) {
      if (indexList.includes(String(index))) {
        // Wait for index to load
        await r.table(table).indexWait(String(index))
          .run(databaseConnection);
      } else {
        // Create index
        await r.table(table).indexCreate(String(index))
          .run(databaseConnection);
      }
    }

    // Load the table
    else
      await r.table(table).run(databaseConnection);

  }
};
