


///  N A T I V E

import { get } from "https";
import { globalAgent } from "http";
import { parse } from "url";



///  E X P O R T

export default function download(uri: string, opts = {}): Promise<{ buffer: any, res: any }> {
  return new Promise((resolve, reject) => {
    const data: any[] = [];

    opts = Object.assign(opts, parse(uri));
    // @ts-ignore TS2339: Properties "agent" and "protocol" do not exist on type "{}".
    opts.agent = opts.protocol === "http:" ?
      globalAgent :
      void 0;

    get(opts, res => {
      res.on("data", chunk => data.push(chunk));

      res.on("end", () => {
        // @ts-ignore TS2532: Object is possibly "undefined".
        if (res.statusCode >= 400)
          return reject(res);

        // @ts-ignore TS2532: Object is possibly "undefined".
        if (res.statusCode > 300 && res.headers.location)
          resolve(download(res.headers.location, opts));

        resolve({ buffer: Buffer.concat(data), res })
      });
    }).on("error", reject);
  });
}



// via https://github.com/terkelg/hent
// > Tiny utility to fetch remote files into buffers
