


///  I M P O R T

import { default as _env } from "vne";
import got from "got";
import gotql from "gotql";
import { r } from "rethinkdb-ts";

///  U T I L

const { database, dev, port, prod, site } = _env.default();
const databaseName = "extension";

const databaseOptions = {
  /// duplicated from /src/utility/constant.ts
  /// module scripts cannot read TypeScript files
  buffer: 2,
  db: site.name.toLowerCase(),
  discovery: false,
  host: "localhost",
  max: 5,
  password: database.password,
  port: port.database,
  silent: true,
  user: "admin"
};



///  P R O G R A M

processExtensions();



///  H E L P E R

async function processExtensions() {
  const databaseConnection = await r.connect(databaseOptions);
  const extensionsQuery = await r.table(databaseName).run(databaseConnection);
  let extensionsCount = 0;
  let index = 0;

  try {
    const queryResult = extensionsQuery[0];

    if (queryResult) {
      databaseConnection.close();
      console.error(`\n❌ Extensions exist`.toUpperCase());
      process.exit();
    }

    const query = {
      name: "GetContracts",
      operation: {
        args: {
          options: {
            registrar: "$registrar"
          },
          pagination: {
            first: "$first"
          }
        },
        fields: [{
          detail: {
            fields: ["active", "expiry", {
              extension: {
                fields: ["ascii", "collection", "name", "premium", "price", "pricePremium"]
              }
            }]
          }
        }],
        name: "contracts"
      },
      variables: {
        first: {
          type: "Int!",
          value: 300
        },
        registrar: {
          type: "ID!",
          value: "872134d8-5440-448d-bf64-73a267552962"
        }
      }
    };

    const options = {
      // headers: {
      //   "Authorization": "Bearer <token>"
      // },
      // debug: false,
      // useHttp2: false
    };

    const extensions = await gotql.query("http://localhost:5454", query, options)
      .then(response => response?.data?.contracts?.detail)
      .catch(error => error);

    extensionsCount = extensions.length;

    extensions.map(async(extension) => {
      if (!extension.active)
        return false;

      const { extension: ext } = extension;

      await r
        .table(databaseName)
        .insert({
          ascii: ext.ascii,
          // collection: ext.collection,
          created: new Date(),
          name: ext.name,
          // premium: ext.premium,
          // price: ext.price,
          // pricePremium: ext.pricePremium,
          registry: "Neuenet",
          updated: new Date()
        })
        .run(databaseConnection);

      index++;
      console.log(`Imported extension ${index}/${extensionsCount}`);

      if (index === extensionsCount) {
        databaseConnection.close();
        console.log(`✅ Extensions created`.toUpperCase());
        process.exit();
      }
    });
  } catch(error) {
    databaseConnection.close();
    console.error(new Error(error));
    process.exit();
  }

  /*
  query GetContracts($variables: ContractsQuery, $page: PaginationOptions) {
    contracts(options: $variables, pagination: $page) {
      detail {
        active
        expiry
        extension {
          name
          premium
          price
          pricePremium
        }
        registrar {
          name
          urls
        }
      }
      pageInfo {
        cursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
  */
}
