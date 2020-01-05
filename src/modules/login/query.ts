"use strict";



//  U T I L S

import { access, authenticate } from "~service/authenticator";
import { log, validateEmail } from "~util/index";
import { validateToken } from "../token/auth";



//  E X P O R T S

export const initSession = async(args: { email: string; token: string }) => {
  const { email, token } = args;

  switch(true) {
    case !email:
      log.error({
        email: email,
        reason: "Email missing"
      });

      return {
        message: "Email missing",
        success: false
      };

    case !validateEmail(email):
      log.error({
        email: email,
        reason: "Email is invalid"
      });

      return {
        message: "Email is invalid",
        success: false
      };

    case !token:
      log.error({
        email: email,
        reason: "Missing token"
      });

      return {
        message: "Token is invalid",
        success: false
      };

    default:
      break;
  }

  try {
    const response = await validateToken(args);
    return response; // eslint-disable-line padding-line-between-statements
  } catch(sessionCreationError) {
    log.error(sessionCreationError);

    return {
      httpCode: 500,
      message: "Error creating session. Try again later.",
      success: false
    };
  }
};

export const login = async(args: { email: string /* , token: string */ }) => {
  const { email } = args; // FIXME: Find what else gets passed here

  switch(true) {
    case !email:
      log.error({
        email: args.email,
        reason: "Email missing"
      });

      return {
        message: "Email missing",
        success: false
      };

    case !validateEmail(email):
      log.error({
        email: args.email,
        reason: "Email is invalid"
      });

      return {
        message: "Email is invalid",
        success: false
      };

    default:
      break;
  }

  try {
    const response = await access(args);
    return response; // eslint-disable-line padding-line-between-statements
  } catch(loginError) {
    log.error(loginError);

    return {
      httpCode: 500,
      message: "Error logging into or creating account. Try again later.",
      success: false
    };
  }

  /*
  query Login($email: String, $token: String) {
    createSession(email: $email, token: $token) {
      message
      session
      success
      user {
        avatar {
          shape
          source
        }
        bannedFrom
        blacklist
        blocked
        blockedFrom
        bio
        dnt
        email
        favoritePosts
        followers
        following
        homepage
        id
        language
        location
        memberships
        name
        nsfw
        palette
        private
        savedPosts
        squad {
          avatar {
            shape
            source
          }
          id
          name
          nsfw
          palette
          private
          username
        }
        timezone
        type
        username
        viewNSFW
      }
    }
  }

  {
    "email": "netopwibby@thenetwork.email",
    "token": "2b05So6TxOK"
  }
  */
};

export const validateAccess = async(args: { email: string; id: string }) => { // FIXME: Find out what is passed here
  // const { email, token } = args;

  try {
    const response = await authenticate(args);
    return response; // eslint-disable-line padding-line-between-statements
  } catch(authenticationError) {
    log.error(authenticationError);

    return {
      httpCode: 500,
      message: "Error authenticating session. Try again later.",
      success: false
    };
  }

  /*
  query CheckSessionDetails($email: String, $id: String) {
    authenticate(email: $email, id: $id) {
      message
      success
      user {
        avatar {
          shape
          source
        }
        bannedFrom
        blacklist
        blocked
        blockedFrom
        bio
        dnt
        email
        favoritePosts
        followers
        following
        homepage
        id
        language
        location
        memberships
        name
        nsfw
        palette
        private
        savedPosts
        squad {
          avatar {
            shape
            source
          }
          id
          name
          nsfw
          palette
          private
          username
        }
        timezone
        type
        username
        viewNSFW
      }
    }
  }

  {
    "email": "netopwibby@thenetwork.email",
    "id": "a675a528b4cc94108b6bd34c14320b7751b36fd3"
  }
  */
};
