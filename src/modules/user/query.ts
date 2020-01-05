


//  U T I L S

import {
  deleteUser as remove,
  exportUser as userExport,
  getUser as get,
  getUsers as getManygetUsers,
  updateUser as update
} from "~service/authenticator";

import { log } from "~util/index";



//  E X P O R T S

export const deleteUser = async(args: any) => { // FIXME: Find what else gets passed here
  try {
    const response = await remove(args);
    return response; // eslint-disable-line padding-line-between-statements
  } catch(userDeletionError) {
    log.error(userDeletionError);

    return {
      httpCode: 500,
      message: "Error deleting user. Try again later.",
      success: false
    };
  }

  /*
  mutation DeleteUser($userId: ID!, $sessionId: String!) {
    deleteUser(userId: $userId, sessionId: $sessionId) {
      message
      success
    }
  }

  # query variables

  {
    "userId": "4c984a5a-8b00-4c45-aa21-9c678606926b",
    "sessionId": "9e2452725501044d5b060e9b79a11a59fd157a83"
  }
  */
};

export const exportUser = async(args: any) => { // FIXME: Find what else gets passed here
  try {
    const response = await userExport(args);
    return response; // eslint-disable-line padding-line-between-statements
  } catch(userExportError) {
    log.error(userExportError);

    return {
      httpCode: 500,
      message: "Error exporting user. Try again later.",
      success: false
    };
  }

  /*
  query ExportUser($userId: ID!, $sessionId: String!) {
    exportUser(userId: $userId, sessionId: $sessionId) {
      file
      message
      success
      user {
        id
      }
    }
  }

  # query variables

  {
    "userId": "4c984a5a-8b00-4c45-aa21-9c678606926b",
    "sessionId": "9e2452725501044d5b060e9b79a11a59fd157a83"
  }
  */
};

export const getUser = async(args: any) => { // FIXME: Find what else gets passed here
  try {
    const response = await get(args);
    return response; // eslint-disable-line padding-line-between-statements
  } catch(userUpdateError) {
    log.error(userUpdateError);

    return {
      httpCode: 500,
      id: null,
      message: "Error finding user. Try again later.",
      success: false
    };
  }

  /*
  query getSingleUser($userID: ID!) {
    user(id: $userID) {
      id
      language
      loginMethod
      namePrimary
      nameSecondary
      plan
      role
    }
  }

  {
    "userID": "5c305ac049480a69ec564478"
  }
  */
};

export const getUsers = async(args: any) => { // FIXME: Find what else gets passed here
  try {
    const response = await getManygetUsers(args);
    return response; // eslint-disable-line padding-line-between-statements
  } catch(userRetrievalError) {
    log.error(userRetrievalError);

    return {
      httpCode: 500,
      message: "Error retrieving users. Try again later.",
      success: false
    };
  }

  /*
    query getManyUsers($private: Boolean!) {
      users(private: $private) {
        id
        language
        loginMethod
        namePrimary
        nameSecondary
        plan
        role
      }
    }

    // variables

    {
      "private": false
    }
  */
};

export const updateUser = async(args: any) => { // FIXME: Find what else gets passed here
  try {
    const response = await update(args);
    return response; // eslint-disable-line padding-line-between-statements
  } catch(userUpdateError) {
    log.error(userUpdateError);

    return {
      httpCode: 500,
      message: "Error updating user. Try again later.",
      success: false
    };
  }

  /*
  mutation UpdateUser($userId: ID!, $inputDetails: UserInput!, $sessionId: String!) {
    updateUser(userId: $userId, details: $inputDetails, sessionId: $sessionId) {
      message
      success
      user {
        id
      }
    }
  }

  # query variables

  {
    "userId": "4c984a5a-8b00-4c45-aa21-9c678606926b",
    "inputDetails": {
      "plan": "mo-money"
    },
    "sessionId": "9e2452725501044d5b060e9b79a11a59fd157a83"
  }
  */
};
