import * as vscode from "vscode";

export class SampleTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public children?: SampleTreeItem[]
  ) {
    super(label, collapsibleState);
  }
}

export class SampleTreeProvider
  implements vscode.TreeDataProvider<SampleTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    SampleTreeItem | undefined
  > = new vscode.EventEmitter<SampleTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<SampleTreeItem | undefined> =
    this._onDidChangeTreeData.event;

  getTreeItem(element: SampleTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SampleTreeItem): Thenable<SampleTreeItem[]> {
    if (!element) {
      return Promise.resolve(this.getRootItems());
    }
    return Promise.resolve(element.children || []);
  }

  private getRootItems(): SampleTreeItem[] {
    return [
      new SampleTreeItem(
        "Parent 1",
        vscode.TreeItemCollapsibleState.Collapsed,
        [
          new SampleTreeItem("Child 1", vscode.TreeItemCollapsibleState.None),
          new SampleTreeItem("Child 2", vscode.TreeItemCollapsibleState.None),
        ]
      ),
      new SampleTreeItem(
        "Parent 2",
        vscode.TreeItemCollapsibleState.Collapsed,
        [
          new SampleTreeItem("Child 1", vscode.TreeItemCollapsibleState.None),
          new SampleTreeItem("Child 2", vscode.TreeItemCollapsibleState.None),
        ]
      ),
    ];
  }
}
