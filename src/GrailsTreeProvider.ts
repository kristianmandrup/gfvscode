import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
  }

  iconPath = {
    light: path.join(__filename, "..", "..", "resources", "light", "gear.svg"),
    dark: path.join(__filename, "..", "..", "resources", "dark", "gear.svg"),
  };

  contextValue = "dependency";
}

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
export class GrailsTreeProvider implements vscode.TreeDataProvider<Dependency> {
  constructor(private workspaceRoot: string) {}

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No dependency in empty workspace");
      return Promise.resolve([]);
    }

    const views = "";
    const controllers = "";

    if (views) {
      return Promise.resolve(
        this.getViews(
          path.join(
            this.workspaceRoot,
            "node_modules",
            element.label,
            "package.json"
          )
        )
      );
    }
    const projectRootPath = path.join(this.workspaceRoot, "pom.xml");
    const pomPath = path.join(this.workspaceRoot, "pom.xml");

    if (this.pathExists(pomPath)) {
      const packageJson = JSON.parse(fs.readFileSync(pomPath, "utf-8"));
    }

    if (controllers) {
      if (this.pathExists(projectRootPath)) {
        return Promise.resolve(this.getControllers(projectRootPath));
      } else {
        vscode.window.showInformationMessage("Workspace has no package.json");
        return Promise.resolve([]);
      }
    }
  }

  private getLocalizeBundles(grailsPath: string): Dependency[] {
    const workspaceRoot = this.workspaceRoot;
    if (this.pathExists(grailsPath) && workspaceRoot) {
    }
    return [];
  }

  private getTagLibs(grailsPath: string): Dependency[] {
    const workspaceRoot = this.workspaceRoot;
    if (this.pathExists(grailsPath) && workspaceRoot) {
    }
    return [];
  }

  private getDomainModels(grailsPath: string): Dependency[] {
    const workspaceRoot = this.workspaceRoot;
    if (this.pathExists(grailsPath) && workspaceRoot) {
    }
    return [];
  }

  private getServices(grailsPath: string): Dependency[] {
    const workspaceRoot = this.workspaceRoot;
    if (this.pathExists(grailsPath) && workspaceRoot) {
    }
    return [];
  }

  private getControllers(grailsPath: string): Dependency[] {
    const workspaceRoot = this.workspaceRoot;
    if (this.pathExists(grailsPath) && workspaceRoot) {
    }
    return [];
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getViews(grailsPath: string): Dependency[] {
    const workspaceRoot = this.workspaceRoot;
    if (this.pathExists(grailsPath) && workspaceRoot) {
      const packageJson = JSON.parse(fs.readFileSync(grailsPath, "utf-8"));

      const toDep = (moduleName: string, version: string): Dependency => {
        if (
          this.pathExists(path.join(workspaceRoot, "node_modules", moduleName))
        ) {
          return new Dependency(
            moduleName,
            version,
            vscode.TreeItemCollapsibleState.Collapsed
          );
        } else {
          return new Dependency(
            moduleName,
            version,
            vscode.TreeItemCollapsibleState.None,
            {
              command: "extension.openPackageOnNpm",
              title: "",
              arguments: [moduleName],
            }
          );
        }
      };

      const deps = packageJson.dependencies
        ? Object.keys(packageJson.dependencies).map((dep) =>
            toDep(dep, packageJson.dependencies[dep])
          )
        : [];
      const devDeps = packageJson.devDependencies
        ? Object.keys(packageJson.devDependencies).map((dep) =>
            toDep(dep, packageJson.devDependencies[dep])
          )
        : [];
      return deps.concat(devDeps);
    } else {
      return [];
    }
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
