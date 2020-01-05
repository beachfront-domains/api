


//  U T I L

import { log } from "./logger";

//  T Y P E

type SuppliedType = {
  additionalInfo?: any;
  errorMessage?: string;
  errorName?: string;
  httpCode?: number;
  httpMethod?: string;
  serverResponse?: any;
  serverResponseMessage?: any;
  urlWhereErrorOccurred?: string;
};



//  E X P O R T

export default (suppliedData: SuppliedType) => {
  const {
    additionalInfo,
    errorName,
    errorMessage,
    httpCode,
    httpMethod,
    serverResponseMessage,
    urlWhereErrorOccurred
  } = suppliedData;

  let formattedError = {
    message: errorMessage || "An error occurred",
    name: errorName || "Error",
    params: {
      method: httpMethod || null,
      url: urlWhereErrorOccurred || null
    }
  };

  if (additionalInfo)
    formattedError = { ...formattedError, ...additionalInfo };

  log.error(formattedError); // databaseConnection.close();

  // if (!serverResponse)
  //   return JSON.stringify({ message: serverResponseMessage || "Unauthorized" });

  // return serverResponse.send(httpCode || 500, { message: serverResponseMessage || "An error occurred" });

  return {
    httpCode: httpCode || 500,
    message: serverResponseMessage || "An error occurred"
  };
};

