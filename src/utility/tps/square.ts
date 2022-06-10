


///  I M P O R T

import { ApiError, Client } from "square";
import { until } from "@open-draft/until";
import uuid from "uuid-random";

///  U T I L

import { squareEnvironment, squareToken } from "../constant";
import type { Customer } from "~schema/index";
import type { LooseObject } from "../interface";



///  E X P O R T

export async function createCard() {}
export async function getCard() {}
export async function updateCard() {}
export async function deleteCard() {}

export async function createCustomer(customerData: Partial<Customer>): Promise<string> {
  /// `Partial` accounts for database migrations that have not completed

  const client = new Client({
    accessToken: squareToken,
    environment: squareEnvironment
  });

  const { customersApi } = client;
  const idempotencyKey = uuid();

  const requestBody = {
    emailAddress: customerData.email,
    idempotencyKey, /// unique ID for request
    referenceId: customerData.id
  }

  const { data, error } = await until(() => customersApi.createCustomer(requestBody));

  if (error) {
    if (error instanceof ApiError)
      console.log(error.errors);
    else
      console.log("Unexpected Error: ", error);

    return "";
  }

  const { result: { customer }} = data;
  return (customer as LooseObject).id;
}

export async function getCustomer() {}
export async function updateCustomer() {}
export async function deleteCustomer() {}
