import * as readdirGlob from "readdir-glob";

export const readGlob = (
  rootPath: string,
  pattern: string
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const globber = readdirGlob(rootPath, { stat: true, pattern });
    const results: any[] = [];

    globber.on("match", (m) => {
      results.push(m);
    });
    globber.on("error", (err) => {
      reject(err);
    });
    globber.on("end", (m) => {
      resolve(results);
    });
  });
};
