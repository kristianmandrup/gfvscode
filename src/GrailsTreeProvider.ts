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
        this.getViewsInProject(
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
        return Promise.resolve(this.getControllersInProject(projectRootPath));
      } else {
        vscode.window.showInformationMessage("Workspace has no package.json");
        return Promise.resolve([]);
      }
    }
  }

  private getControllersInProject(grailsPath: string): Dependency[] {
    const workspaceRoot = this.workspaceRoot;
    if (this.pathExists(grailsPath) && workspaceRoot) {
    }
    return [];
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getViewsInProject(grailsPath: string): Dependency[] {
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
