import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { parsePom } from "./parse-pom";
import { parseGradle } from "./parse-gradle";
import { readGlob } from "./glob";
import { Item, ControllerItem, DomainItem, ViewItem } from "./items";
import { ControllerFolderItem } from "./folder-items";

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
export class GrailsTreeProvider implements vscode.TreeDataProvider<Item> {
  grailsAppPath: string;

  constructor(private workspaceRoot: string) {}

  getTreeItem(element: Item): vscode.TreeItem {
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

  openFileCmd = "extension.openFile";

  private openViewCommand(fileName) {
    return {
      command: this.openFileCmd,
      title: "",
      arguments: [fileName],
    };
  }

  getChildren(element?: Item): Thenable<Item[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No Item in empty workspace");
      return Promise.resolve([]);
    }
    this.grailsAppPath = path.join(this.workspaceRoot, "grails-app");

    const pom = this.getPomDetails();
    const gradle = this.getGradleDetails();
    const controllers = this.getControllers();
    const services = this.getServices();
    const views = this.getViews();
    const domainModels = this.getDomainModels();
    const bundles = this.getLocalizeBundles();
    const tagLibs = this.getTagLibs();
  }

  // Maven Project Object Model
  private getPomDetails() {
    const pomPath = path.join(this.workspaceRoot, "pom.xml");

    if (this.pathExists(pomPath)) {
      const pom = parsePom({ filePath: pomPath }).then((res) => {});
    }
  }

  // Gradle build and dependencies tool
  private getGradleDetails() {
    const gradlePath = path.join(this.workspaceRoot, "build.gradle");

    if (this.pathExists(gradlePath)) {
      const pom = parseGradle(gradlePath).then((res) => {});
    }
  }

  private async getLocalizeBundles(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "i18");
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*.messages.properties");
  }

  private async getTagLibs(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "taglibs");
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*TagLib.groovy");
  }

  private async getDomainModels(): Promise<Item[]> {
    const folderPath = path.join(this.grailsAppPath, "domain");
    if (!this.pathExists(folderPath)) return [];
    const files = await readGlob(folderPath, "*Model.groovy");
    // files.map(file => )
    return [];
  }

  private async getServices(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "services");
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*Service.groovy");
  }

  private async getControllers(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "controllers");
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*Controller.groovy");
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private async getViews(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "views");
    if (!this.pathExists(folderPath)) return [];
    return await readGlob(folderPath, "*View.groovy");
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }

    return true;
  }
}
