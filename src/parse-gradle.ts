import * as g2js from "gradle-to-js/lib/parser";

export const parseGradle = (path: string): Promise<any> => g2js.parseFile(path);

export const dependencies = (gradle: any) => {
  return gradle.dependencies.map((dep) => ({
    //
  }));
};
