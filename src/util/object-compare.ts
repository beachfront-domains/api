


///  U T I L

import { LooseObjectInterface } from "./interface";

type inputOptions = LooseObjectInterface | any[];



///  E X P O R T

export const objectCompare = (objectA: inputOptions, objectB: inputOptions): LooseObjectInterface => {
  let diffObj: LooseObjectInterface = {};

  switch(true) {
    case (Array.isArray(objectA)):
      objectA.forEach((elem: any, index: number) => {
        if (!Array.isArray(diffObj))
          diffObj = [];

        diffObj[index] = objectCompare(elem, (objectB || [])[index]);
      });

      break;

    case (objectA !== null && typeof objectA === "object"):
      Object.keys(objectA).forEach((key: any) => {
        if (Array.isArray(objectA[key])) {
          let arr = objectCompare(objectA[key], objectB[key]);

          if (!Array.isArray(arr))
            arr = [];

          arr.forEach((elem: any, index: number) => {
            if (!Array.isArray(diffObj[key]))
              diffObj[key] = [];

            diffObj[key][index] = elem;
          });
        } else if (typeof objectA[key] === "object")
          diffObj[key] = objectCompare(objectA[key], objectB[key]);
        else if (objectA[key] !== (objectB || {})[key])
          diffObj[key] = objectA[key];
        else if (objectA[key] === (objectB || {})[key])
          delete objectA[key];
      });

      break;

    default:
      break;
  }

  Object.keys(diffObj).forEach((key: any) => {
    if (typeof diffObj[key] === "object" && JSON.stringify(diffObj[key]) === "{}")
      delete diffObj[key];
  });

  return diffObj;
};



// via https://stackoverflow.com/a/44831492
