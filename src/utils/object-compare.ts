


//  E X P O R T

export const objectCompare = (objectA: object|string[], objectB: object|string[]) => {
  let diffObj = {};

  switch(true) {
    case (Array.isArray(objectA)):
      (objectA as any).forEach((elem: any, index: number) => {
        if (!Array.isArray(diffObj))
          diffObj = [];

        (diffObj as any)[index] = objectCompare(elem, ((objectB || []) as any)[index]);
      });

      break;

    case (objectA !== null && typeof objectA === "object"):
      Object.keys(objectA).forEach((key: any) => {
        if (Array.isArray((objectA as any)[key])) {
          let arr = objectCompare((objectA as any)[key], (objectB as any)[key]);

          if (!Array.isArray(arr))
            arr = [];

          (arr as any).forEach((elem: any, index: number) => {
            if (!Array.isArray((diffObj as any)[key]))
              (diffObj as any)[key] = [];

            (diffObj as any)[key][index] = elem;
          });
        } else if (typeof (objectA as any)[key] === "object")
          (diffObj as any)[key] = objectCompare((objectA as any)[key], (objectB as any)[key]);
        else if ((objectA as any)[key] !== ((objectB || {}) as any)[key])
          (diffObj as any)[key] = (objectA as any)[key];
        else if ((objectA as any)[key] === ((objectB || {}) as any)[key])
          delete (objectA as any)[key];
      });

      break;

    default:
      break;
  }

  Object.keys(diffObj).forEach((key: any) => {
    if (typeof (diffObj as any)[key] === "object" && JSON.stringify((diffObj as any)[key]) === "{}")
      delete (diffObj as any)[key];
  });

  return diffObj;

  // via https://stackoverflow.com/a/44831492
};
