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
    folder: "$app/services",
    findPattern: "*Service.groovy",
    replacePattern: "Service.groovy",
    type: GrailsItemType.Service,
  },
  domain: {
    folder: "$app/domain",
    findPattern: "*Model.groovy",
    replacePattern: "Model.groovy",
    type: GrailsItemType.DomainModel,
  },
  taglib: {
    folder: "$app/taglibs",
    findPattern: "*TagLib.groovy",
    replacePattern: "TagLib.groovy",
    type: GrailsItemType.TagLib,
  },
  view: {
    folder: "$app/views",
    findPattern: "*View.groovy",
    replacePattern: "View.groovy",
    type: GrailsItemType.View,
  },
  controller: {
    folder: "$app/controllers",
    findPattern: "*Controller.groovy",
    replacePattern: "Controller.groovy",
    type: GrailsItemType.Controller,
  },
  "unit-test": {
    folder: "$app/test/unit",
    findPattern: "*(Spec|Test).groovy",
    replacePattern: /(Spec|Test).groovy/,
    type: GrailsItemType.Test,
  },
  "integration-test": {
    folder: "$app/test/integration",
    findPattern: "*(Spec|Test).groovy",
    replacePattern: /(Spec|Test).groovy/,
    type: GrailsItemType.Test,
  },
  "functional-test": {
    folder: "$app/test/functional",
    findPattern: "*(Spec|Test).groovy",
    replacePattern: /(Spec|Test).groovy/,
    type: GrailsItemType.Test,
  },
};

export class GrailsTreeProvider
  implements vscode.TreeDataProvider<GrailsTreeItem>
{
  grailsAppPath: string;
  grailsConfig: any;

  constructor(private workspaceRoot: string) {}

  getTreeItem(element: GrailsTreeItem): vscode.TreeItem {
    return element;
  }

  loadGrailsConfig() {
    try {
      const content = fs.readFileSync("grails-project.json", "utf8");
      return JSON.parse(content) || {};
    } catch (err) {
      return {};
    }
  }

  defaultGrailsConfig() {
    return {
      paths: {
        application: "grails-app",
        controller: "grails-app/controllers",
        domain: "grails-app/domain",
        view: "grails-app/views",
        taglib: "grails-app/taglibs",
        "unit-test": "grails-app/test/unit-tests",
        "integration-test": "grails-app/test/integration-tests",
        "functional-test": "grails-app/test/functional-tests",
      },
    };
  }

  setGrailsConfig() {
    const loadedConfig = this.loadGrailsConfig();
    const defaultConfig = this.defaultGrailsConfig();
    this.grailsConfig = {
      ...defaultConfig,
      ...loadedConfig,
    };
  }

  getGrailsConfigPathFor = (key: string) => this.grailsConfig.paths[key];

  getItemValuesFor = (key: string) => {
    const configValues = itemValueMap[key];
    configValues.folder =
      this.getGrailsConfigPathFor(key) || configValues.folder;
    return configValues;
  };

  getChildren(element?: GrailsTreeItem): Thenable<GrailsTreeItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No Item in empty workspace");
      return Promise.resolve([]);
    }
    this.setGrailsConfig();
    this.grailsAppPath =
      this.grailsConfig.paths.application ||
      path.join(this.workspaceRoot, "grails-app");
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
    const testsFolder = await this.getTestsFolderItem();

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

  private async getTestsFolderItem(): Promise<GrailsTreeItem> {
    const unitTests = await this.getUnitTestsFolderItem();
    const integrationTests = await this.getIntegrationTestsFolderItem();
    const functionalTests = await this.getFunctionalTestsFolderItem();
    const items = [unitTests, integrationTests, functionalTests];
    return new GrailsTreeItem("tests", {
      type: GrailsItemType.TestsFolder,
      children: items,
    });
  }

  private async getUnitTestsFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getUnitTestItems();
    return new GrailsTreeItem("unit tests", {
      type: GrailsItemType.TestsFolder,
      children: items,
    });
  }

  private async getIntegrationTestsFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getIntegrationTestItems();
    return new GrailsTreeItem("integration tests", {
      type: GrailsItemType.TestsFolder,
      children: items,
    });
  }

  private async getFunctionalTestsFolderItem(): Promise<GrailsTreeItem> {
    const items = await this.getFunctionalTestItems();
    return new GrailsTreeItem("functional tests", {
      type: GrailsItemType.TestsFolder,
      children: items,
    });
  }

  private async getUnitTestItems(): Promise<GrailsTreeItem[]> {
    return this.getItemsFor("unit-test");
  }

  private async getIntegrationTestItems(): Promise<GrailsTreeItem[]> {
    return this.getItemsFor("integration-test");
  }

  private async getFunctionalTestItems(): Promise<GrailsTreeItem[]> {
    return this.getItemsFor("functional-test");
  }

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

  private async getItemsFor(key: string): Promise<GrailsTreeItem[]> {
    const { folder, findPattern, replacePattern, type } =
      this.getItemValuesFor(key);
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

  private async getFolderFileItems({
    folder,
    findPattern,
    replacePattern,
  }: FolderMatchParams): Promise<FileItem[]> {
    let folderPath = path.join(this.workspaceRoot, folder);
    if (folder.includes(`$app`)) {
      folderPath.replace(`$app`, this.grailsAppPath);
    }
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
