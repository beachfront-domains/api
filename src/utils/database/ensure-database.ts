


//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L S

import { databaseOptions, log } from "~util/index";



//  E X P O R T

export default async(database: string) => {
  const databaseConnection = await r.connect(databaseOptions);
  const databaseList = await r.dbList().run(databaseConnection);

  if (!databaseList.includes(database)) {
    await r.dbCreate(database).run(databaseConnection);
    log.info(`⚡️ Created database "${database}"`);
  } else log.info(`✨ Database "${database}" exists`);

  databaseConnection.close();
};
