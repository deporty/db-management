const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const firestore = require("@google-cloud/firestore");
const moment = require("moment");
var readdirp = require("readdirp");
const sharp = require("sharp");

const PARAMS = process.argv.slice(2);
const DATA_PATH = "./data";
const FILES_PATH = "./files";

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

const ENV = PARAMS[0];
const FILE = PARAMS[1];
const COLLECTION = PARAMS[2];

const serviceAccount = require(`./deporty-${ENV}.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  ignoreUndefinedProperties: true,
});

function generateDocumentReference(data) {
  const fragments = data.split("/");
  const _ = (db, flag, fragments, i) => {
    if (i < fragments.length) {
      if (flag) {
        return _(db.collection(fragments[i]), !flag, fragments, i + 1);
      } else {
        return _(db.doc(fragments[i]), !flag, fragments, i + 1);
      }
    } else {
      return db;
    }
  };
  let db = admin.firestore();
  const response = _(db, true, fragments, 0);
  return response;
}
function generateGeopoint(data) {
  const response = new firestore.GeoPoint(data.latitude, data.longitude);
  return response;
}
function uparseItem(data) {
  let response = null;
  if (data.type == "Array") {
    const tempArray = [];
    for (const item of data.value) {
      const temo = uparseItem(item);
      tempArray.push(temo);
    }
    response = tempArray;
  } else if (data.type == "date") {
    response = moment(data.value).toDate();
  } else if (data.type == "reference") {
    response = generateDocumentReference(data.value);
  } else if (data.type == "GeoPoint") {
    response = generateGeopoint(data.value);
  } else if (data.type === "object") {
    const temp = {};
    for (const key in data.value) {
      const element = data.value[key];
      temp[key] = uparseItem(element);
    }

    response = temp;
  } else {
    response = data.value;
  }
  return response;
}

async function y(storage) {
  const bucketName = CONFIGURATION["environments"][ENV].bucket;
  const filesFolderName = `${FILES_PATH}/${ENV}/${FILE}`;
  console.log(filesFolderName);
  var settings = {
    types: "files",
    fileFilter: ["*.*"],
  };
  const a = readdirp(filesFolderName, settings);
  var allFilePaths = [];
  a.on("data", function (entry) {
    allFilePaths.push(entry);
  }).on("end", async () => {
    const bucket = storage.bucket(bucketName);

    for (const fi of allFilePaths) {
      console.log(fi.path);
      await bucket.upload(fi.fullPath, {
        destination: fi.path.replace(/\\/g, "/"),
      });
    }
  });
}

async function x(db, relativePatch, isCollection = true) {
  console.log(relativePatch);
  const files = fs.readdirSync(relativePatch);
  if (!isCollection) {
    for (const doc of files) {
      const docPath = `${relativePatch}/${doc}`;
      const content = JSON.parse(fs.readFileSync(`${docPath}/data.json`));
      const ref = db.doc(doc);
      const data = await (await ref.get()).data();
      const parseditem = uparseItem(content);
      if (data) {
        ref.update(parseditem);
      } else {
        if (
          relativePatch ===
          "./data/dev/generated copy/tournaments/7KqZutvODrgNeypckDrO/fixture-stages/qriXXV6Yh7qJLVtFtElk/groups/d7c56b5ced674848ad41/teams"
        ) {
          console.log(doc);
          console.log(content);
          console.log(parseditem);
        }
        ref.set(parseditem);
      }

      await x(ref, docPath, !isCollection);
    }
  } else {
    const filteredFolders = files.filter((x) => x != "data.json");
    for (const collection of filteredFolders) {
      const ref = db.collection(collection);
      const newPath = `${relativePatch}/${collection}`;
      await x(ref, newPath, !isCollection);
    }
  }
}

async function main() {
  const db = admin.firestore();
  const storage = admin.storage();

  const pathFolder = `${DATA_PATH}/${ENV}/${FILE}`;
  // await y(storage);
  await x(db, pathFolder);
}

main();
