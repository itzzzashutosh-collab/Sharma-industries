/**
 * Sharma Industries / Swatch Paints — Paperclip Subordinate Worker Controller
 * 
 * Hierarchy:
 *   1. User / Owner: CEO Ashutosh Sharma (+91 9079609627)
 *   2. Hermes Agent (Chief of Staff & Master Brain)
 *   3. Orchestrator (Execution Leader / Team Lead)
 *   4. Multi-Division Paperclip Worker Hub (8 Divisions & 86 Legends)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const divisionHub = require('./paperclip-division-hub');

const TASKS_FILE = path.join(__dirname, 'data', 'paperclip_tasks.json');

// Ensure tasks storage exists
function loadTasks() {
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveTasks(tasks) {
  const dir = path.dirname(TASKS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

class PaperclipController {
  constructor() {
    this.name = 'PaperclipSubordinatePool';
    this.hub = divisionHub;
  }

  getDivisionHub() {
    return this.hub;
  }

  /**
   * Orchestrator delegates a task to a specific Division or general pool
   */
  async delegateTask({
    title,
    description,
    divisionId = null,
    legendSlug = null,
    workerRole = 'general_worker',
    priority = 'high',
    userContext = null
  }) {
    // If division specified, route into dedicated Division Worker Pool
    if (divisionId) {
      return await this.hub.delegateTaskToDivision({
        divisionId,
        legendSlug,
        title,
        description,
        priority,
        userContext
      });
    }

    // Default global queue fallback
    const tasks = loadTasks();
    const taskId = `PC-${Date.now().toString(36).toUpperCase()}`;

    const newTask = {
      id: taskId,
      title,
      description,
      workerRole,
      priority,
      status: 'queued', // queued | in_progress | completed | failed
      delegatedBy: 'Orchestrator (Execution Leader)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      result: null,
      transcript: []
    };

    tasks.push(newTask);
    saveTasks(tasks);

    console.log(`[Paperclip Worker Pool] Leader delegated general task ${taskId}: "${title}" to role: ${workerRole}`);
    return newTask;
  }

  /**
   * List all tasks assigned to Paperclip workers
   */
  listTasks(status = null) {
    const tasks = loadTasks();
    if (!status) return tasks;
    return tasks.filter(t => t.status === status);
  }

  /**
   * List tasks for a specific division
   */
  listDivisionTasks(divisionId) {
    return this.hub.loadDivisionTasks(divisionId);
  }

  /**
   * Get single task
   */
  getTask(taskId) {
    const tasks = loadTasks();
    return tasks.find(t => t.id === taskId) || null;
  }

  /**
   * Execute task via Paperclip worker bridge
   */
  async executeTask(taskId) {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    task.status = 'in_progress';
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);

    return new Promise((resolve, reject) => {
      const hermesBin = process.env.LOCALAPPDATA 
        ? path.join(process.env.LOCALAPPDATA, 'hermes', 'bin', 'hermes.exe')
        : 'hermes';

      const prompt = `[Paperclip Subordinate Worker: ${task.workerRole}]
You are executing a sub-task delegated by Orchestrator for Sharma Industries.
Task Title: ${task.title}
Instructions: ${task.description}

Complete this task precisely and return your final report.`;

      const escapedPrompt = prompt.replace(/"/g, '\\"');
      const cmd = `"${hermesBin}" --in "${__dirname}" -z "${escapedPrompt}"`;

      exec(cmd, { cwd: __dirname, timeout: 120000 }, (error, stdout, stderr) => {
        const updatedTasks = loadTasks();
        const current = updatedTasks.find(t => t.id === taskId) || task;

        if (error) {
          current.status = 'failed';
          current.result = stderr || error.message;
          current.updatedAt = new Date().toISOString();
          saveTasks(updatedTasks);
          console.error(`[Paperclip Worker Pool] Task ${taskId} failed:`, error.message);
          return resolve(current);
        }

        current.status = 'completed';
        current.result = stdout.trim();
        current.updatedAt = new Date().toISOString();
        saveTasks(updatedTasks);
        console.log(`[Paperclip Worker Pool] Task ${taskId} completed successfully.`);
        resolve(current);
      });
    });
  }
}

module.exports = new PaperclipController();
