const { execSync } = require("child_process");

//Creates passphrase.txt
runCommand(`openssl rand -base64 48 > passphrase.txt`);

// Creates server.key
runCommand(`openssl genrsa -aes128 -passout file:passphrase.txt -out server.key 2048`);

// Creates server.csr
runCommand(`openssl req -new -passin file:passphrase.txt -key server.key -out server.csr -subj "/C=FR/O=krkr/OU=Domain Control Validated/CN=*.krkr.io"`);

// First duplicate the server.key to server.key.org
// Than remove passphrase from server.key
runCommand(`cp server.key server.key.org`);
runCommand(`openssl rsa -in server.key.org -passin file:passphrase.txt -out server.key`);

// Creates a server.crt
runCommand(`openssl x509 -req -days 36500 -in server.csr -signkey server.key -out server.crt`);

//Move .crt and .key to ./cert/ssl.*
runCommand(`mkdir cert && mv server.crt cert/ssl.crt && mv server.key cert/ssl.key`);

// Cleanup
runCommand(`rm passphrase.txt server.csr server.key.org`)

function runCommand(command) {
  try {
    execSync(`${command}`, { stdio: "inherit" });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    process.exit(1);
  }
  return true;
}