


/// import

import { r } from "rethinkdb-ts";
import { toASCII } from "tr46";

/// util

import { databaseName, emptyResponse } from "../utility/constant.ts";
import { databaseOptions } from "src/utility/index.ts";
import { get } from "./read.ts";

import type {
  Customer,
  PaymentMethod,
  PaymentMethodCreate
} from "src/schema/index.ts";

import type { LooseObject } from "src/utility/index.ts";



/// export

export default async(data: PaymentMethodCreate, context: Customer): Promise<{ detail: PaymentMethod }> => {
  if (!data.options.customer && (!context || !context.id))
    return emptyResponse;

  const databaseConnection = await r.connect(databaseOptions);
  const { options } = data;
  const query: LooseObject = {};

  console.log(">>> data");
  console.log(data);
  console.log(context);

  query.customer = context.id;

  Object.entries(options).forEach(([key, value]) => {
    switch(key) {
      case "kind":
      case "mask":
      case "vendor":
        query[key] = String(value);
        break;

      // TODO
      // : ensure `kind` value matches `PaymentMethodKind` enum options
      // : ensure `vendor` value matches `PaymentMethodVendor` enum options

      default:
        /// Ignore extra params
        break;
    }
  });

  // if (!options.ascii)
  //   query.ascii = toASCII(options.name, { processingOption: "transitional" });

  // const doesExtensionExist = await getExtension({ options: { id: query.extension }});

  // if (doesExtensionExist.detail.id.length === 0) {
  //   databaseConnection.close();

  //   console.group("Error creating domain, extension does not exist.");
  //   console.error(query);
  //   console.groupEnd();

  //   return { detail: { id: "" }};
  // }

  const doesDocumentExist = await get({ options: { ...query }}, context);

  if (doesDocumentExist.detail.id.length !== 0) {
    databaseConnection.close();
    return doesDocumentExist; /// document exists, return it
  }

  // TODO
  // : create payment method within third-party service and return ID
  // : query.vendorId

  try {
    const createDocument = await r
      .table(databaseName)
      .insert({
        ...query,
        created: new Date(),
        updated: new Date()
      })
      .run(databaseConnection);

    if (createDocument.inserted !== 1) {
      databaseConnection.close();

      console.group("Error creating payment method");
      console.error(query);
      console.groupEnd();

      return emptyResponse;
    }

    const createdDocument = await r.table(databaseName)
      .filter({ id: createDocument!.generated_keys![0] })
      .run(databaseConnection);

    const response: PaymentMethod = createdDocument[0];

    databaseConnection.close();

    return { detail: response };
  } catch(error) {
    databaseConnection.close();

    console.group("Exception caught while creating payment method");
    console.error(error);
    console.groupEnd();

    return emptyResponse;
  }
}
