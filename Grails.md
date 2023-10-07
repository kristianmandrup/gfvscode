# Grails

The grails application has the following folder structure.

```
├── .gradle
├── build
├── gradle
├── grails-app
├── src
├── .gitignore.txt
├── build.gradle
├── gradle
├── gradlew
├── gradlew.bat
├── grailsw
├── grailsw.bat
└── grails-wrapper
```

## grails/-app

```
├── assets
├── conf
├── controllers
├── domain
├── i18n
├── init
├── services
├── taglib
├── utils
└── views
```

The directory structure is followed for the most part by all applications because
artifacts are defined primarily by their root folder.
Controller class names end in 'Controller', and taglibs and services have similar
naming conventions, but domain classes don't have any name restrictions.

So it's the location under grails-app/domain that defines a groovy class as a domain class.

```
%PROJECT_HOME%
    + grails-app
       + conf                 ---> location of configuration artifacts
           + hibernate        ---> optional hibernate config
           + spring           ---> optional spring config
       + controllers          ---> location of controller artifacts
       + domain               ---> location of domain classes
       + i18n                 ---> location of message bundles for i18n
       + services             ---> location of services
       + taglib               ---> location of tag libraries
       + util                 ---> location of special utility classes
       + views                ---> location of views
           + layouts          ---> location of layouts
   + lib
   + scripts                  ---> scripts
   + src
       + groovy               ---> optional; location for Groovy source files
                                   (of types other than those in grails-app/*)
       + java                 ---> optional; location for Java source files
   + test                     ---> generated test classes
   + web-app
       + WEB-INF
```

## Monorepo Grails

Setup Nx Libraries:

Create separate Nx libraries for your views, controllers, and models. You can do this using the Nx CLI:

bash
Copy code
nx generate lib grails-views
nx generate lib grails-controllers
nx generate lib grails-models
Move Existing Code:

Move your Grails views, controllers, and models into their respective Nx libraries. This will require refactoring the directory structure.

For instance, if you're working with Grails 4.x, the typical directory structure is:

bash
Copy code
/grails-app
/controllers
/views
/domain
Based on the libraries you created, you might end up with a structure similar to:

bash
Copy code
/libs
/grails-views
/src
/main
/grails-app
/views
/grails-controllers
/src
/main
/grails-app
/controllers
/grails-models
/src
/main
/grails-app
/domain
Adjust Build & Configuration:

Grails typically uses Gradle as its build tool. You'd need to adjust your build.gradle files to recognize this new structure. Ensure that the main Grails app recognizes and compiles these library projects as dependencies.

You might also need to adjust the Grails configuration (typically found in grails-app/conf) to recognize these new paths, especially if you're dealing with views and URL mappings.

Update Nx Configuration:

In `nx.json` and `workspace.json`, ensure that your new libraries are correctly defined. Specify dependencies between them if any exist. For instance, if your controllers depend on your models, this should be reflected in the configuration.

To customize `build.gradle` for the proposed Nx folder structure, you'll be setting up a multi-project build. The main Grails project will act as the primary project, while the views, controllers, and models libraries will be subprojects.

Given the directory structure:

```
/
|-- grails-app (Main Grails application)
|-- libs
    |-- grails-views
    |-- grails-controllers
    |-- grails-models
```

Here's how you might adjust the `build.gradle` files:

Root Project build.gradle (at `/build.gradle`)

This will define the main Grails application and include the subprojects:

```groovy
subprojects {
    apply plugin: 'org.grails.grails-web'
    apply plugin: 'org.grails.plugins.views-json'
    // Add other Grails or Gradle plugins as needed
}

project(':libs:grails-views') {
    // Configuration for views
}

project(':libs:grails-controllers') {
    // Configuration for controllers
}

project(':libs:grails-models') {
    dependencies {
        // This is just an example. Typically, domain classes (models) might have dependencies
        // on Hibernate or GORM for instance.
        compile 'org.grails.plugins:hibernate5'
        compile 'org.hibernate:hibernate-core:5.1.5.Final'
    }
}
```

`settings.gradle` (at `/settings.gradle`)

Include your subprojects in the settings.gradle:

```groovy
rootProject.name = 'grails-app'
include 'libs:grails-views'
include 'libs:grails-controllers'
include 'libs:grails-models'
```

Each Library's `build.gradle` (e.g., `/libs/grails-views/build.gradle`)

Each subproject or library will also have its `build.gradle` tailored for its specific needs:

```groovy
// For grails-views
apply plugin: 'groovy'

dependencies {
    compile project(':grails-app')  // If the views library depends on the main app
    // ... other dependencies
}
```

Ensure you adjust `grails-controllers` and `grails-models` similarly based on their dependencies.

Adjust Paths in Grails Configuration

Since you've changed the location of views, controllers, and models, you'll probably need to adjust configurations (e.g., `UrlMappings.groovy`) and possibly view paths to correctly locate resources.

Ensure Grails knows where to find views and how to route requests.

Realistic example of `build.gradle` configurations for the `views` and `controllers` subprojects in the Nx folder structure.

Given the directory structure:

```
/
|-- grails-app (Main Grails application)
|-- libs
|-- grails-views
|-- grails-controllers
```

Root Project `build.gradle` (at `/build.gradle`)

This will define the main Grails application and include the subprojects:

```groovy
subprojects {
apply plugin: 'org.grails.grails-web'
apply plugin: 'org.grails.plugins.views-json'

    repositories {
        mavenLocal()
        mavenCentral()
        maven { url "https://repo.grails.org/grails/core" }
    }

    dependencies {
        compile 'org.springframework.boot:spring-boot-starter-logging'
        compile 'org.springframework.boot:spring-boot-autoconfigure'
        compile 'org.grails:grails-core'
        compile 'org.springframework.boot:spring-boot-starter-actuator'
        compile 'org.springframework.boot:spring-boot-starter-tomcat'
        compile 'org.grails:grails-dependencies'
        compile 'org.grails:grails-web-boot'
        compile 'org.grails.plugins:cache'
        compile 'org.grails.plugins:scaffolding'
    }
}

project(':libs:grails-views') {
// Configuration for views
}

project(':libs:grails-controllers') {
// Configuration for controllers
}
```

`libs/grails-views/build.gradle`

This configuration primarily focuses on Groovy and Grails' view-related dependencies:

```groovy
apply plugin: 'groovy'

dependencies {
compile project(':grails-app')
compile 'org.codehaus.groovy:groovy:3.0.7' // Adjust the version accordingly
compile 'org.grails:grails-web'
compile 'org.grails.plugins:views-json'
compile 'org.grails.plugins:views-xml'
// Add any other view-specific dependencies, such as custom taglibs or view utilities
}
```

`libs/grails-controllers/build.gradle`

This configuration addresses controller-specific dependencies:

```groovy
apply plugin: 'groovy'

dependencies {
    compile project(':grails-app')
    compile 'org.codehaus.groovy:groovy:3.0.7' // Adjust the version accordingly
    compile 'org.grails:grails-web'
    compile 'org.grails:grails-plugin-controllers'
    compile 'org.grails:grails-plugin-url-mappings'
    compile 'org.grails:grails-plugin-interceptors'
    // Add other dependencies that your controllers might need. E.g., services, utilities, etc.
}
```

These configurations allow the views and controllers subprojects to be standalone compilable units, yet they depend on the primary Grails app for shared resources. Depending on your project's specifics, you might also need to handle services, datasources, or other configurations separately.

Here's how you might set up your `build.gradle` for a grails-views library that resides within an Nx workspace, using sourceSets to define the location of your views:

Given the directory structure:

```
/
|-- grails-app (Main Grails application)
|-- libs
    |-- grails-views
        |-- src
            |-- main
                |-- grails-app
                    |-- views
```

The `build.gradle` file for the grails-views subproject (`/libs/grails-views/build.gradle`) would be set up as follows:

```groovy
apply plugin: 'groovy'  // Assuming Groovy for Grails

repositories {
    mavenLocal()
    mavenCentral()
    maven { url "https://repo.grails.org/grails/core" }
}

dependencies {
    // Include dependencies relevant to the views if there are any
    compile 'org.codehaus.groovy:groovy:3.0.7'  // Adjust version as required
    compile 'org.grails:grails-web'
}

// Adjusting the sourceSets to reflect the location of the views
sourceSets {
    main {
        groovy {
            // Here's where you define the source directory for your views.
            // In Grails, views are typically GSPs (Groovy Server Pages), but since
            // they're not "groovy" source code in the traditional sense, they might not
            // need this sourceSet configuration. However, if you had any Groovy utilities,
            // classes, or helpers within the grails-views directory, this is where they'd be referenced.
            srcDirs = ['src/main/groovy']
        }
        resources {
            // Here's where GSPs or other view-related resources would typically be defined
            srcDir 'src/main/grails-app/views'
        }
    }
}
```

You can add additional configurations, tasks, or plugins below

This `sourceSets` configuration explicitly tells Gradle where to find the Groovy source files (if any) and the GSP view files within the grails-views subproject.
