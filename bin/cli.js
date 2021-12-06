#!/usr/bin/env node

const { execSync } = require('child_process');

function runCommand(command) {
  try {
    execSync(`${command}`, {stdio: 'inherit'});
  } catch(error) {
    console.error(`Failed to execute ${command}`, error);
    return false;
  }
  return true;
}

const repoName = process.argv[2];
const githubRepo = `https://github.com/jornejongsma/create-app`;
const gitCheckoutCommand = `git clone --depth 1 ${githubRepo} ${repoName}`;
const installDepthCommand = `cd ${repoName} && yarn install`;

console.log(`Cloning the repository with name ${repoName}`);
const checkedOut = runCommand(gitCheckoutCommand);
if(!checkedOut) process.exit({code: -1});

console.log(`Installing dependencies for ${repoName}`);
const installedDeps = runCommand(installDepthCommand);
if(!installedDeps) process.exit({code: -1});

console.log("Congratulations! You are ready. Follow the following commands to start");
console.log(`cd ${repoName} && npm start`);