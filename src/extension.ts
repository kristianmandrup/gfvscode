"use strict";

import * as vscode from "vscode";
import { GrailsTreeProvider } from "./GrailsTreeProvider";

const getRootPath = () =>
  vscode.workspace.workspaceFolders &&
  vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;

export function activate(context: vscode.ExtensionContext) {
  const rootPath = getRootPath();

  // Samples of `window.registerTreeDataProvider`
  const grailsTreeProvider = new GrailsTreeProvider(rootPath);
  vscode.window.registerTreeDataProvider("grailsTree", grailsTreeProvider);

  // Register command to open file
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.openFile", (uri: vscode.Uri) => {
      if (uri) {
        vscode.window.showTextDocument(uri);
      }
    })
  );

  //   vscode.commands.registerCommand("nodeDependencies.refreshEntry", () =>
  //     grailsTreeProvider.refresh()
  //   );

  //   vscode.commands.registerCommand("extension.openPackageOnNpm", (moduleName) =>
  //     vscode.commands.executeCommand(
  //       "vscode.open",
  //       vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)
  //     )
  //   );
  //   vscode.commands.registerCommand("nodeDependencies.addEntry", () =>
  //     vscode.window.showInformationMessage(`Successfully called add entry.`)
  //   );
  //   vscode.commands.registerCommand(
  //     "nodeDependencies.editEntry",
  //     (node: Dependency) =>
  //       vscode.window.showInformationMessage(
  //         `Successfully called edit entry on ${node.label}.`
  //       )
  //   );
  //   vscode.commands.registerCommand(
  //     "nodeDependencies.deleteEntry",
  //     (node: Dependency) =>
  //       vscode.window.showInformationMessage(
  //         `Successfully called delete entry on ${node.label}.`
  //       )
  //   );

  //   const jsonOutlineProvider = new JsonOutlineProvider(context);
  //   vscode.window.registerTreeDataProvider("jsonOutline", jsonOutlineProvider);
  //   vscode.commands.registerCommand("jsonOutline.refresh", () =>
  //     jsonOutlineProvider.refresh()
  //   );
  //   vscode.commands.registerCommand("jsonOutline.refreshNode", (offset) =>
  //     jsonOutlineProvider.refresh(offset)
  //   );
  //   vscode.commands.registerCommand("jsonOutline.renameNode", (args) => {
  //     let offset = undefined;
  //     if (args.selectedTreeItems && args.selectedTreeItems.length) {
  //       offset = args.selectedTreeItems[0];
  //     } else if (typeof args === "number") {
  //       offset = args;
  //     }
  //     if (offset) {
  //       jsonOutlineProvider.rename(offset);
  //     }
  //   });
  //   vscode.commands.registerCommand("extension.openJsonSelection", (range) =>
  //     jsonOutlineProvider.select(range)
  //   );

  // Samples of `window.createView`
  //   new FtpExplorer(context);
  //   new FileExplorer(context);

  //   // Test View
  //   new TestView(context);

  //   new TestViewDragAndDrop(context);
}
