


///  I M P O R T

import accessLog from "@curveball/accesslog";
import { Application } from "@curveball/core";
import bodyParser from "@curveball/bodyparser";
import problem from "@curveball/problem";

///  U T I L

import cors from "./cors";
import routes from "./routes";
import { environment } from "~util/index";

const isDevelopment = environment === "development";



///  P R O G R A M

const app = new Application();

isDevelopment && app.use(accessLog());

app.use(problem());

app.use(cors({
  allowOrigin: isDevelopment ?
    ["*"] : [
      "https://xn--4v8h.pixels.wtf",
      "https://*beachfront.network"
    ],
  allowHeaders: [
    "content-type"
  ],
  // allowMethods?: string[],
  // exposeHeaders?: string[]
}));

app.use(bodyParser());
app.use(...routes);



///  E X P O R T

export default app;
