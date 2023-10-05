import * as pomParser from "pom-parser";

interface PomParserOpts {
  filePath?: string;
  xmlContent?: string;
}

export class Pom {
  opts: any;
  pom: any;

  constructor(opts: PomParserOpts) {
    this.opts = opts;
  }

  async init() {
    this.pom = await this.parsePom();
    return this;
  }

  parsePom = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
      pomParser.parse(this.opts, (err, pomResponse) => {
        if (err) {
          console.log("ERROR: " + err);
          reject(err);
        }
        resolve(pomResponse.pomObject);
      });
    });
  };

  projectProps = (): any => {
    const project = this.pom.project;
    const { name, description } = project.name;
    const grailsVersion = project.properties["grails.version"];
    return {
      name,
      description,
      grailsVersion,
    };
  };

  plugins = (): string[] => {
    const project = this.pom.project;
    const build = project.build;
    const pluginList = build.plugins["plugin"];
    return pluginList.map((plugin) => plugin.groupid);
  };

  dependencies = (): string[] => {
    const project = this.pom.project;
    const build = project.build;
    const pluginList = build.dependencies["dependency"];
    return pluginList.map((plugin) => plugin.groupid);
  };
}
