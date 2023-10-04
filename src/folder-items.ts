import { Item } from "./items";
import * as path from "path";

export class ControllerFolderItem extends Item {
  iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "light",
      `controller-folder.svg`
    ),
    dark: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "dark",
      `controller-folder.svg`
    ),
  };

  contextValue = "Controller folder";
}
