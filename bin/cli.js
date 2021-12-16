#!/usr/bin/env node

const { argv } = process;
const readLine = require("readline");
const { execSync } = require("child_process");
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

function print(string) {
  process.stdout.write(string);
}

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
    print("Too many arguments!\n");
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
    print(`${arg} is not a good repository name!\n`);
    process.exit(1);
  }
  function handleExistingName(arg) {
    print(
      `Project ${lc.Bright}${arg}${lc.Reset} already exist at this location!\n`
    );
    process.exit(1);
  }

  function handleErrorArg(arg) {
    print(`${arg} is not a valid argument!\n`);
    process.exit(1);
  }

  function handleHelp() {
    print(`Usage: npx @[user]/create-app [repo-name] [options]

Repo-name:
This will be used as projectname for the folder, package.json and git.
> Without a repo-name you will be prompted te create one.

Options:
-y   default options
> Without -y you will be prompted to select all options.

Defaults:
- Language: Javascript
- Target: Web
- Testing: disabled
- Documentation: disabled
`);

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

const JAVASCRIPT = "Javascript";
const TYPESCRIPT = "Typescript";
const WEB = "Web";
const SERVER = "Server";
const ELECTRON = "Electron";
const YES = "Yes";
const NO = "No";

const settings = {
  repoName: input.repoName,
  language: JAVASCRIPT,
  target: WEB,
  testing: NO,
  documentation: NO,
  repoLocation: input.repoLocation,
};

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

if (!input.isDefault) {
  startQuestions();
} else {
  if (!settings.repoName) {
    print(
      `${lc.Bright}Specify a project name to start the a project with default settings.${lc.Reset}\n`
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
  print(
    `${lc.Bright}Answer the folowing question to initialize a project.${lc.Reset}\n`
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
    print("Quit...\n");
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
      print(
        `${lc.Bright}-${lc.Reset} Project name: ${lc.Bright}${settings.repoName}${lc.Reset}\n`
      );
      if (input.isDefault) {
        runInstall();
      } else {
        questionLanguage();
      }
    } else {
      print(
        `${lc.FgRed}${lc.Bright}${name}${lc.Reset}${lc.FgRed} already exist at this location!${lc.Reset}\n`
      );
      rl.question(`Project name? :`, (name) => validate1(name, true));
    }
  } else {
    if (!inputName) {
      print(
        `Enter a name or press CTRL-c (or type ${lc.Underscore}Q${lc.Reset}uit or ${lc.Underscore}C${lc.Reset}ancel) to cancel.\n`
      );
    } else {
      print(
        `${lc.FgRed}${lc.Bright}${name}${lc.Reset}${lc.FgRed} was not a valid projectname! Special charcters not allowed.${lc.Reset}\n`
      );
    }
    rl.question(`Project name? :`, (name) => validate1(name, true));
  }
}

function questionLanguage() {
  const question = {
    Javascript: `Language? (${lc.Bright}${lc.Underscore}J${lc.Reset}${lc.Bright}avascript${lc.Reset}|${lc.Underscore}T${lc.Reset}ypescript) ? `,
    Typescript: `Language? (${lc.Underscore}J${lc.Reset}avascript|${lc.Bright}${lc.Underscore}T${lc.Reset}${lc.Bright}ypescript${lc.Reset}) ? `,
  }[settings.language];
  rl.question(question, (answer) => validateLanguage(answer));
}

function validateLanguage(answer, wasWrong) {
  checkQuit(answer);
  const isJavascript =
    (settings.language === JAVASCRIPT && answer === "") ||
    /^(j|javascript)$/.test(answer.toLowerCase());
  const isTypescript =
    (settings.language === TYPESCRIPT && answer === "") ||
    /^(t|typescript)$/.test(answer.toLowerCase());

  removeLine();
  wasWrong && removeLine();
  if (isJavascript) {
    settings.language = JAVASCRIPT;
    print(
      `${lc.Bright}-${lc.Reset} Language: ${lc.Bright}Javascript${lc.Reset}\n`
    );
    question2();
  } else if (isTypescript) {
    settings.language = TYPESCRIPT;
    print(
      `${lc.Bright}-${lc.Reset} Language: ${lc.Bright}Typescript${lc.Reset}\n`
    );
    question2();
  } else {
    print(
      `${lc.FgRed}Language? (${lc.Bright}${lc.Underscore}J${lc.Reset}${lc.FgRed}${lc.Bright}avascript${lc.Reset}${lc.FgRed}|${lc.Underscore}T${lc.Reset}${lc.FgRed}ypescript): ${lc.Linetrough}${answer}${lc.Reset}\n`
    );
    rl.question(
      `Please type ${lc.Bright}${lc.Underscore}J${lc.Reset}${lc.Bright}avascript${lc.Reset} or ${lc.Underscore}T${lc.Reset}ypescript, or accept the default: `,
      (answer) => validateLanguage(answer, true)
    );
  }
}

function question2() {
  const question = {
    Web: `Target? (${lc.Bright}${lc.Underscore}W${lc.Reset}${lc.Bright}eb${lc.Reset}|${lc.Underscore}S${lc.Reset}erver|${lc.Underscore}E${lc.Reset}lectron) ? :`,
    Server: `Target? (${lc.Underscore}W${lc.Reset}eb|${lc.Bright}${lc.Underscore}S${lc.Reset}${lc.Bright}erver${lc.Reset}|${lc.Underscore}E${lc.Reset}lectron) ? :`,
    Electron: `Target? (${lc.Underscore}W${lc.Reset}eb|${lc.Underscore}S${lc.Reset}erver|${lc.Bright}${lc.Underscore}E${lc.Reset}${lc.Bright}lectron${lc.Reset}) ? :`,
  }[settings.target];
  rl.question(question, (answer) => validate2(answer));
}

function validate2(answer, wasWrong) {
  checkQuit(answer);
  removeLine();
  wasWrong && removeLine();
  const isWeb =
    (answer === "" && settings.target === WEB) ||
    /^(w|web)$/.test(answer.toLowerCase());
  const isServer =
    (answer === "" && settings.target === SERVER) ||
    /^(s|server)$/.test(answer.toLowerCase());
  const isElectron =
    (answer === "" && settings.target === ELECTRON) ||
    /^(e|electron)$/.test(answer.toLowerCase());
  if (isWeb) {
    settings.target = WEB;
    print(`${lc.Bright}-${lc.Reset} Target: ${lc.Bright}Web${lc.Reset}\n`);
    question3();
  } else if (isServer) {
    settings.target = SERVER;
    print(
      `${lc.Bright}-${lc.Reset} Target: ${lc.Bright}Server${lc.Reset}\n`
    );
    question3();
  } else if (isElectron) {
    settings.target = ELECTRON;
    print(
      `${lc.Bright}-${lc.Reset} Target: ${lc.Bright}Electron${lc.Reset}\n`
    );
    question3();
  } else {
    print(
      `${lc.FgRed}Target? (${lc.Bright}${lc.Underscore}W${lc.Reset}${lc.FgRed}${lc.Bright}eb${lc.Reset}${lc.FgRed}|${lc.Underscore}S${lc.Reset}${lc.FgRed}erver|${lc.Underscore}E${lc.Reset}${lc.FgRed}lectron) ? ${lc.Linetrough}${answer}${lc.Reset}\n`
    );
    rl.question(
      `Please type ${lc.Bright}${lc.Underscore}W${lc.Reset}${lc.Bright}eb${lc.Reset} or ${lc.Underscore}S${lc.Reset}erver or ${lc.Underscore}E${lc.Reset}lectron, or accept the default: `,
      (answer) => validate2(answer, true)
    );
  }
}

function question3() {
  const question = {
    No: `Testing? (${lc.Underscore}Y${lc.Reset}es|${lc.Underscore}${lc.Bright}N${lc.Reset}${lc.Bright}o${lc.Reset}): `,
    Yes: `Testing? (${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.Bright}es${lc.Reset}|${lc.Underscore}N${lc.Reset}o): `,
  }[settings.testing];
  rl.question(question, (answer) => validate3(answer));
}

function validate3(answer, wasWrong) {
  checkQuit(answer);
  const isYes =
    (answer === "" && settings.testing === YES) ||
    /^(y|yes)$/.test(answer.toLowerCase());
  const isNo =
    (answer === "" && settings.testing === NO) ||
    /^(n|no)$/.test(answer.toLowerCase());
  removeLine();
  wasWrong && removeLine();
  if (isYes) {
    settings.testing = YES;
    print(
      `${lc.Bright}-${lc.Reset} Testing: ${lc.Bright}${lc.FgGreen}enabled${lc.Reset}\n`
    );
    question4();
  } else if (isNo) {
    settings.testing = NO;
    print(
      `${lc.Bright}-${lc.Reset} Testing: ${lc.FgRed}${lc.Bright}disabled${lc.Reset}\n`
    );
    question4();
  } else {
    print(
      `${lc.FgRed}Testing? (${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.FgRed}${lc.Bright}es${lc.Reset}${lc.FgRed}|${lc.Underscore}N${lc.Reset}${lc.FgRed}o): ${lc.Linetrough}${answer}${lc.Reset}\n`
    );
    rl.question(
      `Please type ${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.Bright}es${lc.Reset} or ${lc.Underscore}N${lc.Reset}o, or accept the default: `,
      (answer) => validate3(answer, true)
    );
  }
}

function question4() {
  const question = {
    No: `Documents? (${lc.Underscore}Y${lc.Reset}es|${lc.Bright}${lc.Underscore}N${lc.Reset}${lc.Bright}o${lc.Reset}): `,
    Yes: `Documents? (${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.Bright}es${lc.Reset}|${lc.Underscore}N${lc.Reset}o): `,
  }[settings.documentation];
  rl.question(question, (answer) => validate4(answer));
}

function validate4(answer, wasWrong) {
  checkQuit(answer);
  const isYes =
    (settings.documentation === YES && answer === "") ||
    /^(y|yes)$/.test(answer.toLowerCase());
  const isNo =
    (settings.documentation === NO && answer === "") ||
    /^(n|no)$/.test(answer.toLowerCase());
  removeLine();
  wasWrong && removeLine();
  if (isYes) {
    settings.documentation = YES;
    print(
      `${lc.Bright}-${lc.Reset} Documents: ${lc.Bright}${lc.FgGreen}enabled${lc.Reset}\n`
    );
    question5();
  } else if (isNo) {
    settings.documentation = NO;
    print(
      `${lc.Bright}-${lc.Reset} Documents: ${lc.FgRed}${lc.Bright}disabled${lc.Reset}\n`
    );
    question5();
  } else {
    print(
      `${lc.FgRed}Documents? (${lc.Bright}${lc.Underscore}Y${lc.Reset}${lc.FgRed}${lc.Bright}es${lc.Reset}${lc.FgRed}|${lc.Underscore}N${lc.Reset}${lc.FgRed}o): ${lc.Linetrough}${answer}${lc.Reset}\n`
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
    print(
      `${lc.Bright}Are these settings OK? (${lc.Underscore}Y${lc.Reset}${lc.Bright}es|${lc.Underscore}N${lc.Reset}${lc.Bright}o):${lc.Reset}\n`
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
  print(
    `Adjust settings, or press CTRL+C (or type ${lc.Underscore}Q${lc.Reset}uit or ${lc.Underscore}C${lc.Reset}ancel) to cancel\n`
  );
}

rl.on("SIGINT", () => {
  print("\nQuit!\n");
  process.exit(0);
});

rl.on("close", () => {
  runInstall();
});

function runInstall() {
  if (input.isDefault) {
    print("Starting the installation with default settings\n");
  } else {
    print("Starting the installation!\n");
  }
  runIstallation();
  // console.log(settings);
  // process.exit(1);
}

// THE PROGRAM!!!

String.prototype.color = function (color) {
  return `${color}${this}${lc.Reset}`;
};

function runCommand(command, silent) {
  try {
    execSync(`${command}`, { stdio: silent ? "pipe" : "inherit" });
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
    process.exit(1);
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
      execSync(`${command}`, { stdio: "pipe" });
    } catch (error) {
      return false;
    }
    return true;
  }

  if (runTest(`openssl version`)) {
    return "openssl";
  } else if (runTest(`C:\\"Program Files"\\Git\\usr\\bin\\openssl version`)) {
    return 'C:\\"Program Files"\\Git\\usr\\bin\\openssl';
  }
  return false;
}

// Reference: https://gist.github.com/thbkrkr/aa16435cb6c183e55a33
function genCertificate(openSSL) {
  const { repoLocation } = settings;
  if (!makeDir(`${repoLocation}\\cert`)) return false;
  runCommand(
    `${openSSL} req -x509 -newkey rsa:4096 -nodes -out ${repoLocation}\\cert\\ssl.crt -keyout ${repoLocation}\\cert\\ssl.key -days 3650 -subj "/C=NL/O=-/OU=-/CN=-"`,
    true
  );
}

function runIstallation() {
  const { repoName, language, /* target, testing, documentation, */ repoLocation } =
    settings;
  const githubRepo = `https://github.com/jornejongsma/create-app`;

  const brach = {
    Javascript: "main",
    Typescript: "typescript",
  }[language];

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
  newPackage["name"] = repoName;
  newPackage["version"] = "0.1.0";
  newPackage["private"] = true;

  const newRawPackage = JSON.stringify(newPackage, null, 2);
  writeFile(packageLocation, newRawPackage);

  const workspaceData = {
    folders: [
      {
        path: ".",
      },
    ],
    settings: {},
  };

  const workspaceLocation = `${repoLocation}\\${repoName}.code-workspace`;
  const rawWorkspace = JSON.stringify(workspaceData, null, 2);
  writeFile(workspaceLocation, rawWorkspace);

  const openSSL = getOpenSSL();
  openSSL
    ? genCertificate(openSSL)
    : console.error(
        "Could not generate SSL Certificates: OpenSSL is not installed".color(
          lc.FgRed
        )
      );

  deleteFolder(binLocation);
  deleteFolder(githubLocation);
  deleteFolder(gitLocation);

  const gitInit = `git init --quiet`;
  const gitDeactivate = `git config core.autocrlf false`;
  const gitAddAll = `git add .`;
  const gitCommit = `git commit --quiet -m "first commit"`;
  const gitBranch = `git branch -M main`;
  const gitActivate = `git config core.autocrlf false`;

  runCommand(
    `cd ${repoName} && ${gitInit} && ${gitDeactivate} && ${gitAddAll} && ${gitCommit} && ${gitBranch} && ${gitActivate}`
  );

  print("Congratulations, you are ready!\n".color(lc.FgGreen));
  print(`To open this repo in VS-Code, type: cd ${repoName} && ${repoName}.code-workspace\n`.color(lc.FgYellow));
  process.exit(0);
}
