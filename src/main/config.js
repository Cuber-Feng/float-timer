export const windowSize = {
  '3x3': { x: 353, y: 311 },
  mega: { x: 320, y: 397 }
};

export function setWindowSize(win, cubeEvent) {
  win.setSize(windowSize[cubeEvent].x, windowSize[cubeEvent].y);
}
