"use strict";



//  E X P O R T S

export const TokenDefaults = {
  // This is foolish to have because the token will be created with old time data
  // ttl: new Date(+new Date() + 864e5), // 24 hours | e5 = 00000
  // created: new Date(),
  // updated: new Date()
};

export const TokenSchema = {
  bsonType: "object",
  additionalProperties: false,
  required: ["hash", "token", "ttl", "uid"],

  properties: {
    _id: {
      bsonType: "objectId"
    },
    hash: {
      bsonType: "string"
    },
    token: {
      bsonType: "string"
    },
    ttl: {
      bsonType: "date"
    },
    uid: {
      bsonType: "string"
    },

    created: {
      bsonType: "date"
    },
    updated: {
      bsonType: "date"
    }
  }
};



// https://docs.mongodb.com/manual/reference/database-references
// https://docs.mongodb.com/manual/reference/operator/query/type
