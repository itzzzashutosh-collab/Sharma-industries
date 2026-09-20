const fs = require('fs');
const path = require('path');

const marketingTeamDir = path.resolve(__dirname, '..', 'marketing-team');
const hermesSkillsDir = path.resolve(__dirname, '..', '.hermes', 'skills');
const globalSkillsDir = path.resolve('C:', 'Users', 'itzzz', '.hermes', 'skills', 'experts');

const dirs = fs.readdirSync(marketingTeamDir).filter(d => fs.statSync(path.join(marketingTeamDir, d)).isDirectory());

dirs.forEach(agentDir => {
  const yamlPath = path.join(marketingTeamDir, agentDir, 'agent.yaml');
  if (!fs.existsSync(yamlPath)) return;

  const content = fs.readFileSync(yamlPath, 'utf8');
  if (!content.includes('metric:')) return;

  const lines = content.split(/\r?\n/);
  const newLines = [];
  let inMetrics = false;

  for (const line of lines) {
    const m = line.match(/^\s*metric:\s*(.+)$/);
    if (m) {
      if (!inMetrics) {
        newLines.push('  metrics:');
        inMetrics = true;
      }
      newLines.push('    - ' + m[1]);
    } else {
      newLines.push(line);
    }
  }

  const updated = newLines.join('\n');
  fs.writeFileSync(yamlPath, updated, 'utf8');
  console.log('Fixed agent.yaml for:', agentDir);

  const localTarget = path.join(hermesSkillsDir, agentDir, 'agent.yaml');
  const globalTarget = path.join(globalSkillsDir, agentDir, 'agent.yaml');

  if (fs.existsSync(path.dirname(localTarget))) {
    fs.writeFileSync(localTarget, updated, 'utf8');
  }
  if (fs.existsSync(path.dirname(globalTarget))) {
    fs.writeFileSync(globalTarget, updated, 'utf8');
  }
});
console.log('All agent.yaml files successfully updated to valid YAML list format (metrics:).');
