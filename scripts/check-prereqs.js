const { spawnSync } = require('child_process');

const checks = [
  {
    name: 'docker CLI',
    command: 'docker',
    args: ['--version'],
    fix: 'Install Docker Desktop and reopen terminal.'
  },
  {
    name: 'docker daemon',
    command: 'docker',
    args: ['info'],
    fix: 'Start Docker Desktop and wait until it shows "Engine running".'
  }
];

for (const check of checks) {
  const result = spawnSync(check.command, check.args, {
    stdio: 'ignore',
    shell: true
  });

  if (result.status !== 0) {
    console.error(`Missing prerequisite: ${check.name}. ${check.fix}`);
    process.exit(1);
  }
}

console.log('Prerequisite check passed.');
