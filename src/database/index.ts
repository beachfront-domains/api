"use strict";



//  I M P O R T

import { r } from "rethinkdb-ts";

//  U T I L

import { databaseOptions } from "~util/index";



//  E X P O R T

export default async() => {
  const connection = await r.connect(databaseOptions);
  return connection; // eslint-disable-line padding-line-between-statements
};
