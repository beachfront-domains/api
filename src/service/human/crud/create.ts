


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import {
  databaseOptions,
  FunctionResponseInterface,
  printError
} from "~util/index";

import { CustomerDefaults } from "~module/customer/default";
import { validateEmail } from "~service/bouncer/index";
import type { Customer } from "~module/customer/type";

const customerDatabase = "customers";

interface FunctionResponse extends FunctionResponseInterface {
  customer?: Customer | {};
}



///  E X P O R T

export default async(suppliedEmail: string): Promise<FunctionResponse> => {
  const { email } = validateEmail(suppliedEmail).detail;
  const databaseConnection = await r.connect(databaseOptions);

  const beachfrontPaulQuery = await r.table(customerDatabase)
    .filter({ role: "admin" })
    .run(databaseConnection);

  const customerQuery = await r.table(customerDatabase)
    .filter({ email })
    .run(databaseConnection);

  let beachfrontPaul = "";

  // TODO
  // : find better way to check admin existence

  if (beachfrontPaulQuery.length)
    beachfrontPaul = beachfrontPaulQuery[0].id;

  try {
    const newCustomer = await r.table(customerDatabase)
      .insert({
        ...CustomerDefaults,
        ...{
          created: new Date(),
          email,
          username: createCustomername(email),
          squad: [beachfrontPaul],
          updated: new Date()
        }
      })
      .run(databaseConnection);

    // TODO
    // : get response type

    if (newCustomer.inserted !== 1) {
      databaseConnection.close();

      const errorMessage = "Customer creation unsuccessful";
      printError(errorMessage);

      return {
        httpCode: 500,
        message: errorMessage,
        success: false
      };
    }

    let customerQuery = await r.table(customerDatabase)
      // @ts-ignore TS2532: Object is possibly "undefined".
      .filter({ id: newCustomer.generated_keys[0] })
      .run(databaseConnection);

    customerQuery = customerQuery[0];

    return {
      httpCode: 201,
      message: "Customer created",
      success: true,
      // @ts-ignore TS2740: Type "any[]" is missing the following properties from type "Customer": <...>.
      customer: customerQuery
    };
  } catch(customerCreationError) {
    databaseConnection.close();

    const errorMessage = "Error creating customer";
    printError(errorMessage);

    return {
      httpCode: 500, // Internal Server Error
      message: errorMessage,
      success: false
    };
  }
};



///  H E L P E R

function createCustomername(suppliedEmail: string): string {
  return String(suppliedEmail)
    .split("@")[0]
    .replace(/\+/g, "") + String(Math.random())
    .split(".")[1]
    .slice(0, 5);
}
