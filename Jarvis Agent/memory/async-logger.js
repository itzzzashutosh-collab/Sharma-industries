const fs = require('fs');
const path = require('path');

class AsyncLogger {
  constructor() {
    this.logPath = path.join(__dirname, 'execution.md');
    this.buffer = [];
    this.flushIntervalMs = 3000;
    this.isFlushing = false;

    // Start background timer
    this.timer = setInterval(() => this.flush(), this.flushIntervalMs);
    if (this.timer.unref) this.timer.unref(); // Don't prevent clean process exit
  }

  log(entry) {
    try {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const cleanSummary = (entry.reply || '').replace(/[\r\n]+/g, ' ').slice(0, 60) + '...';
      const logLine = `| ${now} | ${entry.sender} | ${entry.channel} | ${entry.agent} (${entry.pathType}, ${entry.durationMs}ms) | ${entry.intent} | ${entry.status || 'Success'} | ${cleanSummary} |\n`;

      this.buffer.push(logLine);

      // Eager flush if buffer exceeds 10 items
      if (this.buffer.length >= 10) {
        this.flush();
      }
    } catch (e) {
      // Non-blocking
    }
  }

  async flush() {
    if (this.isFlushing || this.buffer.length === 0) return;
    this.isFlushing = true;

    const toWrite = this.buffer.join('');
    this.buffer = [];

    try {
      await fs.promises.appendFile(this.logPath, toWrite, 'utf-8');
    } catch (err) {
      console.warn('[AsyncLogger] Error writing to execution.md:', err.message);
    } finally {
      this.isFlushing = false;
    }
  }
}

module.exports = new AsyncLogger();
