# create-app

* `echo "# create-app" >> README.md`
* `git init`
* `git add README.md`
* `git commit -m "first commit"`
* `git branch -M main`
* `git remote add origin git@github.com:jornejongsma/create-app.git`
* `git push -u origin main`

C:\Users\jorne\Documents\Repos\LEARN>npx create-react-app
Please specify the project directory:
  create-react-app <project-directory> 
  <!--  blauw  --> <!-- groen -->

For example:
  create-react-app my-react-app
  <!-- blauw -->  <!-- groen -->

Run create-react-app --help to see all options.
    <!-- blauw   -->

## en dan nu een succesvolle install:

C:\Users\jorne\Documents\Repos\LEARN>npx create-react-app test-create-react-app

Creating a new React app in C:\Users\jorne\Documents\Repos\LEARN\test-create-react-app.

Installing packages. This might take a couple of minutes.
Installing react, react-dom, and react-scripts with cra-template...

yarn add v1.22.10
[1/4] Resolving packages...
[2/4] Fetching packages...
info fsevents@1.2.13: The platform "win32" is incompatible with this module.
info "fsevents@1.2.13" is an optional dependency and failed compatibility check. Excluding it from installation.
info fsevents@2.3.2: The platform "win32" is incompatible with this module.
info "fsevents@2.3.2" is an optional dependency and failed compatibility check. Excluding it from installation.
[3/4] Linking dependencies...
warning "react-scripts > @typescript-eslint/eslint-plugin > tsutils@3.20.0" has unmet peer dependency "typescript@>=2.8.0 || >= 3.2.0-dev || >= 3.3.0-dev || >= 3.4.0-dev || >= 3.5.0-dev || >= 3.6.0-dev || >= 3.6.0-beta || >= 3.7.0-dev || >= 3.7.0-beta".
[4/4] Building fresh packages...
success Saved lockfile.
success Saved 7 new dependencies.
info Direct dependencies
├─ cra-template@1.1.2
├─ react-dom@17.0.2
├─ react-scripts@4.0.3
└─ react@17.0.2
info All dependencies
├─ cra-template@1.1.2
├─ immer@8.0.1
├─ react-dev-utils@11.0.4
├─ react-dom@17.0.2
├─ react-scripts@4.0.3
├─ react@17.0.2
└─ scheduler@0.20.2
Done in 25.97s.

Initialized a git repository.

Installing template dependencies using yarnpkg...
yarn add v1.22.10
[1/4] Resolving packages...
[2/4] Fetching packages...
info fsevents@2.3.2: The platform "win32" is incompatible with this module.
info "fsevents@2.3.2" is an optional dependency and failed compatibility check. Excluding it from installation.
info fsevents@1.2.13: The platform "win32" is incompatible with this module.
info "fsevents@1.2.13" is an optional dependency and failed compatibility check. Excluding it from installation.
[3/4] Linking dependencies...
warning "react-scripts > @typescript-eslint/eslint-plugin > tsutils@3.20.0" has unmet peer dependency "typescript@>=2.8.0 || >= 3.2.0-dev || >= 3.3.0-dev || >= 3.4.0-dev || >= 3.5.0-dev || >= 3.6.0-dev || >= 3.6.0-beta || >= 3.7.0-dev || >= 3.7.0-beta".
warning " > @testing-library/user-event@12.8.3" has unmet peer dependency "@testing-library/dom@>=7.21.4".
[4/4] Building fresh packages...
success Saved lockfile.
success Saved 16 new dependencies.
info Direct dependencies
├─ @testing-library/jest-dom@5.16.1
├─ @testing-library/react@11.2.7
├─ @testing-library/user-event@12.8.3
├─ react-dom@17.0.2
├─ react@17.0.2
└─ web-vitals@1.1.2
info All dependencies
├─ @testing-library/dom@7.31.2
├─ @testing-library/jest-dom@5.16.1
├─ @testing-library/react@11.2.7
├─ @testing-library/user-event@12.8.3
├─ @types/aria-query@4.2.2
├─ @types/jest@27.0.3
├─ @types/testing-library__jest-dom@5.14.2
├─ css.escape@1.5.1
├─ css@3.0.0
├─ lz-string@1.4.4
├─ min-indent@1.0.1
├─ react-dom@17.0.2
├─ react@17.0.2
├─ redent@3.0.0
├─ strip-indent@3.0.0
└─ web-vitals@1.1.2
Done in 7.99s.
Removing template package using yarnpkg...

yarn remove v1.22.10
[1/2] Removing module cra-template...
[2/2] Regenerating lockfile and installing missing dependencies...
info fsevents@2.3.2: The platform "win32" is incompatible with this module.
info "fsevents@2.3.2" is an optional dependency and failed compatibility check. Excluding it from installation.
info fsevents@1.2.13: The platform "win32" is incompatible with this module.
info "fsevents@1.2.13" is an optional dependency and failed compatibility check. Excluding it from installation.
warning " > @testing-library/user-event@12.8.3" has unmet peer dependency "@testing-library/dom@>=7.21.4".
warning "react-scripts > @typescript-eslint/eslint-plugin > tsutils@3.20.0" has unmet peer dependency "typescript@>=2.8.0 || >= 3.2.0-dev || >= 3.3.0-dev || >= 3.4.0-dev || >= 3.5.0-dev || >= 3.6.0-dev || >= 3.6.0-beta || >= 3.7.0-dev || >= 3.7.0-beta".
success Uninstalled packages.
Done in 5.38s.

Created git commit.

Success! Created test-create-react-app at C:\Users\jorne\Documents\Repos\LEARN\test-create-react-app
Inside that directory, you can run several commands:

  yarn start
    Starts the development server.

  yarn build
    Bundles the app into static files for production.

  yarn test
    Starts the test runner.

  yarn eject
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!

We suggest that you begin by typing:

  cd test-create-react-app
  yarn start

Happy hacking!

## En de help:

C:\Users\jorne\Documents\Repos\LEARN>npx create-react-app --help
Usage: create-react-app <project-directory> [options]

Options:
  -V, --version                            output the version number
  --verbose                                print additional logs
  --info                                   print environment debug info
  --scripts-version <alternative-package>  use a non-standard version of react-scripts
  --template <path-to-template>            specify a template for the created project
  --use-npm
  --use-pnp
  -h, --help                               output usage information
    Only <project-directory> is required.

    A custom --scripts-version can be one of:
      - a specific npm version: 0.8.2
      - a specific npm tag: @next
      - a custom fork published on npm: my-react-scripts
      - a local path relative to the current working directory: file:../my-react-scripts
      - a .tgz archive: https://mysite.com/my-react-scripts-0.8.2.tgz
      - a .tar.gz archive: https://mysite.com/my-react-scripts-0.8.2.tar.gz
    It is not needed unless you specifically want to use a fork.

    A custom --template can be one of:
      - a custom template published on npm: cra-template-typescript
      - a local path relative to the current working directory: file:../my-custom-template
      - a .tgz archive: https://mysite.com/my-custom-template-0.8.2.tgz
      - a .tar.gz archive: https://mysite.com/my-custom-template-0.8.2.tar.gz

    If you have any problems, do not hesitate to file an issue:
      https://github.com/facebook/create-react-app/issues/new


      # ESLint --init example
      ? How would you like to use ESLint? ...
        To check syntax only
        To check syntax and find problems
