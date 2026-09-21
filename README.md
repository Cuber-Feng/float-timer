# float-timer

An Electron application with React

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

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

### Structure

可以。这个 `main.js` 本质上是你的 **Electron 主进程（Main Process）入口文件**。从现在的代码来看，功能已经比较完整，但随着项目继续增加功能，`main.js` 会逐渐变成一个“什么都管”的文件。

## 1. 整体框架

你现在的架构大概是：

```text
Electron App
│
├── Main Process
│   └── main.js
│       ├── App 生命周期
│       ├── Main Window
│       ├── Stats Window
│       ├── Application Menu
│       ├── IPC
│       ├── Settings (electron-store)
│       └── Database
│
├── Preload
│   └── preload.js
│       └── 暴露 API 给 Renderer
│
├── Renderer Process
│   └── React
│       ├── Timer
│       ├── Score UI
│       └── ...
│
└── Database
    └── db.js
        └── SQLite
```

也就是说：

```text
React Renderer
      │
      │ IPC
      ↓
   preload.js
      │
      ↓
  main.js
   │     │
   ↓     ↓
 db.js  electron-store
   │
   ↓
 SQLite
```

这是一个比较标准的 Electron 架构。

---

# 2. `main.js` 现在负责什么？

你的 `main.js` 实际上有 **6 个职责**。

### ① Electron 生命周期

```js
app.whenReady().then(() => {
    ...
});
```

负责：

* 初始化数据库
* 初始化 IPC
* 创建窗口
* 创建菜单
* macOS activate
* app quit

---

### ② Main Window

```js
function createWindow() {
    mainWindow = new BrowserWindow({...});
}
```

负责你的 Float Timer 主窗口。

包括：

```js
mainWindow.setOpacity(...)
mainWindow.setAlwaysOnTop(...)
mainWindow.loadURL(...)
mainWindow.loadFile(...)
```

---

### ③ Settings

你使用：

```js
const store = new ElectronStore();
```

保存：

```text
opacity
alwaysOnTop
lastEvent
```

所以：

```text
electron-store
      ↓
用户设置
      ↓
main.js
```

---

### ④ Menu

```js
function setAppMenu() {
    const template = [...]
}
```

这一块实际上非常大。

现在 Menu 负责：

```text
View
 ├── Always on Top
 ├── Opacity
 └── Reload

Event
 ├── 3x3
 └── Megaminx

Results
 ├── Toggle Stats
 └── Clear All Scores

Dev
 └── Inspect
```

所以 `main.js` 里面已经塞进了大量 UI/menu 逻辑。

---

### ⑤ IPC

这是目前非常重要的一块：

```js
ipcMain.handle('get-high-scores', ...)
ipcMain.handle('get-current-event', ...)
ipcMain.handle('add-scores', ...)
ipcMain.handle('clear-scores', ...)
ipcMain.handle('delete-score', ...)
```

也就是：

```text
Renderer
   │
   │ window.api.addScores()
   ↓
preload.js
   │
   │ ipcRenderer.invoke()
   ↓
main.js
   │
   ↓
db.js
```

例如：

```js
ipcMain.handle('add-scores', (event, records) => {
    db.addScores(records);
});
```

Main Process 在这里充当 **Renderer 和数据库之间的桥梁**。

---

# 3. 目前最大的问题：main.js 职责太多

现在：

```text
main.js
├── Window management
├── Menu
├── Settings
├── IPC
├── Database calls
├── Event switching
├── Stats window
├── App lifecycle
└── External links
```

如果以后继续增加：

* 更多 cube event
* session
* average calculation
* delete multiple
* export/import
* database migration
* settings
* keyboard shortcuts
* statistics
* themes

那么 `main.js` 很容易变成：

```text
main.js
  ↓
1000 lines
  ↓
1500 lines
  ↓
开始难以维护
```

所以我认为你现在**最值得做的优化不是性能，而是代码结构优化**。

---

# 4. 我建议的目录结构

可以逐渐变成：

```text
src/
│
├── main/
│   ├── main.js
│   │
│   ├── windows/
│   │   ├── mainWindow.js
│   │   └── statsWindow.js
│   │
│   ├── menu/
│   │   └── appMenu.js
│   │
│   ├── ipc/
│   │   ├── scoreHandlers.js
│   │   ├── eventHandlers.js
│   │   └── settingsHandlers.js
│   │
│   ├── services/
│   │   ├── scoreService.js
│   │   └── settingsService.js
│   │
│   └── db/
│       └── db.js
│
├── preload/
│   └── preload.js
│
└── renderer/
    ├── App.jsx
    ├── components/
    └── ...
```

然后 `main.js` 最终可以变得非常短：

```js
app.whenReady().then(() => {
    initDB();
    registerIPC();
    createMainWindow();
    createAppMenu();
});
```

这会非常清晰。

---

# 5. 第一优先级：把 Menu 拆出去

你现在：

```js
function setAppMenu() {
    const template = [
        ...
    ];
}
```

这一块已经有一两百行。

可以：

```text
main/
└── menu/
    └── appMenu.js
```

例如：

```js
export function createAppMenu({
    mainWindow,
    statsWindow,
    store
}) {
    const template = [
        ...
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
```

然后：

```js
import { createAppMenu } from './menu/appMenu.js';

app.whenReady().then(() => {
    createAppMenu({
        mainWindow,
        statsWindow,
        store
    });
});
```

这样 `main.js` 会马上清爽很多。

---

# 6. 第二优先级：IPC 单独拆

你现在：

```js
ipcMain.on('ping', ...)
ipcMain.handle('get-high-scores', ...)
ipcMain.handle('get-current-event', ...)
ipcMain.handle('add-scores', ...)
ipcMain.handle('clear-scores', ...)
ipcMain.handle('delete-score', ...)
```

建议：

```text
ipc/
└── scoreHandlers.js
```

例如：

```js
export function registerScoreHandlers() {

    ipcMain.handle('get-high-scores', (event, minScore, eventName) => {
        return db.getHighScores(minScore, eventName);
    });

    ipcMain.handle('add-scores', (event, records) => {
        db.addScores(records);
    });

    ipcMain.handle('clear-scores', () => {
        db.clearScores();
    });

    ipcMain.handle('delete-score', (event, id) => {
        db.deleteScore(id);
    });
}
```

然后：

```js
app.whenReady().then(() => {
    registerScoreHandlers();
});
```

以后你增加：

```text
get-average
get-best
get-session
delete-session
export-results
```

不会继续污染 `main.js`。

---

# 7. 第三优先级：数据库不要直接暴露给 IPC

现在：

```js
ipcMain.handle('add-scores', (event, records) => {
    db.addScores(records);
});
```

严格来说：

```text
IPC
 ↓
DB
```

耦合比较紧。

以后可以：

```text
IPC
 ↓
Service
 ↓
DB
```

例如：

```js
// scoreService.js

export function addScores(records) {
    db.addScores(records);
    notifyScoreUpdated();
}
```

然后 IPC：

```js
ipcMain.handle('add-scores', (event, records) => {
    return scoreService.addScores(records);
});
```

这样以后如果你加入：

```text
validation
statistics
logging
database transaction
```

就有地方放了。

---

# 8. 你这里还有一个很值得优化的地方

例如：

```js
if (statsWindow) 
    statsWindow.webContents.send('score-updated', { type: 'add' });

mainWindow.webContents.send('score-updated', { type: 'add' });
```

以及：

```js
mainWindow.webContents.send('score-updated', ...)
```

这些通知代码在多个地方重复。

可以抽象成：

```js
function notifyScoreUpdated(type) {
    const message = {
        type
    };

    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('score-updated', message);
    }

    if (statsWindow && !statsWindow.isDestroyed()) {
        statsWindow.webContents.send('score-updated', message);
    }
}
```

然后：

```js
ipcMain.handle('add-scores', (event, records) => {
    db.addScores(records);

    notifyScoreUpdated('add');

    return { success: true };
});
```

这样以后再增加第三个窗口也容易。

---

# 9. `switchEvent()` 也可以改

现在：

```js
function switchEvent(cubeEvent) {
    store.set('lastEvent', cubeEvent);

    mainWindow.webContents.send(
        'event-changed',
        { event: cubeEvent }
    );

    if (statsWindow) {
        statsWindow.webContents.send(
            'event-changed',
            { event: cubeEvent }
        );
    }
}
```

可以和上面的 notification 思路统一：

```js
function broadcast(channel, data) {
    const windows = [
        mainWindow,
        statsWindow
    ];

    for (const window of windows) {
        if (window && !window.isDestroyed()) {
            window.webContents.send(channel, data);
        }
    }
}
```

然后：

```js
function switchEvent(cubeEvent) {
    store.set('lastEvent', cubeEvent);

    broadcast('event-changed', {
        event: cubeEvent
    });
}
```

这样代码明显更干净。

---

# 10. 还有一个小问题：`mainWindow` 的安全检查

比如：

```js
mainWindow.webContents.send(...)
```

你很多地方直接调用。

但理论上：

```text
mainWindow
   ↓
可能已经 destroyed
```

所以更稳妥：

```js
if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(...);
}
```

尤其是：

```js
delete-score
clear-scores
add-scores
switchEvent
```

这些地方。

---

# 11. `mainWindow` / `statsWindow` 管理也可以进一步优化

现在：

```js
let mainWindow = null;
let statsWindow = null;
```

这对于小项目完全没问题。

但你现在已经有：

```js
windows/statsWindow.js
```

所以其实可以进一步统一：

```text
windows/
├── mainWindow.js
└── statsWindow.js
```

例如：

```js
mainWindow = createMainWindow();
statsWindow = toggleStatsWindow(statsWindow);
```

最后 `main.js` 只负责：

```text
Application orchestration
```

也就是：

> “什么时候初始化什么东西”

而不是自己知道每一个窗口的具体实现。

---

# 12. 一个比较理想的最终架构

你的项目可以逐渐变成：

```text
                  ┌──────────────┐
                  │    main.js   │
                  │ App lifecycle│
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
   Window Manager    IPC Manager      App Menu
        │                │
        ↓                ↓
 Main Window        Services
 Stats Window           │
                        ↓
                     Database
                        │
                        ↓
                     SQLite
```

而 Renderer：

```text
React
 │
 ↓
preload.js
 │
 ↓
IPC
 │
 ↓
main.js / services
 │
 ↓
SQLite
```

---

## 13. 按优先级，我会这样改

**现在不需要为了“性能”大改。** 你的程序这种 timer + SQLite 的规模，性能基本不会是问题。

我会按照：

### 第一阶段

```text
① 拆 Menu
② 拆 IPC handlers
③ 统一 window notification
```

### 第二阶段

```text
④ 拆 Window management
⑤ 加 Service layer
⑥ 给 IPC 输入做 validation
```

### 第三阶段

如果你的 Float Timer 以后功能继续增加：

```text
⑦ Database repository/service
⑧ Event/session/statistics 模块
⑨ Settings service
⑩ 更严格的 IPC API
```

---

### 最关键的一点

你现在的代码**不是“写得不好”**，而是已经到了一个很典型的阶段：

> **功能规模开始超过单文件适合承载的范围。**

目前 `main.js` 做成一个 **Application Controller** 会比较合适，而不是让它同时充当：

> Window Manager + Menu Manager + IPC Controller + Database Controller + Settings Manager。

如果你准备继续做这个 Float Timer，我会优先把它重构成 **`main.js + ipc/ + windows/ + services/ + db/`** 这套结构，而不是去做一些微小的语法优化。
