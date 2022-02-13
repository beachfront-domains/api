/// UNUSED



// import auth from "simple-hmac-auth-express";
// import { nanoid } from "nanoid";
// import { RethinkDBStore } from "session-rethinkdb-ts";
// import session from "express-session";



// const store = new RethinkDBStore({
//   // RethinkDB connection options.
//   connectOptions: databaseOptions,
//   flushInterval: 60000, // How long to wait before flushing data. Defaults to 1 minute.
//   sessionTimeout: 86400000, // How long a session ID is valid for. Defaults to 1 day.
//   table: "session" // RethinkDB table to store session info to. Defaults to "session".
// });

// TODO
// : create auth middleware
//   : active on POST method

// console.log(server.get("env"));

// if (!isDevelopment)
//   server.set("trust proxy", 1);



// TODO
// : update CORS to be more restrictive in production
//   : https://xn--4v8h.pixels.wtf
//   : https://app.beachfront
//   : https://*.beachfront.network



// .use(session({
//   cookie: { secure: !isDevelopment },
//   genid: () => nanoid(),
//   resave: true,
//   saveUninitialized: false,
//   secret: key.secret,
//   store
// }))



// sess.cookie.test = "wtf man idk";
// console.log(">>> session");
// console.log(sess);
// console.log("\n");
// session.save(sess);
// console.log(Object.keys(req));

// TODO
// : perform auth checks here, preferably via a separate function
// : return null for context if no customer is found (in other functions, not here)
// : check JWT and get customer
// : add customer to context

// if (type === "mutation" && name !== "login")

// const user = new Promise((resolve, reject) => {
//   jwt.verify(token, getKey, options, (err, decoded) => {
//     if(err) {
//       return reject(err);
//     }
//     resolve(decoded.email);
//   });
// });

// return { user };
