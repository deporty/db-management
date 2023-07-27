"strict";
const fs = require("fs");
var walk = require("walk");
var UUID = require("uuid-js");

const dataToTransform = {
  name: "tournaments",
  attributes: [
    {
      attribute: ["registered-teams"],
      to: ["registered-teams"],
    },
    {
      attribute: ["financial-statements", "invoices"],
      to: ["invoices"],
    },
  ],
  persist: ["fixture-stages", "main-draw"],
  collections: [
    {
      name: "fixture-stages",
      attributes: [
        {
          attribute: ["groups"],
          to: ["groups"],
        },
      ],
persist: ['intergroup-matches'],
      collections: [
        {
          name: "groups",

          attributes: [
            {
              attribute: ["matches"],
              to: ["matches"],
              callback: async (config) => {
                console.log("Matches callback");
                console.log(config);
                const label = config.data.value.label.value;

                const newFilePath = `${config.root.replace(
                  FOLDER_DESTINATION,
                  FOLDER_DESTINATION_FILES
                )}/matches/${config.id}`.replace(TARGET, TARGET_FILES);
                // .replace("fixture-", "");

                const filePath = `${config.target
                  .replace("fixture-", "")
                  .replace(
                    FOLDER_DESTINATION,
                    TARGET_FILES
                  )}/groups/${label}/matches/${config.item.value["team-a"].value
                  .split("/")
                  .pop()}-${config.item.value["team-b"].value
                  .split("/")
                  .pop()}`;

                const filePathJSON = newFilePath.replace(
                  `${FOLDER_DESTINATION_FILES}/`,
                  ""
                );
                // .replace("stages", "fixture-stages");

                if (
                  config.item.value["captain-a-signature"] ||
                  config.item.value["captain-b-signature"] ||
                  config.item.value["judge-signature"]
                ) {
                  console.log("Haciendo esta hpta");
                  console.log(newFilePath);
                  fs.mkdirSync(newFilePath, {
                    recursive: true,
                  });
                }



                if (config.item.value["captain-a-signature"]) {
           
                  config.item.value[
                    "captain-a-signature"
                  ].value = `${filePathJSON}/captainASignature.jpg`;

                  
                  fs.copyFileSync(
                    `${filePath}/captainASignature.jpg`,
                    `${newFilePath}/captainASignature.jpg`
                  );
                }

                if (config.item.value["captain-b-signature"]) {
                  config.item.value[
                    "captain-b-signature"
                  ].value = `${filePathJSON}/captainBSignature.jpg`;

                  fs.copyFileSync(
                    `${filePath}/captainBSignature.jpg`,
                    `${newFilePath}/captainBSignature.jpg`
                  );
                }
              
                if (config.item.value["judge-signature"]) {
                  config.item.value[
                    "judge-signature"
                  ].value = `${filePathJSON}/judgeSignature.jpg`;

                  fs.copyFileSync(
                    `${filePath}/judgeSignature.jpg`,
                    `${newFilePath}/judgeSignature.jpg`
                  );
                }

                // await copyFolder(filePath, newFilePath, true);
                console.log(filePath);
                console.log(filePathJSON);
                console.log(newFilePath);
                return config.item;
              },
            },

            {
              attribute: ["teams"],
              to: ["teams"],
            },
          ],

          collections: [
            {
              name: "matches",
              attributes: [
                {
                  attribute: ["player-form"],
                  to: ["player-form"],
                },
                {
                  attribute: ["stadistics"],
                  to: ["stadistics"],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const FOLDER_DESTINATION = "./data/migration";
const TARGET = "./data/dev/2022-12-13-21-55-40";

const FOLDER_DESTINATION_FILES = "./files/migration-files";
const TARGET_FILES = "./files/dev/2022-12-13-21-55-40";

function deleteAtribute(obj, attributeConfig) {
  let temp = obj;
  const attributeDefinition = attributeConfig.attribute;
  for (let i = 0; i < attributeDefinition.length - 1; i++) {
    temp = temp.value[attributeDefinition[i]];
  }
  const lastKey = attributeDefinition[attributeDefinition.length - 1];
  delete temp.value[lastKey];
  return temp;
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

function generateUUID() {
  return UUID.create().toString().replace(/-/g, "").substring(0, 20);
}

async function migrateAttribute(
  attributeConfig,
  root,
  data,
  target,
  folderDestination
) {
  const folder = root.replace(`${target}`, "");

  const newData = { ...data };
  const items = getNestedAttribute(newData, attributeConfig);

  fs.mkdirSync(`${folderDestination}${folder}/${attributeConfig.to}`, {
    recursive: true,
  });

  const response = {};
  if (items.value) {
    if (items.type == "Array") {
      for (const item of items.value) {
        await newFunction(item);
      }
    } else {
      await newFunction(items.value);
    }
  }
  return response;

  async function newFunction(item) {
    const id = generateUUID();

    response[id] = `${folderDestination}${folder}/${attributeConfig.to}/${id}`;
    fs.mkdirSync(`${folderDestination}${folder}/${attributeConfig.to}/${id}`, {
      recursive: true,
    });

    if (attributeConfig.callback) {
      item = await attributeConfig.callback({
        attributeConfig,
        root,
        data,
        target,
        folderDestination,
        id,
        item,
      });
    }
    fs.writeFileSync(
      `${folderDestination}${folder}/${attributeConfig.to}/${id}/data.json`,
      JSON.stringify(item, null, 2)
    );
  }
}

async function migrateData(
  docPath,
  attributes,
  target,
  folderDestination,
  init
) {
  // console.log(docPath);
  const folder = docPath.replace(!init ? target : folderDestination, "");
  // console.log("El folder es ", folder);

  fs.mkdirSync(`${folderDestination}${folder}`, {
    recursive: true,
  });

  const origin = `${docPath}/data.json`;

  const data = JSON.parse(fs.readFileSync(origin));

  const newData = { ...data };
  for (const attributeConfig of attributes) {
    // console.log("Migrando ", attributeConfig.attribute);

    await migrateAttribute(
      attributeConfig,
      docPath,
      newData,
      target,
      folderDestination
    );
    deleteAtribute(newData, attributeConfig);
  }
  fs.writeFileSync(
    `${folderDestination}${folder}/data.json`,
    JSON.stringify(newData, null, 2)
  );
}

function copyFolder(from, to, p = false) {
  if (p) {
    console.log("FROM:: ", from);
    console.log("TO:: ", to);
  }
  const options = {};
  walker = walk.walk(`${from}`, options);
  return new Promise((resolve) => {
    walker.on("file", function (root, fileStats, next) {
      const folder = root.replace(`${from}`, "");
      if (p) {
        console.log(">>>", `${to}/${folder}`);
      }
      fs.mkdirSync(`${to}/${folder}`, {
        recursive: true,
      });
      fs.copyFileSync(
        `${root}/${fileStats.name}`,
        `${to}${folder}/${fileStats.name}`
      );
      next();
    });
    walker.on("end", () => {
      // console.log("T= ", from, to);
      resolve();
    });
  });
}

function getCollectionPath(target, folderDestination, configObj) {
  const collectionPath = fs.existsSync(`${target}/${configObj.name}`)
    ? {
        origin: `${target}/${configObj.name}`,
        source: target,
      }
    : {
        origin: `${folderDestination}/${configObj.name}`,
        source: folderDestination,
      };
  return collectionPath;
}
async function zonata(configObj, target, folderDestination) {
  const collectionName = configObj.name;
  const data = getCollectionPath(target, folderDestination, configObj);
  const collectionPath = data.origin;

  // console.log("Collection name: ", configObj.name, collectionPath);
  // console.log(configObj, "0000");

  if (fs.existsSync(collectionPath)) {
    const docs = fs.readdirSync(collectionPath);

    for (const doc of docs) {
      const docPath = `${collectionPath}/${doc}`;

      // console.log("MIGRANDO ATRIBUTOS");
      await migrateData(
        docPath,
        configObj.attributes,
        data.source,
        folderDestination
      );

      // console.log("Migrando persistencias");
      for (const persist of configObj.persist || []) {
        await copyFolder(
          `${collectionPath}/${doc}/${persist}`,
          `${folderDestination}/${configObj.name}/${doc}/${persist}`,
          persist
        );
      }

      // console.log("Migrando colecciones");
      for (const coll of configObj.collections || []) {
        await zonata(
          coll,
          `${target}/${collectionName}/${doc}`,
          `${folderDestination}/${collectionName}/${doc}`
        );
      }
    }
  } else {
    console.log("No existe ", collectionPath);
  }
}
async function transformTournaments(path) {
  await zonata(dataToTransform, TARGET, FOLDER_DESTINATION, true);
  //   fs.mkdirSync(`${FOLDER_DESTINATION}/${path}`, {
  //     recursive: true,
  //   });
  //   const options = {};
  //   walker = walk.walk(`${TARGET}/${path}`, options);
  //   walker.on("file", function (root, fileStats, next) {
  //     console.log(root, fileStats.name);
  //     if (
  //       !(root.indexOf("fixture-stages") > 0) &&
  //       !(root.indexOf("main-draw") > 0)
  //     ) {
  //       migrateData(
  //         root,
  //         path,
  //         fileStats,
  //         [
  //           {
  //             attribute: ["registered-teams"],
  //             to: ["registered-teams"],
  //           },
  //           {
  //             attribute: ["financial-statements", "invoices"],
  //             to: ["invoices"],
  //           },
  //         ],
  //         TARGET,
  //         FOLDER_DESTINATION
  //       );
  //     } else {
  //       migrateData(root, path, fileStats, [], TARGET, FOLDER_DESTINATION);
  //     }
  //     next();
  //   });
}

exports.transformTournaments = transformTournaments;
