#!/usr/bin/env node

const { argv } = process;
const readLine = require("readline");
const { execSync } = require('child_process');
const fs = require("fs");
const folder = process.cwd();

const lc = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Italics: "\x1b[3m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",
  Linetrough: "\x1b[9m",

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

/* 
  Eerst verzamel input van CLI
  - Als er verkeerde of te veel input wordt gegeven, dan abort de app
  - Als er -h of --help wordt ingevoerd dan krijg je de help te zien.
  - Als je niets invoerd dan moet je daarnaa nog alle vragen beantwoorden
  - Als je -y invoert dan worden alle default instellingen gepakt.
\ - Je kan ook niets invoeren, dan word er hierna naar instellingen gevraagd.
*/
function validateRepoName(name) {
  if (!name) return false;
  const nameRegx = /^\w/;
  const prohibitedRegx = /~|!|@|#|\$|%|\^|\*|\+|=|\[|\]|\{|\}|:|,|\.|\?|\//;
  const isRepoName = nameRegx.test(name);
  const hasProhibitedChars = prohibitedRegx.test(name);
  return isRepoName && !hasProhibitedChars ? true : false;
}

function isExistingFolderName(nameToCheck, location) {
  const documents = fs.readdirSync(location, { withFileTypes: true });
  const isExisting = documents
    .filter((item) => item.isDirectory())
    .map(({ name }) => name)
    .includes(nameToCheck);
  return isExisting;
}

const input = (() => {
  const args = argv.slice(2);
  const hasNoCLIInput = args.length === 0;
  const hasTooMuchArguments = args.length > 2;
  if (hasNoCLIInput) {
    return {
      isDefault: false,
      repoName: undefined,
    };
  }
  if (hasTooMuchArguments) {
    console.log("Too many arguments!");
    process.exit(1);
  }

  const cliInput = args
    .map((arg) => {
      const flagRegX = /^--\w/;
      const aliasRegX = /^-\w/;
      const nameRegx = /^\w/;
      const prohibitedRegx =
        /~|!|@|#|\$|%|\^|\*|\+|=|\[|\]|\{|\}|:|,|\.|\?|\//;

      const isFlag = flagRegX.test(arg);
      const isAlias = aliasRegX.test(arg);
      const isRepoName = nameRegx.test(arg);
      const hasProhibitedChars = prohibitedRegx.test(arg);

      if (isFlag) return { type: "flag", arg };
      else if (isAlias) return { type: "alias", arg };
      else if (isRepoName) {
        if (hasProhibitedChars) {
          handleErrorName(arg);
        }
        if (isExistingFolderName(arg, folder)) {
          handleExistingName(arg);
        }
        return { type: "repoName", arg };
      } else handleErrorArg(arg);
    })
    .map((input) => {
      const { type, arg } = input;
      switch (type) {
        case "flag":
          if (arg === "--help") {
            return { type: "HELP" };
          }
          handleErrorArg(arg);
          break;
        case "alias":
          if (arg === "-h") {
            return { type: "HELP" };
          }
          if (arg === "-y") {
            return { type: "USE-DEFAULTS" };
          }
          handleErrorArg(arg);
          break;
        case "repoName":
          return input;
      }
    });

  const isHelp = !!cliInput.find((input) => input?.type === "HELP");
  isHelp && handleHelp();

  function handleErrorName(arg) {
    console.log(`${arg} is not a good repository name!`);
    process.exit(1);
  }
  function handleExistingName(arg) {
    console.log(
      `Project ${lc.Bright}${arg}${lc.Reset} already exist at this location!`
    );
    process.exit(1);
  }

  function handleErrorArg(arg) {
    console.log(`${arg} is not a valid argument!`);
    process.exit(1);
  }

  function handleHelp() {
    console.log("This is the help...");
    process.exit(0);
  }

  const isDefault = !!cliInput.find((input) => input?.type === "USE-DEFAULTS");
  const repoName = cliInput.find((input) => input?.type === "repoName")?.arg;
  const repoLocation = `${folder}\\${repoName}`;

  return {
    isDefault,
    repoName,
    repoLocation,
  };
})();

const settings = {
  repoName: input.repoName,
  langauge: "Javascript",
  target: "Web",
  testing: "No",
  documentation: "No",
  repoLocation: undefined
};

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

if (!input.isDefault) {
  startQuestions();
} else {
  if (!settings.repoName) {
    console.log(
      `${lc.Bright}Specify a project name to start the a project with default settings.${lc.Reset}`
    );
    question1();
  } else {
    runInstall();
  }
}

function removeLine() {
  readLine.moveCursor(process.stdout, 0, -1);
  readLine.clearLine(process.stdout, 1);
}

function startQuestions() {
  console.log(
    `${lc.Bright}Answer the folowing question to initialize a project.${lc.Reset}`
  );
  question1();
}

function question1() {
  const repoName = settings?.repoName
    ? `(${lc.Bright}${settings.repoName}${lc.Reset})`
    : "";
  rl.question(`Project name? ${repoName}: `, (name) => {
    validate1(name);
  });
}

function checkQuit(input) {
  const quit = /^(q|quit|c|cancel)$/;
  if (quit.test(input)) {
    console.log("Quit...");
    process.exit(0);
  }
}

function validate1(name, wasWrong) {
  checkQuit(name);
  removeLine();
  wasWrong && removeLine();
  let inputName;
  if (name === "") {
    inputName = settings.repoName;
  } else {
    inputName = name;
  }
  if (validateRepoName(inputName)) {
    if (!isExistingFolderName(inputName, folder)) {
      settings.repoName = inputName;
      settings.repoLocation = `${folder}\\${inputName}`;
      console.log(
        `${lc.Bright}-${lc.Reset} Project name: ${lc.Bright}${settings.repoName}${lc.Reset}`
      );
      if (input.isDefault) {
        runInstall();
      } else {
        questionLanguage();
      }
    } else {
      console.log(
        `${lc.FgRed}${lc.Bright}${name}${lc.Reset}${lc.FgRed} already exist at this location!${lc.Reset}`
      );
      rl.question(`Project name? :`, (name) => validate1(name, true));
    }
  } else {
    if (!inputName) {
      console.log(
        `Enter a name or press CTRL-c (or type ${lc.Underscore}Q${lc.Reset}uit or ${lc.Underscore}C${lc.Reset}ancel) to cancel.`
      );
    } else {
      console.log(
        `${lc.FgRed}${lc.Bright}${name}${lc.Reset}${lc.FgRed} was not a valid projectname! Special charcters not allowed.${lc.Reset}`
      );
    }
    rl.question(`Project name? :`, (name) => validate1(name, true));
  }
}

function questionLanguage() {
  const question = {
    Javascript: `Language? (${lc.Bright}${lc.Underscore}J${lc.Reset}${lc.Bright}avascript${lc.Reset}|${lc.Underscore}T${lc.Reset}ypescript) ? `,
    Typescript: `Language? (${lc.Underscore}J${lc.Reset}avascript|${lc.Bright}${lc.Underscore}T${lc.Reset}${lc.Bright}ypescript${lc.Reset}) ? `,
  }[settings.langauge];
  rl.question(question, (answer) => validateLanguage(answer));
}

function validateLanguage(answer, wasWrong) {
  checkQuit(answer);
  const isDefaultJavascript = settings.langauge === "Javascript";
  const isDefaultTypescript = settings.langauge === "Typescript";
  const isJavascript =
    (isDefaultJavascript && answer === "") ||
    /^(j|javascript)$/.test(answer.toLowerCase());
  const isTypescript =
    (isDefaultTypescript && answer === "") ||
    /^(t|typescript)$/.test(answer.toLowerCase());
  removeLine();
  wasWrong && removeLine();
  if (isJavascript) {
    console.log(
      `${lc.Bright}-${lc.Reset} Language: ${lc.Bright}Javascript${lc.Reset}`
    );
    question2();
  } else if (isTypescript) {
    console.log(
      `${lc.Bright}-${lc.Reset} Language: ${lc.Bright}Typescript${lc.Reset}`
    );
    question2();
  } else {
    console.log(
      `${lc.FgRed}Language? (${lc.Bright}${lc.Underscore}J${lc.Reset}${lc.FgRed}${lc.Bright}avascript${lc.Reset}${lc.FgRed}|${lc.Underscore}T${lc.Reset}${lc.FgRed}ypescript): ${lc.Linetrough}${answer}${lc.Reset}`
    );
    rl.question(
      `Please type ${lc.Bright}${lc.Underscore}J${lc.Reset}${lc.Bright}avascript${lc.Reset} or ${lc.Underscore}T${lc.Reset}ypescript, or accept the default: `,
      (answer) => validateLanguage(answer, true)
    );
  }
}

function question2() {
  rl.question(
    `Target? (${lc.Bright}${lc.Underscore}W${lc.Reset}${lc.Bright}eb${lc.Reset}|${lc.Underscore}S${lc.Reset}erver|${lc.Underscore}E${lc.Reset}lectron) ? `,
    (answer) => {
      validate2(answer);
    }
  );
}

function validate2(answer, wasWrong) {
  checkQuit(answer);
  removeLine();
  wasWrong && removeLine();
  const isWeb = answer === "" || /^(w|web)$/.test(answer.toLowerCase());
  const isServer = /^(s|server)$/.test(answer.toLowerCase());
  const isElectron = /^(e|electron)$/.test(answer.toLowerCase());
  if (isWeb) {
    console.log(`${lc.Bright}-${lc.Reset} Target: ${lc.Bright}Web${lc.Reset}`);
    question3();
  } else if (isServer) {
    console.log(
      `${lc.Bright}-${lc.Reset} Target: ${lc.Bright}Server${lc.Reset}`
    );
    question3();
  } else if (isElectron) {
    console.log(
      `${lc.Bright}-${lc.Reset} Target: ${lc.Bright}Electron${lc.Reset}`
    );
    question3();
  } else {
    console.log(
      `${lc.FgRed}Target? (${lc.Bright}${lc.Underscore}W${lc.Reset}${lc.FgRed}${lc.Bright}eb${lc.Reset}${lc.FgRed}|${lc.Underscore}S${lc.Reset}${lc.FgRed}erver|${lc.Underscore}E${lc.Reset}${lc.FgRed}lectron) ? ${lc.Linetrough}${answer}${lc.Reset}`
    );
    rl.question(
      `Please type ${lc.Bright}${lc.Underscore}W${lc.Reset}${lc.Bright}eb${lc.Reset} or ${lc.Underscore}S${lc.Reset}erver or ${lc.Underscore}E${lc.Reset}lectron, or accept the default: `,
      (answer) => validate2(answer, true)
    );
  }
}

function question3() {
  rl.question(
    `Testing? (${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.Bright}es${lc.Reset}|${lc.Underscore}N${lc.Reset}o): `,
    (answer) => {
      validate3(answer);
    }
  );
}

function validate3(answer, wasWrong) {
  checkQuit(answer);
  const isYes = /^(y|yes)$/.test(answer.toLowerCase());
  const isNo = answer === "" || /^(n|no)$/.test(answer.toLowerCase());
  removeLine();
  wasWrong && removeLine();
  if (isYes) {
    console.log(
      `${lc.Bright}-${lc.Reset} Testing: ${lc.Bright}${lc.FgGreen}enabled${lc.Reset}`
    );
    question4();
  } else if (isNo) {
    console.log(
      `${lc.Bright}-${lc.Reset} Testing: ${lc.FgRed}${lc.Bright}disabled${lc.Reset}`
    );
    question4();
  } else {
    console.log(
      `${lc.FgRed}Testing? (${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.FgRed}${lc.Bright}es${lc.Reset}${lc.FgRed}|${lc.Underscore}N${lc.Reset}${lc.FgRed}o): ${lc.Linetrough}${answer}${lc.Reset}`
    );
    rl.question(
      `Please type ${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.Bright}es${lc.Reset} or ${lc.Underscore}N${lc.Reset}o, or accept the default: `,
      (answer) => validate3(answer, true)
    );
  }
}

function question4() {
  rl.question(
    `Documents? (${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.Bright}es${lc.Reset}|${lc.Underscore}N${lc.Reset}o): `,
    (answer) => {
      validate4(answer);
    }
  );
}

function validate4(answer, wasWrong) {
  checkQuit(answer);
  const isYes = /^(y|yes)$/.test(answer.toLowerCase());
  const isNo = answer === "" || /^(n|no)$/.test(answer.toLowerCase());
  removeLine();
  wasWrong && removeLine();
  if (isYes) {
    console.log(
      `${lc.Bright}-${lc.Reset} Documents: ${lc.Bright}${lc.FgGreen}enabled${lc.Reset}`
    );
    question5();
  } else if (isNo) {
    console.log(
      `${lc.Bright}-${lc.Reset} Documents: ${lc.FgRed}${lc.Bright}disabled${lc.Reset}`
    );
    question5();
  } else {
    console.log(
      `${lc.FgRed}Documents? (${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.FgRed}${lc.Bright}es${lc.Reset}${lc.FgRed}|${lc.Underscore}N${lc.Reset}${lc.FgRed}o): ${lc.Linetrough}${answer}${lc.Reset}`
    );
    rl.question(
      `Please type ${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.Bright}es${lc.Reset} or ${lc.Underscore}N${lc.Reset}o, or accept the default: `,
      (answer) => validate4(answer, true)
    );
  }
}

function question5() {
  rl.question(
    `Are these settings OK? (${lc.Underscore}Y${lc.Reset}es|${lc.Underscore}N${lc.Reset}o): `,
    (answer) => {
      answer5(answer);
    }
  );
}

function answer5(answer, wasWrong) {
  checkQuit(answer);
  wasWrong && removeLine();
  const isYes = /^(y|yes)$/.test(answer.toLowerCase());
  const isNo = /^(n|no)$/.test(answer.toLowerCase());
  if (isYes) {
    removeLine();
    rl.close();
  } else if (isNo) {
    reset();
    question1();
  } else {
    removeLine();
    console.log(
      `${lc.Bright}Are these settings OK? (${lc.Underscore}Y${lc.Reset}${lc.Bright}es|${lc.Underscore}N${lc.Reset}${lc.Bright}o):${lc.Reset}`
    );
    rl.question(
      `Please type ${lc.Underscore}Y${lc.Reset}es${lc.Reset} or ${lc.Underscore}N${lc.Reset}o: `,
      (answer) => {
        answer5(answer, true);
      }
    );
  }
}

function reset() {
  removeLine();
  removeLine();
  removeLine();
  removeLine();
  removeLine();
  removeLine();
  console.log(
    `Adjust settings, or press CTRL+C (or type ${lc.Underscore}Q${lc.Reset}uit or ${lc.Underscore}C${lc.Reset}ancel) to cancel`
  );
}

rl.on("SIGINT", () => {
  console.log("\nClose!");
  process.exit(0);
});

rl.on("close", () => {
  runInstall();
});

function runInstall() {
  if (input.isDefault) {
    console.log("Starting the installation with default settings");
  } else {
    console.log("Starting the installation!");
  }
  runIstallation()
  // console.log(settings)
  // process.exit(1);
}

// THE PROGRAM!!!

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
  const {repoLocation}= settings
  if (!makeDir(`${repoLocation}\\cert`)) return false;
  runCommand(
    `${openSSL} req -x509 -newkey rsa:4096 -nodes -out ${repoLocation}\\cert\\ssl.crt -keyout ${repoLocation}\\cert\\ssl.key -days 3650 -subj "/C=NL/O=-/OU=-/CN=-"`,
    true
  );
}

function runIstallation() {
  const {repoName, /* langauge, target, testing, documentation, */ repoLocation} = settings
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
  process.exit(0);
}