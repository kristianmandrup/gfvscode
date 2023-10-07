import * as vscode from "vscode";

export enum GrailsItemType {
  Controller,
  View,
  DomainModel,
  Service,
  ControllerFolder,
  ViewFolder,
  DomainModelFolder,
  ServiceFolder,
  TagLib,
  TagLibFolder,
  TestsFolder,
  Test,
}

interface GrailsTreeItemOpts {
  type: GrailsItemType;
  collapsibleState?: vscode.TreeItemCollapsibleState;
  uri?: string;
  children?: GrailsTreeItem[];
}

export class GrailsTreeItem extends vscode.TreeItem {
  public readonly label: string;
  public readonly collapsibleState: vscode.TreeItemCollapsibleState;
  public readonly uri: string;
  public readonly type: GrailsItemType;
  public children?: GrailsTreeItem[];

  constructor(
    label: string,
    { collapsibleState, uri, type, children }: GrailsTreeItemOpts
  ) {
    super(label, collapsibleState || vscode.TreeItemCollapsibleState.None);
    this.uri = uri;
    this.type = type;
    this.children = children;
    // If the item has a URI, set the command to open the file
    if (this.uri) {
      this.command = {
        command: "extension.openFile",
        title: "Open File",
        arguments: [this.uri],
      };
    }

    const iconPathTo = (fileName: string) =>
      vscode.Uri.file(__dirname + `/icons/${fileName}.svg`);

    switch (type) {
      case GrailsItemType.Controller:
        this.iconPath = iconPathTo("controller");
        break;
      case GrailsItemType.View:
        this.iconPath = iconPathTo("view");
        break;
      case GrailsItemType.DomainModel:
        this.iconPath = this.iconPath = iconPathTo("domain");
        break;
      case GrailsItemType.Service:
        this.iconPath = this.iconPath = iconPathTo("service");
        break;
      case GrailsItemType.TagLib:
        this.iconPath = this.iconPath = iconPathTo("taglib");
        break;
      case GrailsItemType.ControllerFolder:
        this.iconPath = this.iconPath = iconPathTo("controller-folder");
        break;
      case GrailsItemType.ViewFolder:
        this.iconPath = this.iconPath = iconPathTo("view-folder");
        break;
      case GrailsItemType.DomainModelFolder:
        this.iconPath = this.iconPath = iconPathTo("domain-folder");
        break;
      case GrailsItemType.ServiceFolder:
        this.iconPath = this.iconPath = iconPathTo("service-folder");
        break;
      case GrailsItemType.TagLibFolder:
        this.iconPath = this.iconPath = iconPathTo("taglib-folder");
        break;
    }
  }
}
