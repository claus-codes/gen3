const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const version = packageJson.version;

const srcPath = path.join(__dirname, '..', 'src');

const sourceToUpdate = [
  path.join(srcPath, 'index.ts'),
  path.join(srcPath, 'async.ts'),
  path.join(srcPath, 'memo.ts'),
];

const readmePath = path.join(__dirname, '..');

const readmeToUpdate = [
  path.join(readmePath, 'README.md'),
  path.join(readmePath, 'API-reference.md'),
];

sourceToUpdate.forEach(file => process(file, '@version'));
readmeToUpdate.forEach(file => process(file, '- \\*\\*Version:\\*\\*', '- **Version:**'));

function process(file, versionTag, replaceTag = versionTag) {
  const data = fs.readFileSync(file, 'utf8');
  const updatedData = data.replace(new RegExp(`${versionTag}.*`, 'g'), `${replaceTag} ${version}`);
  fs.writeFileSync(file, updatedData);
}
