const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const removeFields = ['scripts', 'devDependencies']
const alterFields = ['main', 'types', 'files', 'exports', 'typesVersions']
const copyFiles = ['README.md', 'LICENSE'];
const entryPoints = {
    'index.js': 'cogni',
    'async.js': 'asyncCogni',
    'memo.js': 'memo',
}

for (const field of removeFields) {
    delete packageJson[field];
}

for (const field of alterFields) {
    packageJson[field] = alterField(packageJson[field]);
}

fs.writeFileSync(path.join(__dirname, '..', 'dist', 'package.json'), JSON.stringify(packageJson, null, 2));

for (const file of copyFiles) {
    fs.copyFileSync(path.join(__dirname, '..', file), path.join(__dirname, '..', 'dist', file));
}

for (const [entry, name] of Object.entries(entryPoints)) {
    const tpl = `const ${name} = require('./cjs/${entry}');
module.exports = ${name}.default || ${name};
`;
    fs.writeFileSync(path.join(__dirname, '..', 'dist', entry), tpl);

    const types = entry.replace('.js', '.d.ts');
    fs.copyFileSync(path.join(__dirname, '..', 'dist', 'cjs', types), path.join(__dirname, '..', 'dist', types));
}

function alterField(value) {
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            value[i] = alterField(value[i]);
        }
    }
    else if (typeof value === 'object') {
        for (const v in value) {
            value[v] = alterField(value[v]);
        }
    }
    else if (typeof value === 'string') {
        value = value.replace('dist/', '');
    }
    return value;
}
