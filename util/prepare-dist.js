const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const removeFields = ['scripts', 'devDependencies']
const alterFields = ['main', 'types', 'files', 'exports', 'typesVersions']
const copyFiles = ['README.md', 'LICENSE'];

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
