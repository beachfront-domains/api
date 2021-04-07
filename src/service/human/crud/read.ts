


///  I M P O R T

import { r } from "rethinkdb-ts";

///  U T I L

import { databaseOptions, LooseObjectInterface } from "~util/index";
import type { Customer } from "~module/customer/type";

const customerDatabase = "customers";

interface CustomerRequestInterface {
  email: string;
  id: string;
  username: string;
};



///  E X P O R T

export async function getCustomer(suppliedData: Partial<CustomerRequestInterface>): Promise<Customer | { id: null | void }> {
  const databaseConnection = await r.connect(databaseOptions);
  const query: LooseObjectInterface = {};

  Object.entries(suppliedData).forEach(([key, value]) => {
    query[key] = String(value);
  });

  // @ts-ignore TS2740: Type "any[]" is missing the following properties from type "Customer": <...>.
  let response: LooseObjectInterface = await r.table(customerDatabase)
    .filter((customer: any) => {
      if (query.username)
        return customer("username").match(`(?i)^${query.username}$`);

      return query;
    })
    .run(databaseConnection);

  try {
    response = response[0];
    databaseConnection.close();

    if (!response)
      return { id: null };

    const frenemies: Customer[] = [];
    const friends: Customer[] = [];

    Object.entries(response).forEach(([key, value]) => {
      switch(key) {
        case "blocked":
          if (value && value.length) {
            // @ts-ignore TS2345: Argument of type "Promise<Customer | null>" is not assignable to parameter of type "Customer".
            value.forEach((customerId: string) => frenemies.push(_getCustomerRaw(customerId)));
          }

          break;

        case "squad":
          if (value && value.length) {
            // @ts-ignore TS2345: Argument of type "Promise<Customer | null>" is not assignable to parameter of type "Customer".
            value.forEach((customerId: string) => friends.push(_getCustomerRaw(customerId)));
          }

          break;

        default:
          response[key] = value;
          break;
      }
    });

    const [richFrenemiesResponse] = await Promise.all([frenemies]);
    const [richFriendsResponse] = await Promise.all([friends]);

    response.blocked = richFrenemiesResponse;
    response.squad = richFriendsResponse;

    // @ts-ignore TS2740: Type "LooseObjectInterface" is missing the following properties from type "Customer": <...>.
    return response;
  } catch(error) {
    databaseConnection.close();

    console.info("Error retrieving customer");
    console.error(error);

    return { id: null };
  }
}

export async function getCustomers(suppliedData: any) {
  // TODO
  // : suppliedData should be an array...
  // : array of IDs, usernames, email addresses, &c
  // : may be usual for squad/dunbar streams, to show member lists

  // const databaseConnection = await r.connect(databaseOptions);
  // const response: Customer[] = await r.table(customerDatabase)
  //   .filter(suppliedData)
  //   .run(databaseConnection);

  // try {
  //   const friends: Customer[] = [];

  //   for (const friend of response) {
  //     Object.entries(friend).forEach(([key, value]) => {
  //       switch(key) {
  //         case "squad":
  //           value.forEach((customerId: string) => friends.push(getCustomer({ id: customerId })));
  //           break;

  //         default:
  //           (response as any)[key] = value;
  //           break;
  //       }
  //     });
  //   }

  //   databaseConnection.close();

  //   if (!friends.length)
  //     return response;

  //   return Promise.all(friends).then(promiseResponse => {
  //     response.squad = promiseResponse;
  //     return response;
  //   });
  // } catch(error) {
  //   databaseConnection.close();

  //   console.info("Error retrieving customers");
  //   console.error(error);

  //   return {};
  // }
}

export async function _getCustomerRaw(customerId: string): Promise<Customer | {}> {
  /// What it says on the tin...
  /// Had to duplicate `_getCustomer` b/c the recursive nature of getting
  /// squadmate info was causing RethinkDB to crash so this is the
  /// same function, with the squad finder removed

  const databaseConnection = await r.connect(databaseOptions);

  let response = await r.table(customerDatabase)
    .filter({ id: String(customerId) })
    .run(databaseConnection);

  try {
    response = response[0];
    databaseConnection.close();

    if (!response)
      return {};

    // @ts-ignore TS2740: Type "any[]" is missing the following properties from type "Customer": <...>.
    return response;
  } catch(error) {
    databaseConnection.close();

    console.info("Error retrieving just the customer");
    console.error(error);

    return {};
  }
}
