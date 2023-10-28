import * as vscode from "vscode";
import * as path from "path";

export enum GrailsItemType {
  Controller,
  View,
  DomainModel,
  Service,
  Style,,
  ControllerFolder,
  ViewFolder,
  DomainModelFolder,
  ServiceFolder,
  TagLib,
  StyleFolder,
  TagLibFolder,
  TestFolder,
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

    const iconPathTo = (fileName: string) => {
      const filePath = path.resolve(__dirname, `../icons/${fileName}.svg`);
      return vscode.Uri.file(filePath);
    };

    if (this.children.length !== 0) {
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    } else {
      this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }
    const closed =
      this.collapsibleState == vscode.TreeItemCollapsibleState.Collapsed;
    const opened = !!closed;
    let iconFile;
    switch (type) {
      case GrailsItemType.Controller:
        this.iconPath = {
          dark: iconPathTo("file_type_config"),
          light: iconPathTo("file_type_light_config"),
        };
        break;
      case GrailsItemType.View:
        this.iconPath = iconPathTo("file_type_view");
        break;
      case GrailsItemType.DomainModel:
        this.iconPath = this.iconPath = iconPathTo("file_type_taskfile");
        break;
      case GrailsItemType.Service:
        this.iconPath = this.iconPath = iconPathTo("file_type_bat");
        break;
      case GrailsItemType.TagLib:
        this.iconPath = this.iconPath = iconPathTo("folder_type_view");
        break;
      case GrailsItemType.Test:
        this.iconPath = this.iconPath = iconPathTo("folder_type_test");
        break;
      case GrailsItemType.Style:
        this.iconPath = this.iconPath = iconPathTo("folder_type_stylable");
        break;
  

      case GrailsItemType.ControllerFolder:
        iconFile = closed
          ? "folder_type_controller"
          : "folder_type_controller_opened";
        this.iconPath = iconPathTo(iconFile);
        break;
      case GrailsItemType.ViewFolder:
        iconFile = closed ? "folder_type_view" : "folder_type_view_opened";
        this.iconPath = iconPathTo(iconFile);
        break;
      case GrailsItemType.DomainModelFolder:
        iconFile = closed ? "folder_type_model" : "folder_type_model_opened";
        this.iconPath = iconPathTo(iconFile);
        break;
      case GrailsItemType.ServiceFolder:
        iconFile = closed
          ? "folder_type_services"
          : "folder_type_services_opened";
        this.iconPath = this.iconPath = iconPathTo(iconFile);
        break;
      case GrailsItemType.TagLibFolder:
        iconFile = closed ? "folder_type_src" : "folder_type_src_opened";
        this.iconPath = iconPathTo(iconFile);
        break;
      case GrailsItemType.TestFolder:
        iconFile = closed ? "folder_type_test" : "folder_type_test_opened";
        this.iconPath = iconPathTo(iconFile);
        break;  
      case GrailsItemType.StyleFolder:
        iconFile = closed ? "folder_type_theme" : "folder_type_theme_opened";
        this.iconPath = iconPathTo(iconFile);
        break;
    }
  }
}
