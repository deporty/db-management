const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");

const fs = require("fs");
const moment = require("moment");
const PARAMS = process.argv.slice(2);
const DATA_PATH = "./data";
const CONFIGURATION = require("./configuration.json");

if (
  PARAMS.length == 0 ||
  CONFIGURATION["environments-list"].indexOf(PARAMS[0]) == -1
) {
  console.log("The environment is not valid, or it is not present");
  process.exit();
}

const ENV = PARAMS[0];

const serviceAccount = require(`./deporty-${ENV}.json`);

const mappers = {
  dev: "dev",
  pdn: "app",
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const today = moment(new Date()).format("YYYY-MM-DD-HH-mm-ss");

async function main() {
  const bucket = getStorage().bucket(`deporty-${mappers[ENV]}.appspot.com`);
  const filesPromise = bucket.getFiles();
  const root = `storage`;
  const rootEnv = `${root}/${ENV}/`;
  const rootDate = `${root}/${ENV}/${today}`;

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }

  if (!fs.existsSync(rootEnv)) {
    fs.mkdirSync(rootEnv);
  }

  if (!fs.existsSync(rootDate)) {
    fs.mkdirSync(rootDate);
  }

  filesPromise.then((files) => {
    for (const file of files[0]) {
      const name = file.name;
      const fragments = name.split(".");
      if (fragments.length == 2) {
        console.log(name);

        const remoteFile = bucket.file(name);
        const localFilename = `${rootDate}/${name}`;

        remoteFile
          .createReadStream()
          .on("error", function (err) {})
          .on("response", function (response) {})
          .on("end", function () {})
          .pipe(fs.createWriteStream(localFilename));
      } else {
        fs.mkdirSync(`${rootDate}/${name}`);
      }
    }
  });
}

main();
