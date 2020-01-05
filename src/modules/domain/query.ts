


//  I M P O R T S

import { r } from "rethinkdb-ts";

//  U T I L S

import {
  databaseOptions,
  isDevelopment,
  log,
  pathContents
} from "~util/index";

import { getUser } from "~module/user/query";
import { DomainDefaults } from "./schema";

//  T Y P E S

import { DomainType, DomainInputType } from "./types";



//  E X P O R T S

export const getDomains = async(suppliedData: { owner: string }) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { owner } = suppliedData;
  const query = {};

  Object.entries(suppliedData).forEach(([key, value]) => (query[key] = value));

  try {
    const response = await r.table("domains")
      .orderBy(r.desc("created"))
      .filter({ owner })
      .run(databaseConnection);

    databaseConnection.close();
    return response;
  } catch(domainRetrievalError) {
    log.error(domainRetrievalError);
    databaseConnection.close();

    return [{
      httpCode: 500,
      message: "Error retrieving domains. Try again later.",
      success: false
    }];
  }

  /*
    query getDomains($ownerID: ID!) {
      domains(owner: $ownerID) {
        owner
        id
        name
      }
    }

    // variables

    {
      "ownerID": "5ae8a565b13869077c37f61e"
    }
  */
};

export const createDomain = async(suppliedData: DomainInputType) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { details, owner } = suppliedData;
  const domainOwner = await getUser({ id: owner });

  if (!domainOwner.id) {
    return {
      message: "User does not exist",
      success: false
    };
  }

  // TODO: Run WHOIS search on domain to get registrar, if possible

  const userDomains = await getDomains({ owner: owner });
  const userDomainNames = [];

  userDomains.map(domain => userDomainNames.push(domain.name));

  if (userDomainNames.includes(details.name)) {
    return {
      message: `"${details.name}" is already in your portfolio.`,
      success: false
    };
  }

  // delete details.id; // TODO: Create input sanitzation function

  (details as any).created = r.now();
  (details as any).owner = owner;
  (details as any).updated = r.now();

  try {
    const response = await r.table("domains").insert(
      { ...DomainDefaults, ...details }, {
        returnChanges: true
      })
      .run(databaseConnection);

    databaseConnection.close();

    return {
      domain: response.changes[0].new_val,
      httpCode: 201,
      message: "Created domain.",
      success: true
    };
  } catch(domainCreationError) {
    log.error(domainCreationError);
    databaseConnection.close();

    return {
      httpCode: 500,
      message: `Unable to create domain:\n${domainCreationError}`,
      success: false
    };
  }

  /*
  mutation CreateDomain($details: DomainInput!, $owner: ID!) {
    createDomain(details: $details, owner: $owner) {
      message
      success
      domain {
        booleans {
          archived
          downloads
          mirror
          private
        }
        branchDefault
        counts {
          loc
          size
        }
        description
        homepage
        id
        license
        name
        nameFull
        owner {
          id
          login
        }
        url
        urls {
          branches
          compare
          contributors
          clone
          commits
          contents
          events
          git
          landing
          languages
          refs
          releases
          ssh
          svn
        }
        created
        pushed
        updated
      }
    }
  }

  // variables

  {
    "details": {
      "branchDefault": "cool-beans",
      "description": "my repo",
      "name": "test"
    },
    "owner": "b3b1bdc8-9f0a-4f71-8de1-bc272a8f62e4"
  }
  */
};

export const deleteDomain = async(suppliedData: { owner: string; id: string }) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { owner, id } = suppliedData;

  try {
    const deleteDomain = await r.table("domains")
      .filter({ owner, id })
      .delete({ returnChanges: true })
      .run(databaseConnection);

    databaseConnection.close();

    if (deleteDomain.errors > 0) {
      log.error("Domain deletion failed.");

      return {
        httpCode: 500,
        message: "Domain deletion failed.",
        success: false
      };
    }

    return {
      httpCode: 200,
      message: "Domain deletion successful.",
      success: true
    };
  } catch(repoDeletionError) {
    log.error(repoDeletionError);
    databaseConnection.close();

    return {
      httpCode: 500,
      message: "Error deleting domain. Try again later.",
      success: false
    };
  }

  /*
  mutation DeleteDomain(owner: ID!, $id: ID!) {
    deleteDomain(owner: $author, id: $id) {
      message
      success
    }
  }

  // variables

  {
    "owner": "5ae8a565b13869077c37f61e",
    "id": "80e2bb36-4e58-4f36-9c7e-dae43c9eae20"
  }
  */
};

export const getDomain = async(suppliedData: { id: string }) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { id } = suppliedData;
  const query = {};

  Object.entries(suppliedData).forEach(([key, value]) => (query[key] = value));

  try {
    const response = await r.table("domains").get(id)
      .run(databaseConnection);

    databaseConnection.close();
    return response;
  } catch(domainRetrievalError) {
    log.error(domainRetrievalError);
    databaseConnection.close();

    return {
      httpCode: 500,
      id: null,
      message: "Error retrieving domain. Try again later.",
      success: false
    };
  }

  /*
  query getDomain(domainID: ID!) {
    domain(id: domainID) {
      owner
      id
      name
    }
  }

  // variables

  {
    "domainID": "5ae8a593b13869077c37f620"
  }
  */
};

export const updateDomain = async(suppliedData: { details: [DomainType]; id: string }) => {
  const databaseConnection = await r.connect(databaseOptions);
  const { details, id } = suppliedData;
  const query = {};

  (query as any).updated = r.now();

  Object.entries(details).forEach(([key, value]) => {
    // if (key === "hosts" && Array.isArray(value)) {
    //   (query as any).hosts = [];
    //   // @ts-ignore
    //   value.map(v => query.hosts.push(String(v)));
    // } else {
    //   // @ts-ignore
    //   query[key] = value;
    // }

    query[key] = value;
  });

  try {
    const domainUpdate = await r.table("domains").get(id)
      .update(query, { returnChanges: true })
      .run(databaseConnection);

    const updatedDomain = domainUpdate.changes[0].new_val;

    databaseConnection.close();

    return {
      httpCode: 200,
      message: "Domain update successful.",
      source: updatedDomain,
      success: true
    };
  } catch(domainUpdateError) {
    log.error(domainUpdateError);
    databaseConnection.close();

    return {
      httpCode: 500,
      message: "Error updating domain. Try again later.",
      success: false
    };
  }

  /*
  mutation UpdateDomain($id: ID!, details: DomainInput!) {
    updateDomain(id: $id, details: details) {
      message
      success
      domain {
        created
        id
        name
        updated
      }
    }
  }

  // variables

  {
    "id": "5aebedcc493f99073a2adf88",
    "details": {
    }
  }
  */
};
