# Nubomedia Graph Editor

This is currently very much a Work-In-Progress.

The documentation for this project can be read online in [Read The Docs](http://nubomedia-graph-editor.readthedocs.org/)

---

## Getting started

### Prerequisites

[Node](https://nodejs.org/) and [Gulp](http://gulpjs.com/).

This project is built using JavaScript and built using NodeJS-based tools. So please install the latest node from your OS package manager or from the [NodeJS site](https://nodejs.org/), and then install Gulp with `npm install -g gulp`. Depending on your system, you may need to use administrator privileges: `sudo npm install -g gulp`.

### Clone the project

To use this project, clone and install the repository with:

```
git clone https://github.com/GlassOceanos/nubomedia-graphedit
cd nubomedia-graphedit
npm install
```

It will take some time to download dependencies.

### Build & run

`gulp electron` or `gulp`

To run the application, you can just type `gulp`, which will build it and then launch a browser connected to it. If you want to run it as a desktop application (packaged using the [Electron Shell](http://electron.atom.io/)), type `gulp electron`. Note that some functionality, like access to the local filesystem for saving and loading, will only be available from Electron - the browser version is there to help during development.

There are functional build steps based on npm scripts in `package.json`, but moving forward the build will be managed by Gulp.
