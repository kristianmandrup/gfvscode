import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Pom } from "./parse-pom";
import { parseGradle } from "./parse-gradle";
import { readGlob } from "./glob";
import { GrailsItemType, GrailsTreeItem } from "./GrailsTreeItem";

export interface FolderMatchParams {
  folder: string;
  findPattern: string;
  replacePattern: string;
}
export interface FileItem {
  label: string;
  filePath: string;
}

const itemValueMap: any = {
  service: {
    folder: "services",
    findPattern: "*Service.groovy",
    replacePattern: "Service.groovy",
    type: GrailsItemType.Service,
  },
  domain: {
    folder: "domain",
    findPattern: "*Model.groovy",
    replacePattern: "Model.groovy",
    type: GrailsItemType.DomainModel,
  },
  taglib: {
    folder: "taglibs",
    findPattern: "*TagLib.groovy",
    replacePattern: "TagLib.groovy",
    type: GrailsItemType.TagLib,
  },
  view: {
    folder: "views",
    findPattern: "*View.groovy",
    replacePattern: "View.groovy",
    type: GrailsItemType.View,
  },
  controller: {
    folder: "controllers",
    findPattern: "*Controller.groovy",
    replacePattern: "Controller.groovy",
    type: GrailsItemType.Controller,
  },
};

const getItemValuesFor = (key: string) => itemValueMap[key];
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
export class GrailsTreeProvider
  implements vscode.TreeDataProvider<GrailsTreeItem>
{
  grailsAppPath: string;

  constructor(private workspaceRoot: string) {}

  getTreeItem(element: GrailsTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: GrailsTreeItem): Thenable<GrailsTreeItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No Item in empty workspace");
      return Promise.resolve([]);
    }
    this.grailsAppPath = path.join(this.workspaceRoot, "grails-app");
    return this.getFolders();
  }

  private async getFolders(): Promise<GrailsTreeItem[]> {
    // const pom = this.getPomDetails();
    // const gradle = this.getGradleDetails();
    // const bundles = this.getLocalizeBundles();
    const controllersFolder = await this.getControllerFolderItem();
    const servicesFolder = await this.getServiceFolderItem();
    const domainModelsFolder = await this.getDomainModelFolderItem();
    const viewsFolder = await this.getViewFolderItem();
    const tagLibsFolder = await this.getTagLibFolderItem();

    return [
      controllersFolder,
      domainModelsFolder,
      servicesFolder,
      viewsFolder,
      tagLibsFolder,
    ];
  }

  // Maven Project Object Model
  private async getPomDetails(): Promise<any> {
    const pomPath = path.join(this.workspaceRoot, "pom.xml");

    if (!this.pathExists(pomPath)) return [];
    const pom = new Pom({ filePath: pomPath });
    await pom.init();
    const project = pom.projectProps();
    const dependencies = pom.dependencies();
    const plugins = pom.plugins();
    return {
      project,
      dependencies,
      plugins,
    };
  }

  // Gradle build and dependencies tool
  private getGradleDetails() {
    const gradlePath = path.join(this.workspaceRoot, "build.gradle");

    if (this.pathExists(gradlePath)) {
      const pom = parseGradle(gradlePath).then((res) => {});
    }
  }

  // private async getLocalizeBundles(): Promise<string[]> {
  //   const folderPath = path.join(this.grailsAppPath, "i18");
  //   if (!this.pathExists(folderPath)) return [];
  //   const files = await readGlob(folderPath, "*.messages.properties");
  //   return files.map((file) => file.replace("messages.properties", ""));
  // }

  private async getTagLibFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getTagLibItems();
    return new GrailsTreeItem("models", {
      type: GrailsItemType.TagLibFolder,
      children: items,
    });
  }

  private async getTagLibItems(): Promise<GrailsTreeItem[]> {
    return this.getItemsFor("taglib");
  }

  private async getDomainModelFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getDomainModelItems();
    return new GrailsTreeItem("models", {
      type: GrailsItemType.DomainModelFolder,
      children: items,
    });
  }

  private async getDomainModelItems(): Promise<GrailsTreeItem[]> {
    return this.getItemsFor("domain");
  }

  private async getServiceFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getServiceItems();
    return new GrailsTreeItem("services", {
      type: GrailsItemType.ServiceFolder,
      children: items,
    });
  }

  private async getServiceItems(): Promise<GrailsTreeItem[]> {
    return this.getItemsFor("service");
  }

  private async getItemsFor(key: string): Promise<GrailsTreeItem[]> {
    const { folder, findPattern, replacePattern, type } = getItemValuesFor(key);
    return (
      await this.getFolderFileItems({
        folder,
        findPattern,
        replacePattern,
      })
    ).map(
      ({ label, filePath }) =>
        new GrailsTreeItem(label, {
          uri: filePath,
          type,
        })
    );
  }

  private async getControllerFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getControllerItems();
    return new GrailsTreeItem("controllers", {
      type: GrailsItemType.ControllerFolder,
      children: items,
    });
  }

  private async getControllerItems(): Promise<GrailsTreeItem[]> {
    return this.getItemsFor("controller");
  }

  private async getViewFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getViewItems();
    return new GrailsTreeItem("views", {
      type: GrailsItemType.ViewFolder,
      children: items,
    });
  }

  private async getViewItems(): Promise<GrailsTreeItem[]> {
    return this.getItemsFor("view");
  }

  private async getFolderFileItems({
    folder,
    findPattern,
    replacePattern,
  }: FolderMatchParams): Promise<FileItem[]> {
    const folderPath = path.join(this.grailsAppPath, folder);
    if (!this.pathExists(folderPath)) return [];
    const files = await readGlob(folderPath, findPattern);
    return files.map((filePath) => ({
      label: filePath.replace(replacePattern, ""),
      filePath,
    }));
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
