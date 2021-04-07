


///  N A T I V E

import { createWriteStream } from "fs";

///  I M P O R T

import archiver from "archiver";
import { r } from "rethinkdb-ts";

///  U T I L

import authenticate from "~service/bouncer/auth";
import { databaseOptions, exportDirectory } from "~util/index";
import { _getCustomerRaw } from "../crud/read";



///  E X P O R T

export default async(suppliedData: any) => {
  const databaseConnection = await r.connect(databaseOptions);
  const errorMessage = "Unauthorized";
  const data = suppliedData;

  switch(true) {
    case !data:
    case !data.customerId:
    case !data.sessionId:
    case typeof data.customerId !== "string":
    case typeof data.sessionId !== "string":
      databaseConnection.close();
      console.error(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };

    default:
      break;
  }

  const { customerId, sessionId } = data;
  const originalCustomerData = await _getCustomerRaw(customerId);
  // @ts-ignore TS2339 TS2531
  const authenticationResponse = await authenticate({ email: originalCustomerData.email, id: sessionId });

  switch(true) {
    // @ts-ignore TS2531
    case !authenticationResponse.success:
    // @ts-ignore TS2531
    case authenticationResponse.detail.customer.id !== customerId:
      databaseConnection.close();
      console.error(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };

    default:
      break;
  }

  // @ts-ignore TS2339 TS2531
  const output = createWriteStream(exportDirectory + `/beachfront-${originalCustomerData.username}-export.zip`);
  const archive = archiver("zip", { zlib: { level: 9 }});

  output.on("close", () => {
    // console.log(Object.keys(archive));
    // console.log(archive.pointer() + " total bytes");
    // console.log("archiver has been finalized and the output file descriptor has closed.");
  });

  output.on("end", () => {
    // console.log("Data has been drained");
  });

  archive.on("warning", (err: any) => {
    if (err.code === "ENOENT") {
      // log warning
    } else {
      return {
        httpCode: 500,
        message: err,
        success: false
      };
    }
  });

  archive.on("error", (err: any) => {
    return {
      httpCode: 500,
      message: err,
      success: false
    };
  });

  archive.pipe(output);

  try {
    // @ts-ignore TS2339 TS2531
    archive.directory(`beachfront-${originalCustomerData.username}-export`);
    // @ts-ignore TS2339 TS2531
    archive.append(JSON.stringify(originalCustomerData), { name: `${originalCustomerData.username}.json` });
    archive.finalize();

    return {
      httpCode: 200,
      // file: createReadStream(exportDirectory + `/beachfront-${originalCustomerData.username}-export.zip`).pipe(),
      file: "This should be a download link",
      message: "Customer export successful",
      customer: originalCustomerData,
      success: true
    };
  } catch(exportError) {
    console.error(exportError);
  }
};
