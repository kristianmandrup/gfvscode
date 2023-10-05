import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Pom } from "./parse-pom";
import { parseGradle } from "./parse-gradle";
import { readGlob } from "./glob";
// import { Item, ControllerItem, DomainItem, ViewItem } from "./items";
// import { ControllerFolderItem } from "./folder-items";
import { GrailsItemType, GrailsTreeItem } from "./GrailsTree";

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

  openFileCmd = "extension.openFile";

  private openViewCommand(fileName) {
    return {
      command: this.openFileCmd,
      title: "",
      arguments: [fileName],
    };
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

  private async getLocalizeBundles(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "i18");
    if (!this.pathExists(folderPath)) return [];
    const files = await readGlob(folderPath, "*.messages.properties");
    return files.map((file) => file.replace("messages.properties", ""));
  }

  private async getTagLibFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getTagLibItems();
    return new GrailsTreeItem(
      "models",
      GrailsItemType.TagLibFolder,
      vscode.TreeItemCollapsibleState.None,
      items
    );
  }

  private async getTagLibItems(): Promise<GrailsTreeItem[]> {
    return (await this.getTagLibNames()).map(
      (name) =>
        new GrailsTreeItem(
          name,
          GrailsItemType.TagLib,
          vscode.TreeItemCollapsibleState.None
        )
    );
  }

  private async getTagLibNames(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "taglibs");
    if (!this.pathExists(folderPath)) return [];
    const files = await readGlob(folderPath, "*TagLib.groovy");
    return files.map((file) => file.replace("Model.groovy", ""));
  }

  private async getDomainModelFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getDomainModelItems();
    return new GrailsTreeItem(
      "models",
      GrailsItemType.DomainModelFolder,
      vscode.TreeItemCollapsibleState.None,
      items
    );
  }

  private async getDomainModelItems(): Promise<GrailsTreeItem[]> {
    return (await this.getDomainModelNames()).map(
      (name) =>
        new GrailsTreeItem(
          name,
          GrailsItemType.DomainModel,
          vscode.TreeItemCollapsibleState.None
        )
    );
  }

  private async getDomainModelNames(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "domain");
    if (!this.pathExists(folderPath)) return [];
    const files = await readGlob(folderPath, "*Model.groovy");
    return files.map((file) => file.replace("Model.groovy", ""));
  }

  private async getServiceFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getServiceItems();
    return new GrailsTreeItem(
      "services",
      GrailsItemType.ServiceFolder,
      vscode.TreeItemCollapsibleState.None,
      items
    );
  }

  private async getServiceItems(): Promise<GrailsTreeItem[]> {
    return (await this.getServiceNames()).map(
      (name) =>
        new GrailsTreeItem(
          name,
          GrailsItemType.Service,
          vscode.TreeItemCollapsibleState.None
        )
    );
  }

  private async getServiceNames(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "services");
    if (!this.pathExists(folderPath)) return [];
    const files = await readGlob(folderPath, "*Service.groovy");
    return files.map((file) => file.replace("Service.groovy", ""));
  }

  private async getControllerFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getControllerItems();
    return new GrailsTreeItem(
      "controllers",
      GrailsItemType.ControllerFolder,
      vscode.TreeItemCollapsibleState.None,
      items
    );
  }

  private async getControllerItems(): Promise<GrailsTreeItem[]> {
    return (await this.getControllerNames()).map(
      (name) =>
        new GrailsTreeItem(
          name,
          GrailsItemType.Controller,
          vscode.TreeItemCollapsibleState.None
        )
    );
  }

  private async getControllerNames(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "controllers");
    if (!this.pathExists(folderPath)) return [];
    const files = await readGlob(folderPath, "*Controller.groovy");
    return files.map((file) => file.replace("Controller.groovy", ""));
  }

  private async getViewFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getViewItems();
    return new GrailsTreeItem(
      "views",
      GrailsItemType.ViewFolder,
      vscode.TreeItemCollapsibleState.None,
      items
    );
  }

  private async getViewItems(): Promise<GrailsTreeItem[]> {
    return (await this.getViewNames()).map(
      (name) =>
        new GrailsTreeItem(
          name,
          GrailsItemType.View,
          vscode.TreeItemCollapsibleState.None
        )
    );
  }

  private async getViewNames(): Promise<string[]> {
    const folderPath = path.join(this.grailsAppPath, "views");
    if (!this.pathExists(folderPath)) return [];
    const files = await readGlob(folderPath, "*View.groovy");
    return files.map((file) => file.replace("View.groovy", ""));
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
