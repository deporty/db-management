const fs = require("fs");
const path = require("path");

const toPath = "target";
const pattern = /teams\\[a-z0-9A-Z]+\\data.json/i;

const MAPPER = {
  "Sub 8": "436853a4685f4c9a8ebb",
  "Sub 9": "436853a4685f4c9a8ebb",
  "Sub 10": "9cf8f95aa359486cbbf7",
  "Sub 11": "9cf8f95aa359486cbbf7",
  "Sub 12": "9cf8f95aa359486cbbf7",
  "Sub 13": "5e4ee735d3cf4735a43d",
  "Sub 14": "5e4ee735d3cf4735a43d",
  "Sub 15": "5e4ee735d3cf4735a43d",
  "Sub 17": "5e4ee735d3cf4735a43d",
};

function listFilesRecursive(directory) {
  const response = [];

  const entries = fs.readdirSync(directory, { withFileTypes: true });

  entries.forEach(function (entry) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const responseTemp = listFilesRecursive(fullPath);
      response.push(...responseTemp);
    } else {
      response.push(fullPath);
    }
  });
  return response;
}

const team = listFilesRecursive(`${toPath}/teams`).filter((f) => {
  return pattern.test(f);
});

for (const fil of team) {
  const content = JSON.parse(fs.readFileSync(fil));
  const category = content["value"]["category"]["value"];

  const id = MAPPER[category];
  content["value"]["sports-id"] = {
    value: [{ value: id, type: "string" }],
    type: "Array",
  };

  console.log(JSON.stringify(content, null, 2));
  fs.writeFileSync(fil, JSON.stringify(content, null, 2));
}
