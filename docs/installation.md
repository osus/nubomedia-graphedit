# Installation Guide

## Prerequisites

[NodeJS](https://nodejs.org/) and [Gulp](http://gulpjs.com/).

This project is built using JavaScript and built using NodeJS-based tools. So please install the latest node from your OS package manager or from the [NodeJS site](https://nodejs.org/), and then install Gulp with `npm install -g gulp`. Depending on your system, you may need to use administrator privileges: `sudo npm install -g gulp`.

## Clone the project

To use this project, clone and install the repository with:

```
git clone https://github.com/GlassOceanos/nubomedia-graphedit
cd nubomedia-graphedit
```

## Build & run the editor

```
cd editor
npm install
```

It will take some time to download dependencies. Once it's finished:

`gulp electron` or `gulp`

To run the application, you can just type `gulp`, which will build it and then launch a browser connected to it. If you want to run it in its final form as a desktop application (packaged using the [Electron Shell](http://electron.atom.io/)), type `gulp electron`. Note that some functionality, like access to the local filesystem for saving and loading, will only be available from Electron - the browser version is maintained solely to help during development.


## Third Party Software used

[NodeJS](https://nodejs.org/)

NodeJS is a cross-platform combination of the JavaScript V8 engine from Google and a set of libraries for performing asynchronous I/O. It is used as a platform to drive server backends as well as to run command-line applications and tools, both client- and server-side. A large amount of tools for web and JavaScript development are based on NodeJS.

[Gulp](http://gulpjs.com/)

A "task runner", a command-line tool that takes the specification for a set of tasks and can execute them on demand. It is built on top of NodeJS, and used to execute the different tasks related to building and testing different versions of the project.

[Electron Shell](http://electron.atom.io/)

Electron is a combination of NodeJS and the Chromium HTML engine. It is used to create desktop applications based on HTML5 technologies, packaging them as native executables and giving them access to Operating System resources not normally available to web-based JavaScript applications. It was created by GitHub as part of the Atom text editor project.

[React](https://facebook.github.io/react/)

React is a framework for managing and rendering HTML content inside web applications. It roughly fills the role of the "View" in the common Model-View-Controller type of architectures.

[Redux](https://github.com/rackt/redux)

Redux is a predictable state container for JavaScript apps. It is a variation of the Flux architecture described by Facebook as part of the React project. It has become the de facto standard state management solution for many React projects due to its simplicity and flexibility.

[Bootstrap](http://getbootstrap.com/)

Bootstrap is a UI library of components and styles created by Twitter to facilitate the creation of responsive web projects that work well across different browsers and devices.

[React-Bootstrap](https://react-bootstrap.github.io/)

Boostrap-react is a derivation of Bootstrap that implements the UI widgets and React components.

[jsPlumb Community Edition](https://jsplumbtoolkit.com/)

jsPlumb is a library that facilitates the creation, display and editing of connected graphs of nodes in HTML.

[Browserify](http://browserify.org/)

Browserify is a module bundler for JavaScript projects

[Babel](https://babeljs.io/)

Babel is a compiler that transforms modern versions of the JavaScript language to older versions, compatible with more browsers and platforms.

[jQuery](https://jquery.com/)

jQuery is a widely used library of utilities and compatibility helpers for HTML web pages and applications.

**Other**

A number of minor node modules to support the various major components listed above. See the file `package.json` for a complete list of runtime and development modules.

