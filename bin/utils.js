const { execSync } = require('child_process');

export function runCommand(command) {
  try {
    execSync(`${command}`, { stdio: "inherit" });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    process.exit(1);
  }
  return true;
}

module.exports = [
  runCommand
]
