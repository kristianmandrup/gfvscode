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
}

export class GrailsTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly itemType: GrailsItemType,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public children?: GrailsTreeItem[]
  ) {
    super(label, collapsibleState);

    const iconPathTo = (fileName: string) =>
      vscode.Uri.file(__dirname + `/icons/${fileName}.svg`);

    switch (itemType) {
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

export class GrailsTreeProvider
  implements vscode.TreeDataProvider<GrailsTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    GrailsTreeItem | undefined
  > = new vscode.EventEmitter<GrailsTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<GrailsTreeItem | undefined> =
    this._onDidChangeTreeData.event;

  getTreeItem(element: GrailsTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: GrailsTreeItem): Thenable<GrailsTreeItem[]> {
    if (!element) {
      return Promise.resolve(this.getRootItems());
    }
    return Promise.resolve(element.children || []);
  }

  private getControllersTreeItem(): GrailsTreeItem {
    return new GrailsTreeItem(
      "Controllers",
      GrailsItemType.Controller,
      vscode.TreeItemCollapsibleState.Collapsed,
      [
        new GrailsTreeItem(
          "SampleController",
          GrailsItemType.Controller,
          vscode.TreeItemCollapsibleState.None
        ),
      ]
    );
  }

  private getViewsTreeItem(): GrailsTreeItem {
    return new GrailsTreeItem(
      "Views",
      GrailsItemType.View,
      vscode.TreeItemCollapsibleState.Collapsed,
      [
        new GrailsTreeItem(
          "SampleView",
          GrailsItemType.View,
          vscode.TreeItemCollapsibleState.None
        ),
      ]
    );
  }

  private getDomainModelsTreeItem(): GrailsTreeItem {
    return new GrailsTreeItem(
      "Domain Models",
      GrailsItemType.DomainModel,
      vscode.TreeItemCollapsibleState.Collapsed,
      [
        new GrailsTreeItem(
          "SampleDomain",
          GrailsItemType.DomainModel,
          vscode.TreeItemCollapsibleState.None
        ),
      ]
    );
  }

  private getRootItems(): GrailsTreeItem[] {
    const controllersTreeItem = this.getControllersTreeItem();
    const viewsTreeItem = this.getViewsTreeItem();
    const domainModelsTreeItem = this.getDomainModelsTreeItem();

    return [controllersTreeItem, viewsTreeItem, domainModelsTreeItem];
  }
}
