#!/usr/bin/env node

const fs = require('fs');
const readLine = require('readline');
const { execSync } = require('child_process');

const lc = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
};

String.prototype.color = function (color) {
  return `${color}${this}${lc.Reset}`;
};

function runCommand(command, silent) {
  try {
    execSync(`${command}`, { stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`.color(lc.FgRed), error);
    process.exit(1);
  }
  return true;
}

function deleteFolder(location) {
  try {
    fs.rmSync(location, { recursive: true });
  } catch (error) {
    console.error(`Failed to remove ${location}`.color(lc.FgRed), error);
    return false;
  }
  return true;
}

function writeFile(location, data) {
  try {
    fs.writeFileSync(location, data);
  } catch (error) {
    console.error(`Failed to write ${location}`.color(lc.FgRed), error);
    process.exit(1)
  }
  return true;
}

function makeDir(path) {
  try {
    fs.mkdirSync(path);
  } catch (error) {
    console.error(`Failed make directory: ${path}`.color(lc.FgRed), error);
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

// Reference: https://gist.github.com/thbkrkr/aa16435cb6c183e55a33
function genCertificate(openSSL) {
  if (!makeDir(`${repoLocation}\\cert`)) return false;
  runCommand(
    `${openSSL} req -x509 -newkey rsa:4096 -nodes -out ${repoLocation}\\cert\\ssl.crt -keyout ${repoLocation}\\cert\\ssl.key -days 3650 -subj "/C=NL/O=-/OU=-/CN=-"`,
    true
  );
}

function runIstallation() {
  const githubRepo = `https://github.com/jornejongsma/create-app`;
  const brach = `typescript`
  const gitCheckoutCommand = `git clone --quiet --branch ${brach} --single-branch --depth 1 ${githubRepo} ${repoName}`;
  runCommand(gitCheckoutCommand);

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
  writeFile(packageLocation, newRawPackage);
  
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
  writeFile(workspaceLocation, rawWorkspace);
  
  const openSSL = getOpenSSL();
  openSSL ? genCertificate(openSSL) : console.error('Could not generate SSL Certificates: OpenSSL is not installed'.color(lc.FgRed));

  deleteFolder(binLocation);
  deleteFolder(githubLocation);
  deleteFolder(gitLocation);

  const gitInit = `git init --quiet`;
  const gitDeactivate = `git config core.autocrlf false`;
  const gitAddAll = `git add .`;
  const gitCommit = `git commit --quiet -m "first commit"`;
  const gitBranch = `git branch -M main`;
  const gitActivate = `git config core.autocrlf false`;

  runCommand(`cd ${repoName} && ${gitInit} && ${gitDeactivate} && ${gitAddAll} && ${gitCommit} && ${gitBranch} && ${gitActivate}`);


  console.log('Congratulations, you are ready!'.color(lc.FgGreen));
  console.log('To open this repo in VS-Code, type :', `cd ${repoName} && ${repoName}.code-workspace`.color(lc.FgYellow));
}
