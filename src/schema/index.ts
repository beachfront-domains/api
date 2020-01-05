"use strict";



//  N A T I V E

import path from "path";
import process from "process";

//  I M P O R T

import { importSchema } from "graphql-import";

//  U T I L

const schema = importSchema(path.join(process.cwd(), "schema/schema.graphql"));



//  E X P O R T

export default () => schema;
