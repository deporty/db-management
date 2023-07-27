const fs = require("fs");
const path = require("path");

const toPath = "target";
const pattern = /teams\\[a-z0-9A-Z]+\\data.json/i;

const families = [
  {
    id: "e27af448f1fa4acd8b47",
    name: "Fútbol y derivados",
  },
];
const folder = `${toPath}/sports-families`;
fs.mkdirSync(folder);

for (const fam of families) {
  const t = {
    type: "object",
    value: {
      name: {
        type: "string",
        value: fam.name,
      },
    },
  };
  const folderDoc = `${folder}/${fam.id}`;

  fs.mkdirSync(folderDoc);

  const p = `${folderDoc}/data.json`;
  fs.writeFileSync(p, JSON.stringify(t, null, 2));
}
