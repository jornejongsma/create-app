#!/usr/bin/env node

const fs = require('fs');
const readLine = require('readline');
const { execSync } = require('child_process');

function runCommand(command, silent) {
  try {
    execSync(`${command}`, { stdio: silent ? 'pipe' : 'inherit' });
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

function makeDir(path) {
  try {
    fs.mkdirSync(path);
  } catch (error) {
    console.error(`Failed make directory: ${path}`);
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

function getOpenSSL() {
  function runTest(command) {
    try {
      execSync(`${command}`, { stdio: 'pipe' });
    } catch (error) {
      return false;
    }
    return true;
  }

  if (runTest(`openssl version`)) {
    return 'openssl';
  } else if (runTest(`C:\\"Program Files"\\Git\\usr\\bin\\openssl version`)) {
    return 'C:\\"Program Files"\\Git\\usr\\bin\\openssl';
  }
  return false;
}

// Source: https://gist.github.com/thbkrkr/aa16435cb6c183e55a33
function genCertificate(openSSL) {
  if (!makeDir(`${repoLocation}\\cert`)) return false;
  runCommand(
    `${openSSL} req -x509 -newkey rsa:4096 -nodes -out ${repoLocation}\\cert\\ssl.crt -keyout ${repoLocation}\\cert\\ssl.key -days 3650 -subj "/C=NL/O=-/OU=-/CN=-"`,
    true
  );
}

function runIstallation() {
  // console.log(`Cloning the repository with name ${repoName}`); //niet perse nodig?!
  const githubRepo = `https://github.com/jornejongsma/create-app`;
  const gitCheckoutCommand = `git clone --quiet --depth 1 ${githubRepo} ${repoName}`;
  runCommand(gitCheckoutCommand);

  // console.log(`Installing dependencies for ${repoName}`); //Volgende Fase
  const installDepthCommand = `cd ${repoName} && yarn install --silent`;
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

  const openSSL = getOpenSSL();
  openSSL ? genCertificate(openSSL) : console.error('Could not generate SSL Certificates: OpenSSL is not installed'); //In rood printen?

  // console.log(`Remove up bin and .github from ${repoName}`); //Zou in één log kunnen voor Cleanup?
  const deleteBin = deleteFolder(binLocation);
  if (!deleteBin) process.exit(1); //moet op deze 3 remove statements het script stoppen als het niet lukt?! En het lukt toch altijd wel!?
  const deleteGithub = deleteFolder(githubLocation);
  if (!deleteGithub) process.exit(1);
  const deleteGit = deleteFolder(gitLocation);
  if (!deleteGit) process.exit(1);

  const gitInit = `git init --quiet`;
  const gitDeactivate = `git config core.autocrlf false`;
  const gitAddAll = `git add .`;
  const gitCommit = `git commit --quiet -m "first commit"`;
  const gitBranch = `git branch -M main`;
  const gitActivate = `git config core.autocrlf false`;

  runCommand(`cd ${repoName} && ${gitInit} && ${gitDeactivate} && ${gitAddAll} && ${gitCommit} && ${gitBranch} && ${gitActivate}`);


  console.log('Congratulations, you are ready!'); //Kelurtje groen?!
}
