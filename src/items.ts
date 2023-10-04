import * as vscode from "vscode";
import * as path from "path";

export class Item extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private readonly version?: string,
    public readonly collapsibleState?: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState || vscode.TreeItemCollapsibleState.None);

    this.tooltip = this.version ? `${this.label}-${this.version}` : this.label;
    this.description = this.version;
  }
}

export class ControllerItem extends Item {
  iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "light",
      `controller.svg`
    ),
    dark: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "dark",
      `controller.svg`
    ),
  };

  contextValue = "Controller";
}

export class DomainItem extends Item {
  iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "light",
      `domain.svg`
    ),
    dark: path.join(__filename, "..", "..", "resources", "dark", `domain.svg`),
  };

  contextValue = "View";
}

export class ViewItem extends Item {
  iconPath = {
    light: path.join(__filename, "..", "..", "resources", "light", `view.svg`),
    dark: path.join(__filename, "..", "..", "resources", "dark", `view.svg`),
  };

  contextValue = "View";
}

export class ServiceItem extends Item {
  iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "light",
      `service.svg`
    ),
    dark: path.join(__filename, "..", "..", "resources", "dark", `service.svg`),
  };

  contextValue = "View";
}
