


/// import

import { order } from "dep/x/order-object.ts";



/// export

export function processRecordData(rrdata, getFullData?) {
  if (!rrdata)
    return null;

  if (!getFullData)
    getFullData = false;

  const { class: class_, name, ttl, type, ...extraData } = rrdata;
  const dbData = { created: rrdata.id, id: rrdata.id, updated: rrdata.updated };

  if (rrdata.data) {
    if (getFullData)
      return { class: class_, data: rrdata.data, name, ttl, type, ...dbData };
    else
      return { class: class_, data: rrdata.data, name, ttl, type };
  } else {
    if (getFullData)
      return { class: class_, data: removeKeysFromObject(extraData), name, ttl, type, ...dbData };
    else
      return { class: class_, data: removeKeysFromObject(extraData), name, ttl, type };
  }
}



/// helper

function removeKeysFromObject(suppliedObject) {
  /// these keys are helpful for internal usage, not so much for the world...
  const keysToRemove = ["created", "id", "updated"];
  const processedObject: { [key: string]: any } = {};

  for (const key in suppliedObject) {
    if (!keysToRemove.includes(key))
      processedObject[key] = suppliedObject[key];
  }

  return order(processedObject);
}
