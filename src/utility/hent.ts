


/// native

import { get } from "https";
import { globalAgent } from "http";
import { parse } from "url";



/// export

export default function download(uri: string, opts: any = {}): Promise<{ buffer: any, res: any }> {
  return new Promise((resolve, reject) => {
    const data: any[] = [];

    opts = Object.assign(opts, parse(uri));

    opts.agent = opts.protocol === "http:" ?
      globalAgent :
      void 0;

    get(opts, (res: any) => {
      res.on("data", chunk => data.push(chunk));

      res.on("end", () => {
        if (res.statusCode >= 400)
          return reject(res);

        if (res.statusCode > 300 && res.headers.location)
          resolve(download(res.headers.location, opts));

        resolve({ buffer: Buffer.concat(data), res })
      });
    }).on("error", reject);
  });
}



/// via https://github.com/terkelg/hent
/// > Tiny utility to fetch remote files into buffers
