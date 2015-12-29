# Software Architecture

This tool is composed of two different applications:

- The Graph Editor is a desktop app that lets a developer visually create and edit component graphs and save them as json-based files with the `.ngeprj` file extension.

- The Code Generator is a command-line app that takes `.ngeprj` files and generates source code to implement these graphs in new applications.

## Graph Editor

The Graph Editor is an HTML app based on Facebook's React and Dan Abramov's Redux libraries. The main gist of these technologies is to control the flow of data and mutation in an application.

React allows the UI and visual aspects of the application be defined purely as a function of the application state. This way, the UI is refreshed and reflects the changes to the app state automatically, rather than mutations of state needing on-the-fly in-place mutation of the corresponding pieces of the UI.

Redux is a variation of the Flux architecture proposed by Facebook as a companion to React, and is heavily inspired by functional UI frameworks such as Elm. It stores the entire application state in a single object (called the `store`), and this state must always be mutated in special functions called `reducers`, in response to dispatched `actions`. Mutation is the wrong word in fact, as Redux reducers are expected to create a *new* store containing the new state as required by the action they are reducing. This ensures a very simple, predictable and traceable flow of data and state throughout the entire application.

With these architectural pieces, it is easy to describe the application in terms of the store structure, and the components making up the UI. However, getting to grips with this style of architecture takes time, and the development of this project will reflect that learning process. Expect some notable changes and frequest refactors.

### Store

The Store is largely a reflection of the contents of the loaded Graph Editor project. It contains the following sub-stores:

- **nodedefs**: contains the loaded Node Definitions that are available as nodes for the user to insert in graphs.

- **graphs**: contains the different graphs in the project.

- **editor**: this is distinctly not part of the data saved in a project, but rather reflects the current state of the interactive editor: graph being currently edited, etc.

### Caveats

This application uses jsPlumb as the library to manage display and editing of graphs. jsPlumb is not integrated in the React/Redux architecture, but it manages both visual and data aspects of the application. Fitting this component in the reactive architecture is a challenge. We will try to limit the impact of this issue, but it necessarily means that certain reducers will be dealing with mutation of the jsPlumb component as well as their normal job of predictably mutating the store state.

