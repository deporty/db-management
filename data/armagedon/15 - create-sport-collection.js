const fs = require("fs");

const toPath = "target";

const family = 'e27af448f1fa4acd8b47'
const sports = [
  {
    id: "5e4ee735d3cf4735a43d",
    name: "Fútbol",
  },
  {
    id: "aa2a67e139aa47cab891",
    name: "Fútbol 10",
  },
  {
    id: "9cf8f95aa359486cbbf7",
    name: "Fútbol 9",
  },
  {
    id: "929b547888e442579de9",
    name: "Fútbol 8",
  },
  {
    id: "436853a4685f4c9a8ebb",
    name: "Fútbol 7",
  },
  {
    id: "487519c34acb401db453",
    name: "Microfútbol",
  },
  {
    id: "73ebb41c184d476eab4a",
    name: "Futsala",
  },
];
const folder = `${toPath}/sports`;
fs.mkdirSync(folder);

for (const sport of sports) {
  const t = {
    type: "object",
    value: {
      name: {
        type: "string",
        value: sport.name,
      },
      'sports-family-id': {
        type: "string",
        value: family,
      },
    },
  };
  const folderDoc = `${folder}/${sport.id}`;

  fs.mkdirSync(folderDoc);

  const p = `${folderDoc}/data.json`;
  fs.writeFileSync(p, JSON.stringify(t, null, 2));
}
