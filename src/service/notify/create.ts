


///  U T I L

import { authenticate } from "~service/bouncer/index";
// import createAuditNotification from "~module/audit/create";
// import createServiceNotification from "~module/service/create";
// import { log } from "~util/index";



///  E X P O R T

export default async(serverRequest: any, serverResponse: any) => {
  await authenticate(serverResponse);

  const data = serverRequest.params;
  const errorMessage = "Unauthorized";

  switch(data.type) {
    case "audit": // account actions
      // createAuditNotification(serverResponse, data);
      console.log(data);
      break;

    case "service": // app actions
      // createServiceNotification(serverResponse, data);
      console.log(data);
      break;

    default:
      console.error(errorMessage);
      return serverResponse.send(401, { message: errorMessage });
  }
};



// TODO:
// - account for notification being sent to a customer ID that does not exist
// - what if someone changes their email address while getting notifications?
