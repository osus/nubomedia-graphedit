# Installation Guide

## Prerequisites

[NodeJS](https://nodejs.org/) and [Gulp](http://gulpjs.com/).

This project is built using JavaScript and built using NodeJS-based tools. So please install the latest node from your OS package manager or from the [NodeJS site](https://nodejs.org/), and then install Gulp with `npm install -g gulp`. Depending on your system, you may need to use administrator privileges: `sudo npm install -g gulp`.

## Clone the project

To use this project, clone and install the repository with:

```
git clone https://github.com/GlassOceanos/nubomedia-graphedit
cd nubomedia-graphedit
npm install
```

It will take some time to download dependencies.

## Build & run

`gulp electron` or `gulp`

To run the application, you can just type `gulp`, which will build it and then launch a browser connected to it. If you want to run it as a desktop application (packaged using the [Electron Shell](http://electron.atom.io/)), type `gulp electron`. Note that some functionality, like access to the local filesystem for saving and loading, will only be available from Electron - the browser version is there to help during development.


## Third Party Software used

[NodeJS](https://nodejs.org/)

NodeJS is a cross-platform combination of the JavaScript V8 engine from Google and a set of libraries for performing asynchronous I/O. It is used as a platform to drive server backends as well as to run command-line applications and tools, both client- and server-side. A large amount of tools for web and JavaScript development are based on NodeJS.

[Gulp](http://gulpjs.com/)

A "task runner", a command-line tool that takes the specification for a set of tasks and can execute them on demand. It is built on top of NodeJS.

[Electron Shell](http://electron.atom.io/)

Electron is a combination of NodeJS and the Chromium HTML engine. It is used to create desktop applications based on HTML5 technologies, packaging them as native executables and giving them access to Operating System resources not normally available to web-based JavaScript applications. It was created by GitHub as part of the Atom text editor project.

