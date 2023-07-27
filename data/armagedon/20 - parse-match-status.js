const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";
const matchFilesPattern = [
  /[a-z0-9A-Z]+\\main-draw\\[a-z0-9A-Z]+\\data.json/i,
  /[a-z0-9A-Z]+\\fixture-stages\\[a-z0-9A-Z]+\\intergroup-matches\\[a-z0-9A-Z]+\\data.json/i,
  /[a-z0-9A-Z]+\\fixture-stages\\[a-z0-9A-Z]+\\groups\\[a-z0-9A-Z]+\\matches\\[a-z0-9A-Z]+\\data.json/i,
];

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
const matchFiles = listFilesRecursive(`${toPath}/tournaments`).filter((f) => {
  const res =
    matchFilesPattern[0].test(f) ||
    matchFilesPattern[1].test(f) ||
    matchFilesPattern[2].test(f);

  return res;
});
const a = ""
for (const fil of matchFiles) {
  console.log(fil);
  const matchContent = JSON.parse(fs.readFileSync(fil));
  if (fil.includes("intergroup-matches") || fil.includes("main-draw")) {
    matchContent["value"]["match"]["value"]["status"] = {
      type: "string",
      value: "completed",
    };
    delete matchContent["value"]["match"]["value"]["completed"];
  } else {
    delete matchContent["value"]["completed"];
    matchContent["value"]["status"] = {
      type: "string",
      value: "completed",
    };
  }

  fs.writeFileSync(fil, JSON.stringify(matchContent, null, 2));
}
