import { Menu, app } from 'electron';

export function createAppMenu({
  currentAlwaysOnTop,
  currentOpacity,
  currentEvent,
  handleUpdateOpacity,
  handleSwitchEvent,
  handleAlwaysOnTop,
  handleToggleStats,
  handleClearAll
}) {
  console.log('App menu is being created');
  const opacityValues = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  const template = [
    {
      label: 'View',
      submenu: [
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: currentAlwaysOnTop,
          accelerator: 'CmdOrCtrl+T',
          click: handleAlwaysOnTop
        },
        {
          label: 'Opacity',
          submenu: opacityValues.map((value) => ({
            label: `${value * 100}%`,
            type: 'radio',
            accelerator: `CmdOrCtrl+${value == 1 ? 0 : value * 10}`,
            checked: currentOpacity === value,
            click: handleUpdateOpacity
          }))
        },
        { type: 'separator' },
        { role: 'reload', label: 'Reload' }
      ]
    },
    {
      label: 'Event',
      submenu: [
        {
          label: '3x3',
          type: 'radio',
          checked: currentEvent == '3x3',
          click: () => handleSwitchEvent('3x3')
        },
        {
          label: 'Megaminx',
          type: 'radio',
          checked: currentEvent == 'mega',
          click: () => handleSwitchEvent('mega')
        }
      ]
    },
    {
      label: 'Results',
      submenu: [
        {
          label: 'Toggle Stats',
          type: 'checkbox',
          accelerator: 'CmdOrCtrl+s',
          click: handleToggleStats
        },
        {
          label: 'Clear All Scores',
          click: handleClearAll
        }
      ]
    },
    {
      label: 'Dev',
      submenu: [{ role: 'toggleDevTools', label: 'Inspect' }]
    }
  ];
  // macOS 建议保留默认的应用名菜单（第1个 Menu 项）
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about', label: `About ${app.name}` },
        { type: 'separator' },
        { role: 'quit', label: 'Quit' }
      ]
    });
  }
  // 构建并应用菜单
  console.log('App menu template has been created successfully');
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  console.log('App menu has been created successfully (by the template)');
}
