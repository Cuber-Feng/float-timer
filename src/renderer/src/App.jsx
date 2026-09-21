import './style/app.css';
import React, { useState, useEffect, useRef, isValidElement } from 'react';
import { formatTime, calculateAo5, genScramble, formatEventName } from './tools/helper';

function App() {
  const [time, setTime] = useState(0); // ms
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [scramble, setScramble] = useState(() => genScramble());
  const [scoresList, setScoresList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scoreUpdated, setscoreUpdated] = useState(new Date());
  const [scoreDeleted, setscoreDeleted] = useState(new Date());
  const [curEvent, setcurEvent] = useState(null);

  const ipcTest = () => {
    window.api.ping();
    console.log('App | ping');
  };
  useEffect(() => {
    // put this in a useEffect is to prevent creating listener every time.
    ipcTest();
    window.api.onScoreUpdated((data) => {
      console.log('App | Received:', data);
      setscoreUpdated(new Date());
      if (data.type == 'delete') setscoreDeleted(new Date());
    });
    window.api.onEventChanged((data) => {
      console.log('App | Event changed:', data.event);
      setcurEvent(data.event);
    });
    window.api.getCurrentEvent().then((event) => {
      setcurEvent(event);
    });
  }, []);

  useEffect(() => {
    console.log('App | score deleted');
  }, [scoreDeleted]);

  // 1. database
  // 1.1 获取所有成绩记录
  const fetchScores = async () => {
    if (!curEvent) return;
    try {
      setLoading(true);
      const data = await window.api.getHighScores(0, curEvent);
      setScoresList(data);
    } catch (err) {
      console.error('App | Fail to get the results:', err);
    } finally {
      setLoading(false);
    }
  };
  // 组件挂载时自动加载数据
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreUpdated, curEvent]);

  // 1.2 提交新增记录
  const handleAddScore = async (newRecord) => {
    try {
      await window.api.addScores([newRecord]);
      await fetchScores();
      return { success: true };
    } catch (err) {
      console.error('App | Fail to insert the result:', err);
      return { success: false, error: err };
    }
  };
  // 1.3 清空所有记录
  const clearScores = async () => {
    try {
      await window.api.clearScores();
      await fetchScores();
    } catch (err) {
      console.error('App | Fail to clear the results:', err);
    }
  };
  // database end

  // 2. Timer
  // 2.1 使用 ref 实时同步最新的状态，解决闭包陷阱
  const timeRef = useRef(time);
  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  // 2.2 监听键盘事件，控制计时器的开始、停止和重置
  const lastKeyTimeRef = useRef(0);
  useEffect(() => {
    // 监听空格键按下
    const handleKeyDown = (e) => {
      const now = Date.now();
      // console.log('App | keydown: ', e.code);
      if (e.repeat) return;
      if (now - lastKeyTimeRef.current < 300) return;
      lastKeyTimeRef.current = now;

      if (isRunning) {
        // When running, always stop the timer if a key is pressed
        e.preventDefault();
        setIsRunning(false);

        // 自动保存本次成绩到数据库
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];
        handleAddScore({
          duration_ms: timeRef.current,
          scramble: scramble,
          timestamp: `${dateStr} ${timeStr}`,
          event: `${curEvent}`
        });
        setScramble(genScramble(curEvent));
      } else {
        if (e.code === 'Space') {
          e.preventDefault();
          // ready to start the timer
          setIsReady(true);
          setTime(0);
        }
        if (e.code === 'KeyR') {
          setTime(0);
        }
      }
    };
    // 监听空格键抬起
    const handleKeyUp = (e) => {
      const now = Date.now();
      // if (now - lastKeyTimeRef.current < 300) return;
      // console.log('App | keyup: ', e.code);
      if (e.code === 'Space') {
        e.preventDefault();
        if (isReady) {
          setIsRunning(true);
          setIsReady(false);
        }
      }
      lastKeyTimeRef.current = now;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isReady, scramble, curEvent]);

  useEffect(() => {
    if (!curEvent) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScramble(genScramble(curEvent));
    if (scoresList.at(0)) setTime(scoresList.at(0).duration_ms);
    console.log('App | set scramble');
  }, [curEvent, scoresList]);

  // 2.3 处理定时器累加
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const currentAo5 = calculateAo5(scoresList);

  return (
    <div className="app-container">
      {!isRunning && !isReady && (
        <div className="scramble-container">
          <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>
            {curEvent ? formatEventName(curEvent) : 'Loading...'}
          </div>
          <p>{scramble}</p>
        </div>
      )}
      <h1
        className="timer-display"
        style={{
          '--timer-color': isReady ? '#2b8156' : '#2b2b2b',
          '--timer-size': isRunning || isReady ? '6rem' : '4rem'
        }}
      >
        {formatTime(time, !isRunning)}
      </h1>

      {currentAo5 && !isRunning && !isReady && (
        <div className="ao5-display">
          <span>AO5: {formatTime(currentAo5)}</span>
        </div>
      )}
    </div>
  );
}

export default App;
