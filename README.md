# Float Timer

This is a Rubik's cube timer app that can be displayed over other apps. Technique: An Electron application with React.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Pre-requirement

- [Python](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/en/download/current)
- [Git](https://git-scm.com/install/) (unnecessary)

If you are using an Windows 11 or 10, you can use `winget` in cmd:

|Name|Id|
|---|---|
|Python 3.14|Python.Python.3.14|
|Node.js (LTS)|OpenJS.NodeJS.LTS|
|Git|Git.Git|

```bash
winget search --id Python.Python
winget search --id OpenJS.NodeJS.LTS
winget search --id Git.Git

winget install --id Python.Python.3.14
winget install --id OpenJS.NodeJS.LTS
winget install --id Git.Git
```

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
