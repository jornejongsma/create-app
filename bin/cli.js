#!/usr/bin/env node

const { execSync, exec } = require('child_process');
const fs = require('fs');

function runCommand(command) {
  try {
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    return false;
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

const repoName = process.argv[2];

const githubRepo = `https://github.com/jornejongsma/create-app`;
const gitCheckoutCommand = `git clone --depth 1 ${githubRepo} ${repoName}`;
const installDepthCommand = `cd ${repoName} && yarn install`;

console.log(`Cloning the repository with name ${repoName}`);
const checkedOut = runCommand(gitCheckoutCommand);
if (!checkedOut) process.exit(1);

console.log(`Installing dependencies for ${repoName}`);
const installedDeps = runCommand(installDepthCommand);
if (!installedDeps) process.exit(1);

console.log(`Remove up bin and .github from ${repoName}`);
const folder = process.cwd();
const repoLocation = `${folder}\\${repoName}`;
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

const workspaceLocation  = `${repoLocation}\\${repoName}.code-workspace`
const rawWorkspace = JSON.stringify(workspaceData, null, 2);
const writeWorkspace = writeFile(workspaceLocation, rawWorkspace)
if (!writeWorkspace) process.exit(1);

const deleteBin = deleteFolder(binLocation);
if (!deleteBin) process.exit(1);
const deleteGithub = deleteFolder(githubLocation);
if (!deleteGithub) process.exit(1);
const deleteGit = deleteFolder(gitLocation);
if (!deleteGit) process.exit(1);

const gitInit = `git init`;
const gitAddAll = `git add .`;
const gitCommit = `git commit -m "first commit"`;
const gitBranch = `git branch -M main`;
const startGitCommand = `cd ${repoName} && ${gitInit} && ${gitAddAll} && ${gitCommit} && ${gitBranch}`;
const startGit = runCommand(startGitCommand);
if (!startGit) process.exit(1);


const openWorkspaceCommand = `${workspaceLocation}`;
// const openedWorkspace = runCommand(openWorkspaceCommand);
// if (!openedWorkspace) process.exit(1);
exec(openWorkspaceCommand, (error, stdout, stderr) => {
  if (error) {
      console.log(`error: ${error.message}`);
      process.exit(1)
      return;
  }
  if (stderr) {
      console.log(`stderr: ${stderr}`);
      process.exit(1)
      return;
  }
  console.log(`stdout: ${stdout}`);
  console.log('Congratulations, you are ready!');
  // process.exit(0)
})

