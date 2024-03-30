


/// export

export {
  databaseParams,
  isDevelopment,
  maxPaginationLimit
} from "./constant.ts";

export {
  nameserverKey,
  serviceCoinmarketcap,
  serviceDictionary,
  serviceNinja,
  serviceThesaurus
} from "./env.ts";

export { accessControl, createSessionToken } from "./auth/access.ts";
export { andOperation, client, orOperation } from "./edgedb.ts";
export { checklist } from "./checklist.ts";
export { decode, sign, verify } from "./auth/sign.ts";
export { emailRegex, default as validateEmail } from "./validate/email.ts";
export { default as hnsPrice } from "./hns-price.ts";
export { objectIsEmpty } from "./is-object-empty.ts";
export { default as personFromSession } from "./person-from-session.ts";
export { processRecordData } from "./helper.ts";
export { default as randomSelection } from "./random-selection.ts";
export { resend } from "./resend.ts";
export { default as sortObject } from "./sort-object.ts";
export { default as stringTrim } from "./string-trim.ts";
export { uuidRegex, default as validateUUID } from "./validate/uuid.ts";
export { validateDate } from "./validate/date.ts";
export { validateDomain } from "./validate/domain.ts";
export { zeroWidthRegex, default as validateZeroWidth } from "./validate/zero-width.ts";

export const neuenic = "http://45.33.107.202:8081/api/v1/servers/localhost/zones";

export type {
  DetailObject,
  LooseObject,
  StandardBooleanResponse,
  StandardResponse,
  StandardPlentyResponse
} from "./interface.ts";
