# Codegen Installation Guide

Code Generator for Nubomedia project. This is still a prototype version with just some components mapped and ready to work. 

## Prerequisites

[NodeJS](https://nodejs.org/).

This project is built using JavaScript and built using NodeJS-based tools. So please install the latest node from your OS package manager or from the [NodeJS site](https://nodejs.org/).

## Clone the project

To use this project, clone and install the repository with:

```
git clone https://github.com/GlassOceanos/nubomedia-graphedit
cd nubomedia-graphedit
cd codegen
```

## Build

```
npm install
```

It will take some time to download dependencies. 

## Usage:

```
bin/esl-nubo -h
```

```
esl-nubo codgen v. 1.0.0 for Nubomedia
Usage: index.js <command> [options]

Commands:
  gen  Generate a proyect

Options:
  -m, --model   Load a model                                          [required]
  -o, --output  Output directory for code generation                  [required]
  -h, --help    Show help                                              [boolean]

Examples:
  index.js gen -m <model.json> -o           Generates the model into the output
  <outputDir>                               directory

```

## Usage sample:

Generates the `model1.ngeprj` into the `output` target folder.
```
bin/esl-nubo gen -m models/model1.ngeprj -o output
```
Model is the project file from the Graph Editor and output the folder where the project code will be generated. 

## Docker pack and run:
```
cd output
./build.sh
./up.sh
docker ps
```
Open the docker file at `http://192.168.99.100:8443` (IP can vary depending on local docker installation).
