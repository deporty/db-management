const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const PARAMS = process.argv.slice(2);
const DATA_PATH = "./storage";
const CONFIGURATION = require("./configuration.json");

if (
  PARAMS.length < 2 ||
  CONFIGURATION["environments-list"].indexOf(PARAMS[0]) == -1
) {
  console.log(
    "You must pass ENV and date to recovery. You cand pass a specific collection to recovery"
  );
  process.exit();
}
const mappers = {
  dev: "dev",
  pdn: "app",
};
const ENV = PARAMS[0];

const serviceAccount = require(`./deporty-${ENV}.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const FILE = PARAMS[1];
const COLLECTION = PARAMS[2];

const pathFolder = `${DATA_PATH}/${ENV}/${FILE}`;

const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
    }
  });

  return arrayOfFiles;
};

async function main() {
  const bucket = getStorage().bucket(`deporty-${mappers[ENV]}.appspot.com`);

  const files = getAllFiles(pathFolder).map((item) => {
    return item.split("\\").join("/");
  });
  for (const file of files) {
    console.log(file);
    bucket.upload(file, {
      destination: file.split(`${FILE}/`)[1],
    });
  }
}

main();
