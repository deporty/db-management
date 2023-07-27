const fs = require("fs");
const path = require("path");
const moment = require("moment");

const toPath = "target";

const accessKeys = [
  {
    id: "be8a7fc804a04f76a517",
    name: "Key for Web terminal",
    description: "Esta llave solo se usa para el terminal web de Deporty",
    key: "f599e916-841b-4a1b-aa0a-65fefcaadf09",
    "expiration-date": moment("2023-12-31", "YYYY-MM-DD"),
  },
  {
    id: "bb288fdf4669456cb015",
    name: "Key for Mobile terminal",
    description: "Esta llave solo se usa para el terminal mobile de Deporty",
    key: "0675fb4d-358d-43c8-8b9c-19d789e9b95d",
    "expiration-date": moment("2023-12-31", "YYYY-MM-DD"),
  },
];
const folder = `${toPath}/access-keys`;
fs.mkdirSync(folder);

for (const fam of accessKeys) {
  const t = {
    type: "object",
    value: {
      name: {
        type: "string",
        value: fam.name,
      },
      description: {
        type: "string",
        value: fam.description,
      },
      id: {
        type: "string",
        value: fam.id,
      },
      key: {
        type: "string",
        value: fam.key,
      },
      'expiration-date': {
        type: "date",
        value: fam["expiration-date"],
      },
      
    },
  };
  const folderDoc = `${folder}/${fam.id}`;

  fs.mkdirSync(folderDoc);

  const p = `${folderDoc}/data.json`;
  fs.writeFileSync(p, JSON.stringify(t, null, 2));
}
