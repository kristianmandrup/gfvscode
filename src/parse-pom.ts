import * as pomParser from "pom-parser";

interface PomParserOpts {
  filePath?: string;
  xmlContent?: string;
}

export const parsePom = (opts: PomParserOpts): Promise<any> => {
  return new Promise((resolve, reject) => {
    pomParser.parse(opts, (err, pomResponse) => {
      if (err) {
        console.log("ERROR: " + err);
        reject(err);
      }
      // The original pom xml that was loaded is provided.
      // console.log("XML: " + pomResponse.pomXml);
      // The parsed pom pbject.
      resolve(pomResponse.pomObject);
    });
  });
};
