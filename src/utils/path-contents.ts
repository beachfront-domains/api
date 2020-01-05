


//  N A T I V E

import path from "path";
import { readdir, stat } from "fs";



//  E X P O R T

export function pathContents(directory) {
  const pathContent = [];
  const dirs = [];
  const files = [];

  return readDirectory(directory).then((pathContentList: []) => {
    return Promise.all(pathContentList.map((file: string) => {
      file = path.resolve(directory, file);

      return readFile(file).then((stat: { isDirectory: any }) => {
        if (stat.isDirectory()) {
          dirs.push(path.join(directory, file));
          return pathContents(file);
        } else {
          files.push(path.join(directory, file));
          return file;
        }
      });
    }));
  })
    .then(() => {
      pathContent.push({
        dirs,
        files
      });

      return pathContent[0];
    });
}



//  H E L P E R S

function readDirectory(directory) {
  return new Promise((resolve, reject) => {
    readdir(directory, (err, pathContentList) => {
      if (err)
        reject(err);
      else
        resolve(pathContentList);
    });
  });
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    stat(file, (err, stat) => {
      if (err)
        reject(err);
      else
        resolve(stat);
    });
  });
}



// via https://github.com/ishantiw/path-contents-asynch
