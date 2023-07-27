const admin = require("firebase-admin");
const fs = require("fs");
const firestore = require("@google-cloud/firestore");
const moment = require("moment");
const PARAMS = process.argv.slice(2);
const DATA_PATH = "./data";
const FILES_PATH = "./files";
const CONFIGURATION = require("./configuration.json");
const { exit } = require("process");

if (
  PARAMS.length == 0 ||
  CONFIGURATION["environments-list"].indexOf(PARAMS[0]) == -1
) {
  console.log("The environment is not valid, or it is not present");
  process.exit();
}

const ENV = PARAMS[0];

const serviceAccount = require(`./deporty-${ENV}.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const today = moment(new Date()).format("YYYY-MM-DD-HH-mm-ss");

async function main() {
  const db = admin.firestore();
  const storage = admin.storage();

  const folderName = `${DATA_PATH}/${ENV}/${today}`;
  const start = moment();
  // await x(db, folderName);
  await y(storage);
  const end = moment();
  console.log(end.diff(start, "minutes"));
  console.log(end.diff(start, "seconds"));
}

async function y(storage) {
  const bucketName = CONFIGURATION["environments"][ENV].bucket;
  const filesFolderName = `${FILES_PATH}/${ENV}/${today}`;
  const files = await storage.bucket(bucketName).getFiles();
  files[0].forEach(async (c) => {
    const pattern = /\.[a-zA-Z]+$/g;
    const isFile = !!pattern.exec(c.id);
    if (isFile) {
      const fragments = c.id.replace(/%2F/g, "/").split("/");
      const pseudoPath = fragments.slice(0, fragments.length - 1).join("/");
      const pathToFile = `${filesFolderName}/${pseudoPath}`;
      fs.mkdirSync(pathToFile, {
        recursive: true,
      });
      await c.download({
        destination: `${filesFolderName}/${fragments.join("/")}`,
      });
    }
  });
}

function parseInformation(data) {
  let response = null;
  const value = data;

  if (Array.isArray(value)) {
    const tempArray = [];
    for (const item of value) {
      tempArray.push(parseInformation(item));
    }
    response = {
      type: "Array",
      value: tempArray,
    };
  } else if (typeof value === "object") {
    if (value instanceof firestore.Timestamp) {
      response = {
        type: "date",
        value: value.toDate(),
      };
    } else if (value instanceof firestore.DocumentReference) {
      response = {
        type: "reference",
        value: value.path,
      };
    } else if (value instanceof firestore.GeoPoint) {
      response = {
        type: "GeoPoint",
        value: {
          latitude: value.latitude,
          longitude: value.longitude,
        },
      };
    } else {
      const temp = {};
      for (const key in value) {
        const element = value[key];
        temp[key] = parseInformation(element);
      }

      response = {
        type: "object",
        value: temp,
      };
    }
  } else {
    response = {
      type: typeof value,
      value: value,
    };
  }
  return response;
}

async function x(db, relativePath) {
  const collections = await db.listCollections();
  for (const collection of collections) {
    const collectionPath = `${relativePath}/${collection.id}`;
    fs.mkdirSync(collectionPath, {
      recursive: true,
    });
    const documents = await collection.listDocuments();
    for (const document of documents) {
      const docPath = `${collectionPath}/${document.id}`;
      fs.mkdirSync(docPath, {
        recursive: true,
      });
      const item = await (await document.get()).data();
      const parsedItem = parseInformation(item);
      const docDataPath = `${docPath}/data.json`;
      fs.writeFileSync(docDataPath, JSON.stringify(parsedItem, null, 2));
      await x(document, docPath);
    }
  }
}

main();
