export const windowSize = {
  '3x3': { x: 334, y: 261 },
  mega: { x: 380, y: 380 }
};

export function setWindowSize(win, cubeEvent) {
  win.setSize(windowSize[cubeEvent].x, windowSize[cubeEvent].y);
}
