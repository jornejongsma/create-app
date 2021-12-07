#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command) {
  try {
    execSync(`${command}`, {stdio: 'inherit'});
  } catch(error) {
    console.error(`Failed to execute ${command}`, error);
    return false;
  }
  return true;
}

function deleteFolder(location) {
  try {
    fs.rmdirSync(location, { recursive: true })
  } catch (error) {
    console.error(`Failed to remove ${location}`)
    return false
  }
  return true
}

const repoName = process.argv[2];

const githubRepo = `https://github.com/jornejongsma/create-app`;
const gitCheckoutCommand = `git clone --depth 1 ${githubRepo} ${repoName}`;
const installDepthCommand = `cd ${repoName} && yarn install`;
const openRepoInVSCodeCommand = `code .\\${repoName}`

console.log(`Cloning the repository with name ${repoName}`);
const checkedOut = runCommand(gitCheckoutCommand);
if(!checkedOut) process.exit(1);

console.log(`Installing dependencies for ${repoName}`);
const installedDeps = runCommand(installDepthCommand);
if(!installedDeps) process.exit(1);

console.log(`Remove up bin and .github from ${repoName}`);
const folder = process.cwd();
const repoLocation = `${folder}\\${repoName}`;
const binLocation = `${repoLocation}\\bin`;
const githubLocation = `${repoLocation}\\.github`;

const deleteBin = deleteFolder(binLocation);
if(!deleteBin) process.exit(1);
const deleteGithub = deleteFolder(githubLocation);
if(!deleteGithub) process.exit(1);


// console.log(`current location is: ${folder}\\${repoName}`)
// fs.readdir(repoLocation, (err, files) => {
//   if(err) {
//     console.log('error', err)
//     return err
//   }
//   files.forEach(file => {
//     console.log(file)
//   })
// })


const openedVSCode = runCommand(openRepoInVSCodeCommand);
if(!openedVSCode) process.exit(1);

console.log("Congratulations, you are ready!");

