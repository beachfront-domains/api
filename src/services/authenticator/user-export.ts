


//  N A T I V E

import { createWriteStream } from "fs";

//  I M P O R T S

import archiver from "archiver";
import { r } from "rethinkdb-ts";

//  U T I L S

import authenticate from "./auth";
import { databaseOptions, exportDirectory, log } from "~util/index";
import { getUser } from "./user-get";

type AuthResponse = {
  success: boolean;
  user: {
    id: string;
  };
};



//  E X P O R T

export default async(suppliedData: { sessionId: string; userId: string }) => {
  const databaseConnection = await r.connect(databaseOptions);
  const errorMessage = "Unauthorized";
  const { sessionId, userId } = suppliedData;

  switch(true) {
    case !suppliedData:
    case !sessionId:
    case !userId:
    case typeof sessionId !== "string":
    case typeof userId !== "string":
      databaseConnection.close();
      log.error(errorMessage);

      return {
        httpCode: 401,
        message: errorMessage,
        success: false
      };

    default:
      break;
  }

  const originalUserData = await getUser({ id: userId });
  const authenticationResponse: AuthResponse = await authenticate({ email: originalUserData.email, id: sessionId });
  const { success, user } = authenticationResponse;

  switch(true) {
    case !success:
    case user.id !== userId:
      databaseConnection.close();
      log.error(errorMessage);

      return {
        httpCode: 401,
        id: "",
        message: errorMessage,
        success: false
      };

    default:
      break;
  }

  const output = createWriteStream(exportDirectory + `/beachfront-${originalUserData.login}-export.zip`);
  const archive = archiver("zip", { zlib: { level: 9 }});

  output.on("close", function() {
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
    archive.directory(`beachfront-${originalUserData.login}-export`);
    archive.append(JSON.stringify(originalUserData), { name: `${originalUserData.login}.json` });
    archive.finalize();

    return {
      httpCode: 200,
      // file: createReadStream(exportDirectory + `/beachfront-${originalUserData.login}-export.zip`).pipe(),
      file: "This should be a download link",
      message: "User export successful",
      user: originalUserData,
      success: true
    };
  } catch(exportError) {
    log.error(exportError);
  }
};
