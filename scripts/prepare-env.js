const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const pairs = [
  {
    source: path.join(projectRoot, 'backend', '.env.example'),
    target: path.join(projectRoot, 'backend', '.env')
  },
  {
    source: path.join(projectRoot, 'frontend', '.env.example'),
    target: path.join(projectRoot, 'frontend', '.env')
  }
];

for (const { source, target } of pairs) {
  if (!fs.existsSync(target)) {
    fs.copyFileSync(source, target);
    console.log(`Created ${target}`);
  }
}
