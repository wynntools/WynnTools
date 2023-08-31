const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function getTestFiles(dir) {
  const files = fs.readdirSync(dir);
  const testFiles = [];
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);
    if (fileStat.isDirectory()) {
      testFiles.push(...getTestFiles(filePath));
    } else if (path.extname(file) === '.js' && file !== 'runTests.js') {
      testFiles.push(filePath);
    }
  });
  return testFiles;
}

const jsTestFiles = getTestFiles(__dirname);
const mochaCommand = `npx mocha ${jsTestFiles.join(' ')}`;

try {
  execSync(mochaCommand, { stdio: 'inherit' });
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}
