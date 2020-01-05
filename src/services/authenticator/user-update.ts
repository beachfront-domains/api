


//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L S

import {
  databaseOptions,
  log,
  objectCompare,
  // removeFromArray,
  usernameBlacklist
} from "~util/index";

import authenticate from "./auth";
import { getUser } from "./user-get";
// import { UserDefaults } from "~module/user/schema";

type AuthResponse = {
  success: boolean;
  user: {
    id: string;
  };
};



//  E X P O R T

export default async(suppliedData: any) => {
  const errorMessage = "Unauthorized";
  const data = suppliedData;
  const dataPull = {}; // for arrays
  const dataPush = {}; // also for arrays
  const dataSet = {};
  const databaseConnection = await r.connect(databaseOptions);

  switch(true) {
    case !data:
    case !data.details:
    case !Object.keys(data.details).length:
    case !data.sessionId:
    case !data.userId:
    case typeof data.sessionId !== "string":
    case typeof data.userId !== "string":
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

  const { details, sessionId, userId } = data;
  const originalUserData = await getUser({ id: userId });
  const authenticationResponse: AuthResponse = await authenticate({ email: details.email, id: sessionId });
  const updatesToMake = details;

  if (details.email) {
    const thisEmailIsTaken = await getUser({ email: details.email });

    if (thisEmailIsTaken) {
      return {
        httpCode: 401,
        message: "Email is already in use",
        success: false
      };
    }
  }

  if (details.login) {
    const thisUsernameIsTaken = await getUser({ username: details.login });

    if (thisUsernameIsTaken) {
      return {
        httpCode: 401,
        message: "Username is taken",
        success: false
      };
    }

    if (
      originalUserData.role !== "Admin" &&
      usernameBlacklist.indexOf(details.login) > 0
    ) {
      return {
        httpCode: 401,
        message: "The login you chose is not allowed",
        success: false
      };
    }

    // TODO:
    // - check if username is part of the blacklist and return failure response
    // - if the requesting user has the role of admin, allow
  }

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

  // TODO:
  // If email is changed, save the user and delete all tokens related to the old email address.
  // If new avatar source is supplied, send that to Thoth/DO Spaces
  // Compare `updates` with user's current data and make changes if needed and valid

  // console.log(originalUserData);
  // console.log("—");
  // console.log(authenticationResponse);

  const diff = objectCompare(updatesToMake, originalUserData); // new data compared to existing data
  const changedParameters = Object.keys(diff); // returns an array

  changedParameters.forEach(parameter => {
    // dataSet[parameter] // dataPush[parameter] // dataPull[parameter]
    //
    // UserDefaults[parameter] // default data
    // originalUserData[parameter] // old data
    // updatesToMake[parameter] // new data

    switch(parameter) {
      case "company":
      case "email": // TODO: Validate
      case "language": // TODO: Iterate through language list to test validity
      case "login": // TODO: Add character limit and validate (no spaces)
      case "loginMethod":
      case "name": // TODO: Add character limit and validate (no spaces)
      case "type":
        (dataSet as any)[parameter] = updatesToMake[parameter].trim();
        break;

      case "id":
      case "role":
        console.log("Nothing should be happening here, users cannot change their IDs"); // eslint-disable-line no-console
        // TODO: Send alert to logger
        break;

      default:
        break;
    }
  });

  // dataPull: array
  // dataPush: array
  // dataSet: string

  await dataSet;
  await dataPull;
  await dataPush;

  const finalObject = {
    ...dataSet,
    ...dataPull,
    ...dataPush,
    updated: new Date()
  };

  // TODO:
  // If no changes were detected, stop here
  // Object.key().length === 0

  // console.log("——— set");
  // console.log(dataSet);
  // console.log("——— pull");
  // console.log(dataPull);
  // console.log("——— push");
  // console.log(dataPush);

  try {
    // console.log("———————————");
    // console.log(finalObject);
    // console.log("———————————");

    const userUpdate = await r.table("users").get(userId)
      .update(finalObject, { returnChanges: true })
      .run(databaseConnection);

    if (userUpdate.errors !== 0) {
      databaseConnection.close();
      log.error("User update failed");

      return {
        httpCode: 500,
        message: "User update failed",
        success: false
      };
    }

    const updatedUser = userUpdate.changes[0].new_val;

    databaseConnection.close();

    return {
      httpCode: 200,
      message: "User update successful",
      success: true,
      user: updatedUser
    };
  } catch(userUpdateError) {
    databaseConnection.close();
    log.error(userUpdateError);

    return {
      httpCode: 500,
      message: "Issue updating user",
      success: false
    };
  }
};
