# Grails For VSCode

A suite for development with the Grails Framework in Visual Studio Code

## Features

- Commands for Grails Framework.
- Grails project explorer

## Grails project explorer

A Tree view with all the main entities of the Grais project, including

- Views
- Models
- Controllers
- Services
- Tests
  - Unit tests
  - Integration tests
- POM
  - dependencies
  - plugins

## Commands

Activate commands with `CTRL+P` on Windows/Linux or `Cmd+P` on Mac.

### App

- `Run App`
- `Stop App`
- `Run Command`

### Project

- `Clean Project`
- `Compile Project`

### Misc

- `Grails Dependency Report`
- `Grails Help`
- `List Plugins`
- `Console`
- `Stats`
- `Package Plugin`
- `Maven Install`

### Proxy

- `Add Proxy Configuration`
- `Add Proxy Configuration (With User & Password)`
- `Clear Proxy Configuration`
- `Remove Proxy Configuration`
- `Set Proxy Configuration`

### Documentation

- `Generate Documentation`
- `Migrate Docs`

### Builders

- `Create App`
- `Create Plugin`
- `Create Domain Class`
- `Create Controller`
- `Create Service`
- `Create Filter`
- `Create Interceptor (Grails 3+)`
- `Create Hibernate Configuration File XML`
- `Create Script`
- `Create Taglib`
- `Create Unit Test`
- `Create Integration Test`
- `Create POM XML`

### Generators

- `Generate WAR`
- `Generate Views`
- `Generate Controllers`
- `Generate All (Views and Controllers)`
- `Test`
- ``

## Requirements

- Have Grails Framework installed and configured.
- Have Java Development Kit installed and configured
- The `GRAILS_HOME` environment variable set with the Grails installation path
- The `JAVA_HOME` environment variable set with the Java Development Kit (aka JDK) installation path

## Development

Currently the plugin only registers a number of commands.

These commands can be registered to be triggered from various places in the IDE, such as from the command palette via `contributes.menus.commandPalette` in `package.json`.

```json

  "contributes": {
    "menus": {
      "commandPalette": [
        {
          "command": "myExtension.sayHello",
          "when": "editorLangId == markdown"
        }
      ]
    },
```

The command can be made available only when a certain condition is met via [when clauses](https://code.visualstudio.com/api/references/when-clause-contexts)

Examples include:

- `resourceDirname == 'controllers'`
- `editorLangId == 'groovy'`
- `resourceExtname == '.gsp'` when selecting a groovy file
- `resourceFilename == 'POM.xml'`

See the full set of [context keys](https://code.visualstudio.com/api/references/when-clause-contexts#available-context-keys)

Example of

````json
{ "key": "ctrl+shift+t",  "command": "gfvscode.runTest",
                   "when": "resourceExtname == *.test.gsp" },
                   ```
````

If you wanted to add a context menu command to folders that contain a certain type of file (or something that can't be statically known), you can now use the in operator to achieve it.

```js
vscode.commands.executeCommand("setContext", "ext.supportedFolders", [
  "controllers",
]);
```

Then, in the `package.json` you could add a menu contribution for the explorer/context menu:

```json
// Note, this assumes you have already defined a command called ext.doSpecial
"menus": {
  "explorer/context": [
    {
      "command": "gfvscode.generateViewForController",
      "when": "explorerResourceIsFolder && resourceFilename in ext.supportedFolders"
    }
  ]
}
```

## Command activation

Currently the `activationEvents` entry in the `package.json` is empty

```json
"activationEvents": [],
```

See [Activation events](https://code.visualstudio.com/api/references/activation-events)

### onLanguage

This activation event is emitted and interested extensions will be activated whenever a file that resolves to a certain language gets opened.

```json
"activationEvents": [
    "onLanguage:python"
]
```

### workspaceContains

This activation event is emitted and interested extensions will be activated whenever a folder is opened and the folder contains at least one file that matches a glob pattern.

```json
"activationEvents": [
    "workspaceContains:**/.editorconfig"
]

```
