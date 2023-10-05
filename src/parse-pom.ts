import * as pomParser from "pom-parser";

interface PomParserOpts {
  filePath?: string;
  xmlContent?: string;
}

export const properties = async (opts: PomParserOpts): Promise<any> => {
  const pom = await parsePom(opts);
  const project = pom.project;
  const { name, description } = project.name;
  const grailsVersion = project.properties["grails.version"];
  return {
    name,
    description,
    grailsVersion,
  };
};

export const plugins = async (opts: PomParserOpts): Promise<string[]> => {
  const pom = await parsePom(opts);
  const project = pom.project;
  const build = project.build;
  const pluginList = build.plugins["plugin"];
  return pluginList.map((plugin) => plugin.groupid);
};

export const dependencies = async (opts: PomParserOpts): Promise<string[]> => {
  const pom = await parsePom(opts);
  const project = pom.project;
  const build = project.build;
  const pluginList = build.dependencies["dependency"];
  return pluginList.map((plugin) => plugin.groupid);
};

export const parsePom = async (opts: PomParserOpts): Promise<any> => {
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
