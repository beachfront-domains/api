"use strict";



//  E X P O R T S

export const PassDefaults = {
  created: new Date(),
  ttl: new Date(+new Date() + 12096e5 / 2), // 1 week | e5 = 00000
  updated: new Date()
};

export const PassSchema = {
  bsonType: "object",
  additionalProperties: false,
  required: ["created", "hash", "pass", "ttl", "uid", "updated"],

  properties: {
    created: { // timestamp
      bsonType: "date"
    },
    hash: {
      bsonType: "string"
    },
    pass: {
      bsonType: "string"
    },
    ttl: {
      bsonType: "date"
    },
    uid: {
      bsonType: "string"
    },
    updated: { // lastUpdated
      bsonType: "date"
    }
  }
};
