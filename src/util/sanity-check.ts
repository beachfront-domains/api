


///  U T I L

import { FunctionResponseInterface } from "./interface";

interface SanityCheckInput {
  checkEnum: {
    array: string[];
    search: string;
  };
  checkExist: string[];
  checkLength: string[];
};



///  E X P O R T

export default (detailToCheck: Partial<SanityCheckInput>): FunctionResponseInterface => {
  const { checkEnum, checkExist, checkLength } = detailToCheck;

  if (checkEnum) {
    const { array, search } = checkEnum;

    if (array.indexOf(search) < 0) {
      return {
        httpCode: 401,
        message: "Invalid enum passed",
        success: false
      };
    }
  }

  if (checkExist) {
    checkExist.forEach(item => {
      if (!item || item === null || item === undefined) {
        return {
          httpCode: 401,
          message: "Missing values",
          success: false
        };
      }
    });
  }

  if (checkLength) {
    checkLength.forEach(item => {
      if (item.length === 0) {
        return {
          httpCode: 401,
          message: "Value length is unacceptable",
          success: false
        };
      }
    });
  }

  return {
    httpCode: 200,
    message: "Everything checks out!",
    success: true
  };
};
