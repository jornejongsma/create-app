#!/usr/bin/env node

const fs = require('fs');
const readLine = require('readline');
const { execSync } = require('child_process');

function runCommand(command) {
  try {
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    process.exit(1);
  }
  return true;
}

function deleteFolder(location) {
  try {
    fs.rmSync(location, { recursive: true });
  } catch (error) {
    console.error(`Failed to remove ${location}`);
    return false;
  }
  return true;
}

function writeFile(location, data) {
  try {
    fs.writeFileSync(location, data);
  } catch (error) {
    console.error(`Failed to write ${location}`);
    return false;
  }
  return true;
}

const folder = process.cwd();
let repoName = process.argv[2];
let repoLocation = `${folder}\\${repoName}`;

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

if (!repoName) {
  rl.question('Enter a repo-name:', (name) => {
    repoName = name;
    repoLocation = `${folder}\\${repoName}`;
    rl.close();
  });
} else {
  runIstallation();
  process.exit(0);
}

rl.on('close', () => {
  runIstallation();
  process.exit(0);
});

function isOpenSSL() {
  function runTest(command) {
    try {
      execSync(`${command}`, { stdio: 'pipe' });
    } catch (error) {
      return false;
    }
    return true;
  }

  if (runTest(`openssll version`)) {
    return true;
  } else if (runTest(`C:\\"Program Files"\\Git\\usr\\bin\\openssll version`)) {
    return true;
  }
  return false;
}

function genCertificate() {
  const opensslLoc = `C:\\Program Files\\Git\\usr\\bin\\openssl`;

  //Creates passphrase.txt
  runCommand(`${opensslLoc} rand -base64 48 > passphrase.txt`);

  // Creates server.key
  runCommand(`${opensslLoc} genrsa -aes128 -passout file:passphrase.txt -out server.key 2048`);

  // Creates server.csr
  runCommand(
    `${opensslLoc} req -new -passin file:passphrase.txt -key server.key -out server.csr -subj "/C=FR/O=krkr/OU=Domain Control Validated/CN=*.krkr.io"`
  );

  // First duplicate the server.key to server.key.org
  // Than remove passphrase from server.key
  runCommand(`cp server.key server.key.org`);
  runCommand(`${opensslLoc} rsa -in server.key.org -passin file:passphrase.txt -out server.key`);

  // Creates a server.crt
  runCommand(`${opensslLoc} x509 -req -days 36500 -in server.csr -signkey server.key -out server.crt`);

  //Move .crt and .key to ./cert/ssl.*
  runCommand(`mkdir ${repoLocation}\\cert && mv server.crt ${repoLocation}\\cert\\ssl.crt && mv server.key ${repoLocation}\\cert\\ssl.key`);

  // Cleanup
  runCommand(`rm passphrase.txt server.csr server.key.org`);
}

function runIstallation() {
  const githubRepo = `https://github.com/jornejongsma/create-app`;
  const gitCheckoutCommand = `git clone --depth 1 ${githubRepo} ${repoName}`;
  const installDepthCommand = `cd ${repoName} && yarn install --silent`;

  console.log(`Cloning the repository with name ${repoName}`);
  runCommand(gitCheckoutCommand);

  console.log(`Installing dependencies for ${repoName}`);
  runCommand(installDepthCommand);

  const binLocation = `${repoLocation}\\bin`;
  const githubLocation = `${repoLocation}\\.github`;
  const gitLocation = `${repoLocation}\\.git`;
  const packageLocation = `${repoLocation}\\package.json`;
  const rawPackage = fs.readFileSync(packageLocation);
  const packageData = JSON.parse(rawPackage);

  const { bin, publishConfig, ...newPackage } = packageData;
  newPackage['name'] = repoName;
  newPackage['version'] = '0.1.0';
  newPackage['private'] = true;

  const newRawPackage = JSON.stringify(newPackage, null, 2);
  const writePackage = writeFile(packageLocation, newRawPackage);
  if (!writePackage) process.exit(1);

  const workspaceData = {
    folders: [
      {
        path: '.',
      },
    ],
    settings: {},
  };

  const workspaceLocation = `${repoLocation}\\${repoName}.code-workspace`;
  const rawWorkspace = JSON.stringify(workspaceData, null, 2);
  const writeWorkspace = writeFile(workspaceLocation, rawWorkspace);
  if (!writeWorkspace) process.exit(1);

  isOpenSSL() ? genCertificate() : console.error('Could not generate SSL Certificates: OpenSSL is not installed');

  console.log(`Remove up bin and .github from ${repoName}`);
  const deleteBin = deleteFolder(binLocation);
  if (!deleteBin) process.exit(1);
  const deleteGithub = deleteFolder(githubLocation);
  if (!deleteGithub) process.exit(1);
  const deleteGit = deleteFolder(gitLocation);
  if (!deleteGit) process.exit(1);

  const gitInit = `git init`;
  const gitAddAll = `git add .`;
  const gitCommit = `git commit -q -m "first commit"`;
  const gitBranch = `git branch -M main`;
  const startGitCommand = `cd ${repoName} && ${gitInit} && ${gitAddAll} && ${gitCommit} && ${gitBranch}`;
  runCommand(startGitCommand);

  console.log('Congratulations, you are ready!');
}
