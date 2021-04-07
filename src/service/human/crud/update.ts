


///  I M P O R T

import normalizeUrl from "normalize-url";
import { r } from "rethinkdb-ts";

///  U T I L

import {
  databaseOptions,
  // emojiSkinTones,
  FunctionResponseInterface,
  invalidUsername,
  objectCompare,
  printError,
  // pronouns,
  regexLink,
  regexZeroWidth,
  removeFromArray
  // zeroWidthCharacters
  // sanityCheck
} from "~util/index";

import authenticate from "~service/bouncer/auth";
import bouncer from "~service/bouncer/api-auth";
import { _getCustomerRaw, getCustomer } from "./read";
import { CustomerDefaults } from "~module/customer/default";
import type { Customer } from "~module/customer/type";

const customerDatabase = "customers";

const lengthLimitBio = 160;
const lengthLimitEmail = 60;
const lengthLimitHomepage = 64;
const lengthLimitLocation = 60;
const lengthLimitName = 60;
const lengthLimitCustomername = 30;

export interface FunctionResponse extends FunctionResponseInterface {
  /// TS4082: exporting because TypeScript thinks
  /// "FunctionResponse" is private otherwise
  detail?: {
    customer: Customer;
  }
}

export interface IncomingDataInterface {
  /// TS4082: exporting because TypeScript thinks
  /// "IncomingDataInterface" is private otherwise
  auth: {
    sessionId: string;
    customerId: string;
  };
  changes: Customer;
};



///  E X P O R T

export default async(suppliedData: IncomingDataInterface): Promise<FunctionResponse> => {
  // updateCustomer(auth: Authentication!, changes: CustomerInput!): CustomerUpdate
  const { auth, changes } = suppliedData;
  const vibeCheck = await bouncer(auth);

  const dataPull = {}; // for arrays
  const dataPush = {}; // also for arrays
  const dataSet = {};
  const errorMessage = "Unauthorized";

  /*
  sanityCheck({
    // TODO
    // : support objects
    checkExist: [
      String(auth.sessionId),
      String(auth.customerId)
      // changes
    ],
    checkLength: [
      // Object.keys(auth),
      // Object.keys(changes),
      String(auth.sessionId),
      String(auth.customerId)
    ]
  });
  */

  if (!vibeCheck.detail) {
    const errorMessage = "Unauthorized";
    printError(errorMessage);

    return {
      httpCode: 401,
      message: errorMessage,
      success: false
    };
  }

  const databaseConnection = await r.connect(databaseOptions);
  const { sessionId, customerId } = auth;
  const updatesToMake = changes;
  const { customer } = vibeCheck.detail;
  const originalCustomerData = customer;

  switch(false) {
    case customer.id === customerId:
      databaseConnection.close();
      console.error(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };

    default:
      break;
  }

  if (changes.bio) {
    /// bio contains homograph-enabling characters
    if (regexZeroWidth(changes.bio)) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: "Bio contains invalid characters…remove them",
        success: false
      };
    }

    /// bio is too long
    if (String(changes.bio).length > lengthLimitBio) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: `Bio is too long, ${lengthLimitBio} characters max please!`,
        success: false
      };
    }
  }

  if (changes.email) {
    const thisEmailIsTaken = await getCustomer({ email: changes.email });

    /// email is taken
    if (Object.keys(thisEmailIsTaken).length > 0) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: "Email is already in use",
        success: false
      };
    }

    /// email is too long
    if (String(changes.email).length > lengthLimitEmail) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: `Email is too long, ${lengthLimitEmail} characters max please!`,
        success: false
      };
    }
  }

  if (changes.homepage) {
    /// homepage contains homograph-enabling characters
    if (regexZeroWidth(changes.homepage)) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: "Homepage contains invalid characters…remove them",
        success: false
      };
    }

    /// homepage is too long
    if (String(changes.homepage).length > lengthLimitHomepage) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: `Homepage is too long, ${lengthLimitHomepage} characters max please!`,
        success: false
      };
    }

    /// homepage is an invalid url
    if (!regexLink(changes.homepage)) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: `Homepage is in an invalid format`,
        success: false
      };
    }
  }

  if (changes.location) {
    /// location contains homograph-enabling characters
    if (regexZeroWidth(changes.location)) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: "Location contains invalid characters…remove them",
        success: false
      };
    }

    /// location is too long
    if (String(changes.location).length > lengthLimitLocation) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: `Location is too long, ${lengthLimitLocation} characters max please!`,
        success: false
      };
    }
  }

  if (changes.name) {
    /// name contains homograph-enabling characters
    if (regexZeroWidth(changes.name)) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: "Name contains invalid characters…remove them",
        success: false
      };
    }

    /// name is too long
    if (String(changes.name).length > lengthLimitName) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: `Name is too long, ${lengthLimitName} characters max please!`,
        success: false
      };
    }
  }

  if (changes.username) {
    const thisCustomernameIsTaken = await getCustomer({ username: changes.username });

    /// username is taken
    if (Object.keys(thisCustomernameIsTaken).length > 0) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: "Customername is already in use",
        success: false
      };
    }

    /// username is too long
    if (String(changes.username).length > lengthLimitCustomername) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: `Customername is too long, ${lengthLimitCustomername} characters max please!`,
        success: false
      };
    }

    /// username contains homograph-enabling characters, or spaces
    if (regexZeroWidth(changes.username) || String(changes.username).includes(" ")) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: "Customername contains invalid characters…remove them",
        success: false
      };
    }

    /// Block non-admin customer from changing username to a restricted username
    /// If customer has an admin role, proceed.
    if (originalCustomerData.role !== "admin" && invalidUsername.indexOf(changes.username) > 0) {
      databaseConnection.close();

      return {
        httpCode: 401,
        message: "Customername is not allowed",
        success: false
      };
    }
  }

  // TODO
  // : If email is changed, save the customer and delete all tokens related to the old email address.
  // : If new avatar source is supplied, send that to Thoth/DO Spaces
  // : Compare `updates` with customer's current data and make changes if needed and valid

  // console.log(originalCustomerData);

  const diff = objectCompare(updatesToMake, originalCustomerData); // new data compared to existing data
  const changedParameters = Object.keys(diff); // returns an array

  // console.log("——— 01");
  // console.log(updatesToMake);
  // console.log(originalCustomerData);

  // console.log("——— 02");
  // console.log(diff);
  // console.log("——— 03");
  // console.log(changedParameters);

  changedParameters.forEach(parameter => {
    // dataSet[parameter] // dataPush[parameter] // dataPull[parameter]
    //
    // CustomerDefaults[parameter] // default data
    // originalCustomerData[parameter] // old data
    // updatesToMake[parameter] // new data

    switch(parameter) {
      case "avatar":
        dataSet[parameter] = String(updatesToMake[parameter]).trim();
        break;

      case "bio":
        dataSet[parameter] = String(updatesToMake[parameter]).trim();
        break;

      case "email":
        dataSet[parameter] = updatesToMake[parameter].trim();
        break;

      case "homepage":
        dataSet[parameter] = String(updatesToMake[parameter]).trim();
        break;

      case "id":
        console.log("Nothing should be happening here, people cannot change their IDs");
        // TODO
        // : send alert to Amun
        break;

      case "language":
        // TODO
        // : iterate through language list to test validity
        console.log(parameter, "is set to change");
        break;

      case "location":
        // TODO
        // : provide coordinates to areas in space, fictional places, &c
        dataSet[parameter] = String(updatesToMake[parameter]).trim();
        break;

      case "name":
        dataSet[parameter] = String(updatesToMake[parameter]).trim();
        break;

      case "role": // prevent randos from giving themselves powers
        console.log("Nothing should be happening here, people cannot change their roles");
        dataSet[parameter] = "customer";
        // TODO
        // : send alert to Amun
        break;

      case "timezone":
        // TODO
        // : iterate through timezone list to test validity
        console.log(parameter, "is set to change");
        break;

      case "type":
        // TODO
        // : iterate through default enums to test validity
        console.log(parameter, "is set to change");
        break;

      case "username":
        dataSet[parameter] = String(updatesToMake[parameter]);
        break;

      default:
        break;
    }
  });

  // dataPull
  // - squadmates

  // dataPush
  // - avatars
  // - bannedFrom
  // - blacklist
  // - blocked
  // - favoritePosts
  // - followers
  // - following
  // - memberships
  // - palette
  // - savedPosts
  // - squad

  // dataSet
  // - everything else

  await dataSet;
  await dataPull;
  await dataPush;

  const finalObject = {
    ...dataSet,
    ...dataPull,
    ...dataPush
  };

  // TODO:
  // If no changes were detected, stop here
  // Object.key().length === 0

  // @ts-ignore TS2339: Property "updated" does not exist on type "{}".
  finalObject.updated = new Date();

  try {
    const customerUpdate = await r.table(customerDatabase)
      .get(customerId)
      .update(finalObject, {
        returnChanges: true
      })
      .run(databaseConnection);

    if (customerUpdate.errors > 0) {
      databaseConnection.close();
      console.error("Customer update unsuccessful");

      return {
        httpCode: 500,
        message: "Customer update unsuccessful",
        success: false
      };
    }

    const updatedCustomer = customerUpdate.changes && customerUpdate.changes[0].new_val;
    databaseConnection.close();
    const [updatedCustomerData] = await Promise.all([getCustomer({ id: customerId })]);

    // @ts-ignore TS2339: Property "blocked" does not exist on type "{} | Customer".
    updatedCustomer.blocked = updatedCustomerData.blocked;
    // @ts-ignore TS2339: Property "squad" does not exist on type "{} | Customer".
    updatedCustomer.squad = updatedCustomerData.squad;

    console.log("——— update successful ———");
    console.log(updatedCustomer);

    return {
      detail: {
        customer: updatedCustomer
      },
      httpCode: 200,
      message: "Customer update successful",
      success: true
    };
  } catch(customerUpdateError) {
    databaseConnection.close();
    console.error(customerUpdateError);

    return {
      httpCode: 500,
      message: "Issue updating customer",
      success: false
    };
  }
};
