export const windowSize = {
  '3x3': { w: 353, h: 311 },
  mega: { w: 320, h: 397 }
};

export function setWindowSize(win, cubeEvent) {
  win.setSize(windowSize[cubeEvent].w, windowSize[cubeEvent].h);
}
