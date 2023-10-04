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

    switch (itemType) {
      case GrailsItemType.Controller:
        this.iconPath = vscode.Uri.file(__dirname + "/icons/controller.svg");
        break;
      case GrailsItemType.View:
        this.iconPath = vscode.Uri.file(__dirname + "/icons/view.svg");
        break;
      case GrailsItemType.DomainModel:
        this.iconPath = vscode.Uri.file(__dirname + "/icons/domain.svg");
        break;
      case GrailsItemType.Service:
        this.iconPath = vscode.Uri.file(__dirname + "/icons/service.svg");
        break;
      case GrailsItemType.ControllerFolder:
        this.iconPath = vscode.Uri.file(
          __dirname + "/icons/controller-folder.svg"
        );
        break;
      case GrailsItemType.ViewFolder:
        this.iconPath = vscode.Uri.file(__dirname + "/icons/view-folder.svg");
        break;
      case GrailsItemType.DomainModelFolder:
        this.iconPath = vscode.Uri.file(__dirname + "/icons/domain-folder.svg");
        break;
      case GrailsItemType.ServiceFolder:
        this.iconPath = vscode.Uri.file(
          __dirname + "/icons/service-folder.svg"
        );
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
