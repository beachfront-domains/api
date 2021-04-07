


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import {
  databaseOptions,
  verifyHash,
  verifyProof
} from "~util/index";



///  E X P O R T

export default async(responseObject: any, hash: string, customerEmail: string) => {
  const databaseConnection = await r.connect(databaseOptions);

  const passQuery = await r.table("passes").filter({ uid: customerEmail })
    .run(databaseConnection);

  try {
    const pass = passQuery[0];

    if (pass === undefined) {
      databaseConnection.close();
      const errorMessage = "No pass found for email address";

      console.error(errorMessage);
      return responseObject.send(401, { message: errorMessage });
    }

    // If current time is later than the expiration of the pass, no go
    if (Date.now() > +new Date(pass.ttl)) {
      databaseConnection.close();
      const errorMessage = "Pass has expired";

      console.error(errorMessage);
      return responseObject.send(401, { message: errorMessage });
    }

    try {
      verifyHash(hash, pass.hash);
    } catch(hashVerificationError) {
      databaseConnection.close();
      const errorMessage = "Hash verification for pass failed";

      console.error(errorMessage);
      return responseObject.send(401, { message: errorMessage });
    }

    try {
      verifyProof(pass.pass);
    } catch(tokenVerificationError) {
      databaseConnection.close();
      const errorMessage = "Pass verification failed";

      console.error(errorMessage);
      return responseObject.send(401, { message: errorMessage });
    }

    try {
      try {
        // Verify account
        await r.table("customers").filter({ email: customerEmail })
          .update({ verified: true })
          .run(databaseConnection);
      } catch(accountVerificationError) {
        const errorMessage = "Failed to verify account (valid parameters)";

        console.error(errorMessage);
        return responseObject.send(500, { message: errorMessage });
      }

      // Delete pass
      await r.table("passes").get(pass.id)
        .delete()
        .run(databaseConnection);

      return responseObject.send(200, { message: "Verified" });
    } catch(missingParametersError) {
      databaseConnection.close();
      const errorMessage = "Failed to verify account (missing or invalid parameters)";

      console.error(errorMessage);
      return responseObject.send(401, { message: errorMessage });
    }
  } catch(error) {
    databaseConnection.close();
    const errorMessage = "Query for pass validation failed";

    console.error(errorMessage);
    return responseObject.send(401, { message: errorMessage });
  }
};
