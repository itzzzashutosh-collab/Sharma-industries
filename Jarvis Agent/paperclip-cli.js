#!/usr/bin/env node
const controller = require('./paperclip-controller');

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command || command === 'help') {
    console.log(`
Paperclip Subordinate Worker CLI (Under Hermes Master Orchestrator)
Usage:
  node paperclip-cli.js delegate --title "Title" --desc "Description" [--role "worker_role"]
  node paperclip-cli.js list [--status queued|in_progress|completed|failed]
  node paperclip-cli.js run <taskId>
  node paperclip-cli.js status <taskId>
`);
    return;
  }

  if (command === 'delegate') {
    let title = 'Delegated Task';
    let description = '';
    let role = 'general_worker';

    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--title' && args[i + 1]) title = args[++i];
      if (args[i] === '--desc' && args[i + 1]) description = args[++i];
      if (args[i] === '--role' && args[i + 1]) role = args[++i];
    }

    const task = await controller.delegateTask({ title, description, workerRole: role });
    console.log(`✅ Delegated Task Created:`);
    console.log(JSON.stringify(task, null, 2));
  } else if (command === 'list') {
    let status = null;
    const sIdx = args.indexOf('--status');
    if (sIdx !== -1 && args[sIdx + 1]) status = args[sIdx + 1];

    const tasks = controller.listTasks(status);
    console.log(`📋 Paperclip Worker Tasks (${tasks.length}):`);
    console.log(JSON.stringify(tasks, null, 2));
  } else if (command === 'status') {
    const taskId = args[1];
    if (!taskId) return console.error('Please specify taskId');
    const task = controller.getTask(taskId);
    if (!task) return console.error(`Task ${taskId} not found`);
    console.log(JSON.stringify(task, null, 2));
  } else if (command === 'run') {
    const taskId = args[1];
    if (!taskId) return console.error('Please specify taskId');
    console.log(`⏳ Running Paperclip worker on task ${taskId}...`);
    const result = await controller.executeTask(taskId);
    console.log(`✅ Execution complete:`);
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
