import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

let db = null;
let insertStmt = null;
let getHighScoresStmt = null;
let clearStmt = null;
let deleteScoreStmt = null;
let moveScoreIdsStmt = null;
let normalizeScoreIdsStmt = null;

console.log('DB | file path:', path.join(app.getPath('userData'), 'scores.db'));

// 延迟到 whenReady 后调用此初始化函数
export function initDB() {
  if (db) return;

  const dbPath = path.join(app.getPath('userData'), 'scores.db');
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY,
      duration_ms INTEGER,
      scramble TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      event TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_date ON results(timestamp);
  `);

  insertStmt = db.prepare('INSERT INTO results (duration_ms, scramble, event) VALUES (?, ?, ?)');
  getHighScoresStmt = db.prepare(
    'SELECT * FROM results WHERE duration_ms >= ? AND event = ? ORDER BY timestamp DESC'
  );
  clearStmt = db.prepare('DELETE FROM results');
  deleteScoreStmt = db.prepare('DELETE FROM results WHERE id = ?');
  moveScoreIdsStmt = db.prepare('UPDATE results SET id = -id WHERE id > ?');
  normalizeScoreIdsStmt = db.prepare('UPDATE results SET id = -id - 1 WHERE id < 0');
}

export function addScores(records) {
  const runTransaction = db.transaction((items) => {
    for (const r of items) {
      insertStmt.run(r.duration_ms, r.scramble, r.event);
    }
  });
  return runTransaction(records);
}

export function getHighScores(minScore, event) {
  return getHighScoresStmt.all(minScore, event);
}

export function getTotalCount() {
  return db.prepare('SELECT COUNT(*) as count FROM results').get().count;
}

export function clearScores() {
  return clearStmt.run();
}

export function deleteScore(id) {
  const deleteAndShift = db.transaction((scoreId) => {
    const result = deleteScoreStmt.run(scoreId);
    if (result.changes > 0) {
      moveScoreIdsStmt.run(scoreId);
      normalizeScoreIdsStmt.run();
    }
    return result;
  });

  return deleteAndShift(id);
}
