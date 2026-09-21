export function formatTime(ms, showMS = true) {
  const minutes = String(Math.floor(ms / 60000));
  const seconds =
    minutes == 0
      ? String(Math.floor((ms % 60000) / 1000))
      : String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');

  if (showMS) {
    return minutes == 0 ? `${seconds}.${cs}` : `${minutes}:${seconds}.${cs}`;
  } else {
    return minutes == 0 ? `${seconds}` : `${minutes}:${seconds}`;
  }
}

export function calculateAo5(scores) {
  if (!Array.isArray(scores) || scores.length < 5) return null;
  const last5 = scores.slice(0, 5).map((item) => item.duration_ms);
  last5.sort((a, b) => a - b);
  const middle3 = last5.slice(1, 4);
  const sum = middle3.reduce((acc, cur) => acc + cur, 0);
  return Math.round(sum / 3);
}

export function genScramble(event = '3x3') {
  console.log('helper:', event);
  const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
  const tail = ['', '2', "'"];
  let length = 22;
  let result = '';
  let preLetterIndex = -1;
  let prePreLetterIndex = -2;
  switch (event) {
    case '3x3':
      for (let i = 0; i < length; i++) {
        let curIndex =
          preLetterIndex === -1
            ? Math.floor(Math.random() * 6)
            : (preLetterIndex + Math.floor(Math.random() * 5) + 1) % 6;

        if (
          preLetterIndex >= 0 &&
          prePreLetterIndex >= 0 &&
          ((preLetterIndex / 2) | 0) == ((prePreLetterIndex / 2) | 0)
        ) {
          while (((preLetterIndex / 2) | 0) == ((curIndex / 2) | 0)) {
            curIndex = Math.floor(Math.random() * 6);
          }
        }
        prePreLetterIndex = preLetterIndex;
        preLetterIndex = curIndex;
        let curTail = Math.floor(Math.random() * 3);
        result += moves[curIndex] + tail[curTail] + ' ';
      }
      return result;
    case 'mega':
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 10; j++) {
          result += Math.random() > 0.5 ? '+' : '-';
          result += j % 2 ? ' ' : '';
        }
        result += Math.random() > 0.5 ? '$\n' : 'O\n';
      }
      return result;
    default:
      return 'Unexpected Error';
  }
}

export function formatEventName(event) {
  switch (event) {
    case 'mega':
      return 'Megaminx';
    case '3x3':
      return '3x3';
  }
}
