import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { parsePom } from "./parse-pom";
import { parseGradle } from "./parse-gradle";
import { readGlob } from "./glob";
import { BaseItem, ControllerItem, DomainItem, ViewItem } from "./items";

// The grails application has the following folder structure.

// ├── .gradle
// ├── build
// ├── gradle
// ├── grails-app
// ├── src
// ├── .gitignore.txt
// ├── build.gradle
// ├── gradle
// ├── gradlew
// ├── gradlew.bat
// ├── grailsw
// ├── grailsw.bat
// └── grails-wrapper

// grails/-app

// ├── assets
// ├── conf
// ├── controllers
// ├── domain
// ├── i18n
// ├── init
// ├── services
// ├── taglib
// ├── utils
// └── views

// The directory structure is followed for the most part by all applications because
// artifacts are defined primarily by their root folder.
// Controller class names end in 'Controller', and taglibs and services have similar
// naming conventions, but domain classes don't have any name restrictions.
// So it's the location under grails-app/domain that defines a groovy class as a domain class.

// %PROJECT_HOME%
//     + grails-app
//        + conf                 ---> location of configuration artifacts
//            + hibernate        ---> optional hibernate config
//            + spring           ---> optional spring config
//        + controllers          ---> location of controller artifacts
//        + domain               ---> location of domain classes
//        + i18n                 ---> location of message bundles for i18n
//        + services             ---> location of services
//        + taglib               ---> location of tag libraries
//        + util                 ---> location of special utility classes
//        + views                ---> location of views
//            + layouts          ---> location of layouts
//    + lib
//    + scripts                  ---> scripts
//    + src
//        + groovy               ---> optional; location for Groovy source files
//                                    (of types other than those in grails-app/*)
//        + java                 ---> optional; location for Java source files
//    + test                     ---> generated test classes
//    + web-app
//        + WEB-INF
export class GrailsTreeProvider implements vscode.TreeDataProvider<BaseItem> {
  grailsPath: string;

  constructor(private workspaceRoot: string) {}

  getTreeItem(element: BaseItem): vscode.TreeItem {
    return element;
  }

  toItem(filePath: string, type: string, version?: string) {
    const label = path.basename(filePath);
    switch (type) {
      case "controller":
        return new ControllerItem(label);
      case "domainModel":
        return new DomainItem(label);
      case "view":
        return new ViewItem(label);
    }
  }

  getChildren(element?: BaseItem): Thenable<BaseItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No Item in empty workspace");
      return Promise.resolve([]);
    }
    this.grailsPath = this.workspaceRoot;

    const pom = this.getPomDetails();
    const gradle = this.getGradleDetails();
    const controllers = this.getControllers();
    const views = this.getViews();
    const domainModels = this.getDomainModels();
    const bundles = this.getLocalizeBundles();
    const tagLibs = this.getTagLibs();
  }

  private getPomDetails() {
    const pomPath = path.join(this.workspaceRoot, "pom.xml");

    if (this.pathExists(pomPath)) {
      const pom = parsePom({ filePath: pomPath }).then((res) => {});
    }
  }

  private getGradleDetails() {
    const gradlePath = path.join(this.workspaceRoot, "build.gradle");

    if (this.pathExists(gradlePath)) {
      const pom = parseGradle(gradlePath).then((res) => {});
    }
  }

  private async getLocalizeBundles(): Promise<string[]> {
    const folderPath = path.join("i18", this.grailsPath);
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*.messages.properties");
  }

  private async getTagLibs(): Promise<string[]> {
    const folderPath = path.join("taglibs", this.grailsPath);
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*TagLib.groovy");
  }

  private async getDomainModels(): Promise<string[]> {
    const folderPath = path.join("domain", this.grailsPath);
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*Model.groovy");
  }

  private async getServices(): Promise<string[]> {
    const folderPath = path.join("services", this.grailsPath);
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*Service.groovy");
  }

  private async getControllers(): Promise<string[]> {
    const folderPath = path.join("controllers", this.grailsPath);
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*Controller.groovy");
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private async getViews(): Promise<string[]> {
    const folderPath = path.join("views", this.grailsPath);
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*View.groovy");
  }

  //   if (this.pathExists(grailsPath) && workspaceRoot) {
  //     const packageJson = JSON.parse(fs.readFileSync(grailsPath, "utf-8"));

  //     const toDep = (moduleName: string, version: string): Item => {
  //       if (
  //         this.pathExists(path.join(workspaceRoot, "node_modules", moduleName))
  //       ) {
  //         return new Item(
  //           moduleName,
  //           version,
  //           vscode.TreeItemCollapsibleState.Collapsed
  //         );
  //       } else {
  //         return new Item(
  //           moduleName,
  //           version,
  //           vscode.TreeItemCollapsibleState.None,
  //           {
  //             command: "extension.openPackageOnNpm",
  //             title: "",
  //             arguments: [moduleName],
  //           }
  //         );
  //       }
  //     };

  //     const deps = packageJson.dependencies
  //       ? Object.keys(packageJson.dependencies).map((dep) =>
  //           toDep(dep, packageJson.dependencies[dep])
  //         )
  //       : [];
  //     const devDeps = packageJson.devDependencies
  //       ? Object.keys(packageJson.devDependencies).map((dep) =>
  //           toDep(dep, packageJson.devDependencies[dep])
  //         )
  //       : [];
  //     return deps.concat(devDeps);
  //   } else {
  //     return [];
  //   }
  // }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }

    return true;
  }
}
