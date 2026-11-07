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

On Linux, Electron is launched with X11 compatibility and GPU acceleration disabled to avoid a Wayland startup crash. Linux packages use the same launch options.

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Debugs

### Problem with Linux

> By ChatGPT 6, 132 steps in 18m 7s

I found the cause: Electron was starting with Wayland, then crashing while creating its first window. The GTK and VAAPI messages you pasted are warnings, not the cause. The `app.commandLine.appendSwitch()` approach wasn’t enough because Electron had already selected its display backend before the main script ran. My earlier opacity suspicion was wrong.

I changed the Linux launch configuration to pass `--ozone-platform=x11 --disable-gpu` before Electron starts. I also found that electron-builder loads the `build` settings from `package.json`, so settings added only to `electron-builder.yml` wouldn’t take effect. The dev launch now gets the flags from `electron.vite.config.mjs`, and Linux package launchers get them from `package.json`.

Verified: `npm run dev` opened the window, and `npm run build:linux` succeeded. Rebuild and use a newly generated Linux package for the packaged-app fix. Lint reports no errors; it still has one unrelated formatting warning in `App.jsx`.

## Reference & Credit

- [Cubing icons](https://icons.cubing.net/) provides the icons of each cubing event.
