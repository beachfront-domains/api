


///  U T I L

import { FunctionResponseInterface, printError, redisClient } from "~util/index";
import { getCustomer } from "~service/human/index";

export interface FunctionResponse extends FunctionResponseInterface {
  detail?: {
    customer?: any;
  };
}



///  E X P O R T

export default async(suppliedData: { email: string, token: string }): Promise<FunctionResponse> => {
  let errorMessage = "";

  switch(false) {
    case Object.keys(suppliedData).length > 0:
    case String(suppliedData.email).length > 0:
    case String(suppliedData.token).length > 0:
      errorMessage = "Unauthorized";
      printError(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };

    default:
      break;
  }

  const { email, token } = suppliedData;

  return new Promise((resolve: any, reject: any) => {
    redisClient.get(token, async(error: any, response: any) => {
      if (error) {
        errorMessage = "Error accessing session from session store";
        printError(error);

        reject({
          httpCode: 401,
          message: errorMessage,
          success: false
        });

        // reject(new (NeueError as any).fromCode(401));
        return;
      }

      response = JSON.parse(response);

      if (!response) {
        errorMessage = "Customer not found for this session";
        printError(errorMessage);

        reject({
          httpCode: 401,
          message: errorMessage,
          success: false
        });

        return;
      }

      if (!response.expires) {
        errorMessage = "Session not found";
        printError(errorMessage);

        reject({
          httpCode: 404,
          message: errorMessage,
          success: false
        });

        return;
      }

      if (!response.customer || response.customer !== email) {
        errorMessage = "Invalid credentials";
        printError(errorMessage);

        reject({
          httpCode: 401,
          message: errorMessage,
          success: false
        });

        return;
      }

      resolve({
        detail: {
          customer: await getCustomer({ email })
        },
        httpCode: 200,
        message: "Customer authenticated",
        success: true
      });
    });
  });
};
