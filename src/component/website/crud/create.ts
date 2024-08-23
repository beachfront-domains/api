


/// import

import { log } from "dep/std.ts";
import { toASCII } from "dep/x/tr46.ts";

/// util

import {
  accessControl,
  client,
  personFromSession,
  prettyFilePath,
  stringTrim
} from "src/utility/index.ts";

import { Website } from "../schema.ts";
import dotCheck from "../utility/check-dot.ts";
import e from "dbschema";
import createWebsite from "../utility/create-website.ts";

import type { DetailObject, StandardResponse } from "src/utility/index.ts";
import type { WebsiteCreate } from "../schema.ts";

const thisFilePath = prettyFilePath(import.meta.filename);



/// export

export default async(_root, args: WebsiteCreate, ctx, _info?): StandardResponse => {
  if (!await accessControl(ctx)) {
    const message = "Authentication failed.";
    log.warn(`[${thisFilePath}]› ${message}`);

    return {
      detail: null,
      error: {
        code: "TBA",
        message
      }
    };
  }

  const { params } = args;
  const query = ({} as Website);
  let response: DetailObject | null = null;

  Object.entries(params).forEach(([key, value]) => {
    switch(key) {
      // TODO
      // : clean content
      case "content":
      case "owner": {
        query[key] = stringTrim(String(value));
        break;
      }

      case "domain": {
        query[key] = toASCII(String(value));
        break;
      }

      default:
        break;
    }
  });

  /// vibe check
  if (!query.content || !query.domain || !query.owner) {
    const message = "Missing required parameter(s).";
    log.warn(`[${thisFilePath}]› ${message}`);

    return {
      detail: response,
      error: {
        code: "TBA",
        message
      }
    };
  }

  if (!dotCheck(query.domain)) {
    const message = "Invalid domain.";
    log.warn(`[${thisFilePath}]› ${message}`);

    return {
      detail: response,
      error: {
        code: "TBA",
        message
      }
    };
  }

  const doesDomainExist = e.select(e.Domain, domain => ({
    ...e.Domain["*"],
    filter_single: e.op(domain.name, "=", query.domain)
  }));

  const domainExistenceResult = await doesDomainExist.run(client);

  if (!domainExistenceResult) {
    const message = "Domain does not exist.";
    log.warn(`[${thisFilePath}]› ${message}`);

    return {
      detail: response,
      error: {
        code: "TBA",
        message
      }
    };
  }

  const doesWebsiteExist = e.select(e.Website, website => ({
    ...e.Website["*"],
    domain: website.domain["*"],
    filter_single: e.op(website.domain.name, "=", query.domain),
    owner: website.owner["*"]
  }));

  const websiteExistenceResult = await doesWebsiteExist.run(client);

  if (websiteExistenceResult) {
    log.warn(`[${thisFilePath}]› Existing document returned.`);
    return { detail: websiteExistenceResult }; /// document exists, return it
  }

  // TODO
  // : add `theme` param to website schema

  /// NOTE
  /// : website content is always stored in Markdown

  try {
    const owner = await personFromSession(ctx);

    if (!owner) {
      const message = "THIS ERROR SHOULD NEVER BE REACHED.";
      log.warn(`[${thisFilePath}]› ${message}`);

      return {
        detail: response,
        error: {
          code: "TBA",
          message
        }
      };
    }

    if (owner.id !== query.owner) {
      const message = "Invalid permissions.";
      log.warn(`[${thisFilePath}]› ${message}`);

      return {
        detail: response,
        error: {
          code: "TBA",
          message
        }
      };
    }

    await createWebsite({
      content: query.content,
      customer: query.owner,
      domain: query.domain
    });

    const newDocument = e.insert(e.Website, {
      ...query,
      domain: e.select(e.Domain, domain => ({
        filter_single: e.op(domain.id, "=", e.uuid(domainExistenceResult.id))
      })),
      owner: e.select(e.Customer, customer => ({
        filter_single: e.op(customer.id, "=", e.uuid(owner.id))
      }))
    });

    const databaseQuery = e.select(newDocument, website => ({
      ...e.Website["*"],
      domain: website.domain["*"],
      owner: website.owner["*"]
    }));

    response = await databaseQuery.run(client);

    return { detail: response };
  } catch(error) {
    // TODO
    // : create error ingest system : https://github.com/neuenet/pastry-api/issues/10
    log.error(`${thisFilePath} › Exception caught while creating document.`);
    return { detail: error };
  }
}
