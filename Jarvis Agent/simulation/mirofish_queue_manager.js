/**
 * MiroFish Simulation Queue Manager — Sharma Industries Core
 * 
 * Manages queued simulation tasks for MiroFish multi-agent swarm.
 * Enables queuing experimental packages, offers, and training runs to be executed
 * when CEO Ashutosh Sharma (+91 9079609627) initiates the simulation.
 */

const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, 'mirofish_simulation_queue.json');

function getQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    return { queueVersion: '1.0', queueStatus: 'IDLE', totalQueued: 0, jobs: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'));
  } catch (e) {
    return { queueVersion: '1.0', queueStatus: 'ERROR', totalQueued: 0, jobs: [] };
  }
}

function saveQueue(queue) {
  queue.lastUpdated = new Date().toISOString();
  queue.totalQueued = (queue.jobs || []).filter(j => j.status === 'QUEUED_PENDING_CEO_TRIGGER').length;
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
}

function listJobs() {
  const q = getQueue();
  console.log(`\n========================================================================`);
  console.log(`🐟 MIROFISH SIMULATION QUEUE [Status: ${q.queueStatus}]`);
  console.log(`Total Pending Jobs: ${q.totalQueued}`);
  console.log(`========================================================================\n`);

  if (!q.jobs || q.jobs.length === 0) {
    console.log('No jobs currently in queue.');
    return;
  }

  q.jobs.forEach((job, idx) => {
    console.log(`[#${idx + 1}] Job ID: ${job.jobId}`);
    console.log(`    Title: ${job.title}`);
    console.log(`    Legend: ${job.legend} (Synthesized with: ${job.peer})`);
    console.log(`    Status: ${job.status}`);
    console.log(`    Priority: ${job.priority}`);
    console.log(`    Target Trials: ${job.targetTrials} (Threshold: >= ${job.accuracyThreshold}%)`);
    console.log(`    Enqueued By: ${job.enqueuedBy}`);
    console.log(`    Enqueued At: ${job.enqueuedAt}`);
    console.log(`    Directive: ${job.executionDirective || 'Execute upon CEO trigger'}\n`);
  });
}

function enqueueJob(jobConfig) {
  const q = getQueue();
  if (!q.jobs) q.jobs = [];

  const existingIdx = q.jobs.findIndex(j => j.jobId === jobConfig.jobId);
  if (existingIdx >= 0) {
    q.jobs[existingIdx] = { ...q.jobs[existingIdx], ...jobConfig, status: 'QUEUED_PENDING_CEO_TRIGGER' };
  } else {
    q.jobs.push({
      ...jobConfig,
      status: 'QUEUED_PENDING_CEO_TRIGGER',
      enqueuedAt: new Date().toISOString()
    });
  }

  saveQueue(q);
  console.log(`✅ Successfully queued job "${jobConfig.jobId}" into MiroFish Simulation Queue.`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0] || '--list';

  if (cmd === '--list' || cmd === '--status') {
    listJobs();
  } else if (cmd === '--clear') {
    const q = getQueue();
    q.jobs = [];
    saveQueue(q);
    console.log('Queue cleared.');
  } else {
    console.log('Usage: node mirofish_queue_manager.js [--list | --status | --clear]');
  }
}

module.exports = { getQueue, saveQueue, listJobs, enqueueJob };
