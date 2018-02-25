Qmix
===

## Introduction

Qmix is an in-browser Solidity IDE based on Ethereum's [remix](https://github.com/ethereum/remix) that takes (extensive) style inspiration from Microsoft's [vscode](https://github.com/Microsoft/vscode). 

Qmix extends [angular-seed](https://github.com/mgechev/angular-seed), an Angular 2+ seed project. Detailed information and best practices are available at the project's [README](https://github.com/mgechev/angular-seed/blob/master/README.md). 

## Getting Started

### Prerequisites

- [Node](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com)

### Development Quick Start

The fastest way to get started developing Qmix is to use the livereload functionality provided by Angular Seed. You'll first have to clone and access this repository.

```bash
$ git clone https://github.com/kfichter/qmix-revamp.git
$ cd qmix

# install dependencies
$ npm install

# serve the project with livereload
$ npm start
```

### Building

The easiest way to build Qmix for production is via the provided build script.

```bash
$ npm run build.prod
```

Note: due to project size, `build.prod` sets the following Node.js flags:

- --max-old-space-size=8192
- --stack_size=100000

These are already set for you and you won't need to set them yourself, this information is just included for transparency (and potentially debugging).

## Project Structure

`angular-seed` is structured into two main folders, `src` and `tools`. `src` contains the main front-end code for Qmix while `tools` contains project configuration.

Qmix has one main page, `home`. This page contains a code editor and some tooling. The home page is split into three panels, the `tabs` panel, the `sidebar` panel, and the `editor` panel. For simplicity, each of these components is implemented as an individual module available in `src/client/app/shared/components`. 

Several services are used to share data and functionality among components. The `compiler` service handles loading solcjs and compiling Solidity code. The `editor` service controls access to the current text of the code editor. The `file` service manages how files are added, deleted, opened, and closed.
