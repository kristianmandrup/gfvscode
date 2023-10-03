import * as g2js from "gradle-to-js/lib/parser";

export const parse = (path: string): Promise<any> => g2js.parseFile(path);
