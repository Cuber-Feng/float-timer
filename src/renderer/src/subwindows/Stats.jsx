import '../style/stats.css';
import React, { useState, useEffect, useRef } from 'react';
import { formatTime, calculateAo5, genScramble, formatEventName } from '../tools/helper';

function Stats() {
  const [scoresList, setScoresList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scoreUpdated, setscoreUpdated] = useState(new Date());
  const [curEvent, setcurEvent] = useState(null);

  useEffect(() => {
    // put this in a useEffect is to prevent creating listener every time.
    window.api.onScoreUpdated((data) => {
      console.log('Stats | Received:', data);
      setscoreUpdated(new Date());
    });
    window.api.onEventChanged((data) => {
      console.log('Stats | Event changed:', data.event);
      setcurEvent(data.event);
    });
    window.api.getCurrentEvent().then((event) => {
      setcurEvent(event);
    });
  }, []);

  const fetchScores = async () => {
    if (!curEvent) return;
    console.log('Stats | fetchScores');
    try {
      setLoading(true);
      const data = await window.api.getHighScores(0, curEvent);
      setScoresList(data);
    } catch (err) {
      console.error('Stats | Fail to get the results:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreUpdated, curEvent]); // original [scoreList], it cause infinately fetch

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete score ${id}?`)) return;

    try {
      await window.api.deleteScore(id);
      await fetchScores();
    } catch (err) {
      console.error(`Stats | Fail to delete score ${id}:`, err);
    }
  };

  return (
    <div className="stats-container">
      <h1 className="title">Statistics - {curEvent ? formatEventName(curEvent) : 'Loading...'}</h1>
      <div className="result-table">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Result</th>
              <th>Scramble</th>
              <th>Time Stamp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {scoresList.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: 'center', border: '0px', padding: '12px', color: '#888' }}
                >
                  No score records available
                </td>
              </tr>
            ) : (
              scoresList.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'right' }}>
                    {String(scoresList.length - index).padStart(3, '0')}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    {formatTime(item.duration_ms)}
                  </td>
                  <td>{item.scramble}</td>
                  <td>{item.timestamp}</td>
                  <td>
                    <button type="button" className="no-drag" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Stats;
