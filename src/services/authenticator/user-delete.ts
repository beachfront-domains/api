


//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L S

import { databaseOptions, log } from "~util/index";
import { authenticate, getUser } from "./index";

type AuthResponse = {
  success: boolean;
  user: {
    id: string;
  };
};



//  E X P O R T

export default async(suppliedData: { sessionId: string; userId: string }) => {
  const databaseConnection = await r.connect(databaseOptions);
  const errorMessage = "Unauthorized";
  const { sessionId, userId } = suppliedData;

  switch(true) {
    case !suppliedData:
    case !sessionId:
    case !userId:
      databaseConnection.close();
      log.error(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };

    default:
      break;
  }

  const { email } = await getUser({ id: userId });
  const authenticationResponse: AuthResponse = await authenticate({ email, id: sessionId });

  switch(true) {
    case !authenticationResponse.success:
    case authenticationResponse.user.id !== userId:
      databaseConnection.close();
      log.error(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };

    default:
      break;
  }

  try {
    // await r.table("posts") // delete all posts from this user
    //   .filter({ author: userId })
    //   .delete({ durability: "soft" })
    //   .run(databaseConnection);
    // TODO: Create cron job to delete posts from deleted users

    const deleteUser = await r.table("users").get(userId)
      .delete({ returnChanges: true })
      .run(databaseConnection);

    if (deleteUser.errors > 0) {
      databaseConnection.close();
      log.error("User deletion failed");

      return {
        httpCode: 500,
        message: "User deletion failed",
        success: false
      };
    }

    return {
      httpCode: 200,
      message: "User deletion successful",
      success: true
    };
  } catch(userDeletionError) {
    databaseConnection.close();
    log.error(userDeletionError);

    return {
      httpCode: 500,
      message: "Issue deleting user",
      success: false
    };
  }
};
