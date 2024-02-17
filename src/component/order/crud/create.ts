


/// import

import { load, log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  accessControl,
  client,
  stringTrim,
  validateUUID
} from "src/utility/index.ts";

import { DomainStatusCode } from "../../domain/schema.ts";
import e from "dbschema";
import { default as isValidBinaryValue } from "../utility/binary.ts";
import { processBagItems } from "../../bag/utility/process.ts";
import { default as processVendor } from "../utility/process.ts";
import { totalPrice } from "src/utility/calculate/price.ts";

import type { BagItem } from "../../bag/schema.ts";
import type { DetailObject, StandardResponse } from "src/utility/index.ts";
import type { Order, OrderCreate } from "../schema.ts";

const thisFilePath = import.meta.filename;



/// export

export default async(_root, args: OrderCreate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx))
    return { detail: null, error: { code: "TBA", message: "Protected route" }};

  const { params } = args;
  const query = ({} as Order);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      case "bag":
      case "customer": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "currency": {
        query[key] = stringTrim(String(value).toUpperCase());
        break;
      }

      case "paid": {
        query[key] = Number(value);
        break;
      }

      case "promo": {
        // TODO
        // : check if promo exists
        query[key] = stringTrim(String(value));
        break;
      }

      // case "total": {
      //   // TODO
      //   // : `total` as string? because decimal?
      //   // : might remove this...this should be calculated on the server
      //   query[key] = String(value);
      //   break;
      // }

      case "vendor": {
        query[key] = processVendor((value as Order["vendor"]));
        break;
      }

      default:
        break;
    }
  });

  vibeCheck(query);

  /// existence checks
  const doesCustomerExist = e.select(e.Customer, document => ({
    ...e.Customer["*"],
    filter_single: e.op(document.id, "=", e.uuid(query.customer))
  }));

  const customerExistenceResult = await doesCustomerExist.run(client);

  if (!customerExistenceResult) {
    const error = "Customer does not exist.";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: { code: "TBA", message: error }};
  }

  const doesBagExist = e.select(e.Bag, document => ({
    ...e.Bag["*"],
    filter_single: e.op(document.id, "=", e.uuid(String(query.bag)))
  }));

  const bagExistenceResult = await doesBagExist.run(client);

  if (!bagExistenceResult) {
    const error = "Bag does not exist.";
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: response, error: { code: "TBA", message: error }};
  }

  // if (bagExistenceResult.bag.length < 1) {
  //   const error = "How did this happen? Checking out with an empty bag?!";
  //   log.warning(`[${thisFilePath}]› ${error}`);
  //   return { detail: response, error: { code: "TBA", message: error }};
  // }

  /// TODO
  /// : emptyBagCheck necessary?
  /// : doesPromoExist

  // if (query.vendor.name === "OPENNODE") {
  //   // customer: email, username, name
  //   // make sure customer has verified set to `1`

  //   /*
  //   createCharge({
  //     amount / email / name / description / id

  //     amount > not sure if string works for decimal values
  //     currency: "USD"
  //     customer_email: customer.email
  //     customer_name: customer.name || customer.username
  //     description > all domains in a comma-separated list
  //     order_id > only way to get this is to create the order in database,
  //       retrieve `order` value, complete charge with opennode, then update
  //       database order with `paid: 1`

  //     callback_url > URL to receive webhooks for payment status updates
  //     success_url > URL to redirect user after successful payment
  //   })
  //   */

  //   // TODO
  //   // : createOrder, send info back to app (with `data.uri` for QR code), completeOrder, success?
  //   //   : If you want to build your own checkout experience you can create BIP21 + BOLT11 QR code using the uri field.
  //   // : webhooks in app
  // }

  query.currency = "USD";
  query.total = totalPrice(bagExistenceResult.bag);

  try {
    const newDocument = e.insert(e.Order, {
      ...query,
      bag: bagExistenceResult.bag,
      customer: e.select(e.Customer, document => ({
        filter_single: e.op(document.id, "=", e.uuid(customerExistenceResult.id))
      }))
    });

    const databaseQuery = e.select(newDocument, document => ({
      ...e.Order["*"],
      customer: document.customer["*"]
    }));

    response = await databaseQuery.run(client);

    /// create domains and delete bag
    await createDomains({ domains: bagExistenceResult.bag, owner: customerExistenceResult.id });
    await deleteBag(bagExistenceResult.id);

    return { detail: response };
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    log.error(_);
    return { detail: response };
  }
}



/// helper

async function createDomains(data: { domains: Array<BagItem>, owner: string }) {
  const client = createClient(databaseParams);
  const { domains, owner } = data;

  domains.map(async(domain) => {
    const { duration, name } = domain;
    const currentDate = new Date();
    const domainName = toASCII(String(name));
    const extension = domainName.split(".")[1];

    const expiry = (duration >= 2 && duration <= 10) ?
      new Date(currentDate.setFullYear(currentDate.getFullYear() + duration)).toISOString() :
      new Date(currentDate.setFullYear(currentDate.getFullYear() + 2)).toISOString();

    /// ensure extension exists
    const doesExtensionExist = e.select(e.Extension, document => ({
      filter_single: e.op(document.name, "=", extension)
    }));

    const extensionExistenceResult = await doesExtensionExist.run(client);

    if (!extensionExistenceResult) {
      log.warning(`[${thisFilePath}]› Extension does not exist.`);
      return null;
    }

    /// ensure customer exists
    const doesCustomerExist = e.select(e.Customer, document => ({
      filter_single: e.op(document.id, "=", e.uuid(owner))
    }));

    const customerExistenceResult = await doesCustomerExist.run(client);

    if (!customerExistenceResult) {
      log.warning(`[${thisFilePath}]› Customer does not exist.`);
      return null;
    }

    /// ensure domain is available
    const doesDomainExist = e.select(e.Domain, document => ({
      filter_single: e.op(document.name, "=", domainName)
    }));

    const domainExistenceResult = await doesDomainExist.run(client);

    if (domainExistenceResult) {
      log.warning(`[${thisFilePath}]› Domain exists.`);
      return null;
    }

    try {
      const newDocument = e.insert(e.Domain, {
        expiry,
        extension: doesExtensionExist,
        name: domainName,
        owner: doesCustomerExist,
        status: DomainStatusCode.PENDING_CREATE
      });

      // TODO
      // : after inital DNS setup for domains is complete,
      //   update `status` to `DomainStatusCode.OK`

      const databaseQuery = e.select(newDocument, document => ({
        ...e.Domain["*"],
        extension: document.extension["*"],
        owner: document.owner["*"]
      }));

      await databaseQuery.run(client);
  } catch(_) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`[${thisFilePath}]› Exception caught while creating document.`);
    log.error(_);
  }
  });
}

async function deleteBag(bagId: string) {
  const client = createClient(databaseParams);

  const deleteQuery = e.delete(e.Bag, document => ({
    filter_single: e.op(document.id, "=", e.uuid(bagId))
  }));

  await deleteQuery.run(client);
}

function vibeCheck(query: Order): void | DetailObject {
  const errors: Array<string> = [];

  if (!query.bag || !validateUUID(query.bag))
    errors.push("bag");

  if (!query.customer || !validateUUID(query.customer))
    errors.push("customer");

  if (!isValidBinaryValue(query.paid))
    errors.push("paid");

  if (!query.vendor)
    errors.push("vendor");

  if (errors.length > 0) {
    const error = `Missing or invalid required parameter(s): ${errors.join(", ")}.`;
    log.warning(`[${thisFilePath}]› ${error}`);
    return { detail: null, error: { code: "TBA", message: error }};
  }
}
