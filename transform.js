const fs = require("fs");
var UUID = require("uuid-js");
const transformTournaments = require("./transform-tournaments-utils");
var walk = require("walk");

const FOLDER_DESTINATION = "./data/migration";
const TARGET = "./data/dev/2022-12-13-21-55-40";

const pipeline = {
  ads: {
    enable: false,
    handler: transformDirectly,
  },
  locations: {
    enable: false,
    handler: transformDirectly,
  },
  "notifiactions-by-tournament": {
    enable: false,
    handler: transformDirectly,
  },
  organizations: {
    enable: false,
    handler: transformDirectly,
  },
  partners: {
    enable: false,
    handler: transformDirectly,
  },
  permissions: {
    enable: false,
    handler: transformDirectly,
  },
  resources: {
    enable: false,
    handler: transformDirectly,
  },
  roles: {
    enable: false,
    handler: transformDirectly,
  },
  teams: {
    enable: true,
    handler: transformTeams,
  },

  tournaments: {
    enable: false,
    handler: transformTournaments.transformTournaments,
  },
  users: {
    enable: false,
    handler: transformDirectly,
  },
};

function transformDirectly(path) {
  fs.mkdirSync(`${FOLDER_DESTINATION}/${path}`, {
    recursive: true,
  });

  const options = {};
  walker = walk.walk(`${TARGET}/${path}`, options);

  walker.on("file", function (root, fileStats, next) {
    const folder = root.replace(`${TARGET}`, "");
    fs.mkdirSync(`${FOLDER_DESTINATION}/${folder}`, {
      recursive: true,
    });
    fs.copyFileSync(
      `${TARGET}${folder}/${fileStats.name}`,
      `${FOLDER_DESTINATION}${folder}/${fileStats.name}`
    );
    next();
  });
}

function deleteAtribute(obj, attributeConfig) {
  let temp = obj;
  const attributeDefinition = attributeConfig.attribute;
  for (let i = 0; i < attributeDefinition.length - 1; i++) {
    temp = temp.value[attributeDefinition[i]];
  }

  const lastKey = attributeDefinition[attributeDefinition.length - 1];
  delete temp.value[lastKey];
}

function getNestedAttribute(obj, attributeConfig) {
  let temp = obj;

  const attributeDefinition = attributeConfig.attribute;
  for (let i = 0; i < attributeDefinition.length; i++) {
    const element = temp.value[attributeDefinition[i]];
    temp = element;
  }
  return temp;
}

function migrateData(
  root,
  path,
  fileStats,
  attributes,
  target,
  folderDestination
) {
  const folder = root.replace(`${target}`, "");

  fs.mkdirSync(`${folderDestination}/${folder}`, {
    recursive: true,
  });

  const data = JSON.parse(
    fs.readFileSync(`${target}${folder}/${fileStats.name}`)
  );

  const newData = { ...data };
  for (const attributeConfig of attributes) {
    migrateAttribute(
      attributeConfig,
      root,
      newData,
      target,
      folderDestination
    );
    deleteAtribute(newData, attributeConfig);
  }

  fs.writeFileSync(
    `${folderDestination}${folder}/${fileStats.name}`,
    JSON.stringify(newData, null, 2)
  );
}

function migrateAttribute(
  attributeConfig,
  root,
  data,
  target,
  folderDestination
) {
  const folder = root.replace(`${target}`, "");

  const newData = { ...data };
  const items = getNestedAttribute(newData, attributeConfig);
  console.log(
    "Haciendo folder",
    `${folderDestination}${folder}/${attributeConfig.to}`
  );
  fs.mkdirSync(`${folderDestination}${folder}/${attributeConfig.to}`, {
    recursive: true,
  });

  const response = {};
  if (items.value) {
    for (const item of items.value) {
      const id = generateUUID();

      response[
        id
      ] = `${folderDestination}${folder}/${attributeConfig.to}/${id}`;
      fs.mkdirSync(
        `${folderDestination}${folder}/${attributeConfig.to}/${id}`,
        {
          recursive: true,
        }
      );

      fs.writeFileSync(
        `${folderDestination}${folder}/${attributeConfig.to}/${id}/data.json`,
        JSON.stringify(item, null, 2)
      );
    }
  }
  return response;
}

function generateUUID() {
  return UUID.create().toString().replace(/-/g, "").substring(0, 20);
}
function transformTeams(path) {
  fs.mkdirSync(`${FOLDER_DESTINATION}/${path}`, {
    recursive: true,
  });
  const options = {};
  walker = walk.walk(`${TARGET}/${path}`, options);
  walker.on("file", function (root, fileStats, next) {
    migrateData(
      root,
      path,
      fileStats,
      [
        {
          attribute: ["members"],
          to: ["members"],
        },
      ],
      TARGET,
      FOLDER_DESTINATION
    );

    next();
  });
}
function main() {
  const collections = fs.readdirSync(TARGET);
  if (fs.existsSync(FOLDER_DESTINATION)) {
    fs.rmdirSync(
      FOLDER_DESTINATION,

      {
        recursive: true,
      }
    );
  }
  fs.mkdirSync(FOLDER_DESTINATION);
  for (const col of collections) {
    const config = pipeline[col];
    if (config && config.enable) {
      config.handler(col);
    }
  }
}

main();
