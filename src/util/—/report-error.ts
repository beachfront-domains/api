


//  U T I L

// import { log } from "~util/index";

//  T Y P E

type SuppliedType = {
  additionalInfo: any,
  errorMessage: string,
  errorName: string,
  httpCode: number|string,
  httpMethod: string,
  serverResponse: any,
  serverResponseMessage: any,
  urlWhereErrorOccurred: string
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

  if (additionalInfo) // https://stackoverflow.com/a/32372430
    formattedError = { ...formattedError, ...additionalInfo };

  // log.error(formattedError);
  console.log(formattedError);

  return {
    httpCode: httpCode || 500,
    message: serverResponseMessage || "An error occurred"
  };
};
