const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const srcPath = path.join(__dirname, '..', 'src');

const version = packageJson.version;
const filesToUpdate = [
  path.join(srcPath, 'index.ts'),
  path.join(srcPath, 'async.ts'),
  path.join(srcPath, 'memo.ts'),
];

filesToUpdate.forEach(file => {
  const data = fs.readFileSync(file, 'utf8');
  const versionTag = '@version';
  const updatedData = data.replace(new RegExp(`${versionTag}.*`, 'g'), `${versionTag} ${version}`);
  fs.writeFileSync(file, updatedData);
});
