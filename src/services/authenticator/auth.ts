


//  U T I L S

import { log, redisClient } from "~util/index";
import { getUser } from "~module/user/query";



//  E X P O R T

export default async(suppliedData: { email: string; id: string }) => {
  const { email, id } = suppliedData;
  let errorMessage = "";

  switch(true) {
    case !suppliedData:
    case !email:
    case !id:
      errorMessage = "Unauthorized";
      log.error(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false,
        user: {
          id: null
        }
      };

    default:
      break;
  }

  return new Promise<any>((resolve, reject) => { // FIXME: Create type for `Promise`
    redisClient.get(id, async(error: any, response: any) => { // FIXME: Create type for `response`
      if (error) {
        errorMessage = "Error accessing session from session store";
        log.error(error);

        reject({ // eslint-disable-line prefer-promise-reject-errors
          httpCode: 401,
          message: errorMessage,
          success: false
        });
      }

      response = JSON.parse(response);

      if (!response) {
        errorMessage = "User not found for this session";
        log.error(errorMessage);

        reject({ // eslint-disable-line prefer-promise-reject-errors
          httpCode: 401,
          message: errorMessage,
          success: false
        });
      }

      if (!response.expires) {
        errorMessage = "Session not found";
        log.error(errorMessage);

        reject({ // eslint-disable-line prefer-promise-reject-errors
          httpCode: 404,
          message: errorMessage,
          success: false
        });
      }

      if (!response.user || response.user !== email) {
        errorMessage = "Invalid credentials";
        log.error(errorMessage);

        reject({ // eslint-disable-line prefer-promise-reject-errors
          httpCode: 401,
          message: errorMessage,
          success: false
        });
      }

      resolve({
        httpCode: 200,
        message: "User authenticated",
        success: true,
        user: await getUser({ email })
      });
    });
  });
};
