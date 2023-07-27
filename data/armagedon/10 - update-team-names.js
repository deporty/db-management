const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const pattern = /teams\\[a-z0-9A-Z]+\\data.json/i;

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

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

const tournaments = listFilesRecursive(`${toPath}/teams`).filter((f) => {
  return pattern.test(f);
});
const propertyName = "Copa Ciudad Manizales";
for (const fil of tournaments) {
  const content = JSON.parse(fs.readFileSync(fil));

  const cleanedName = content["value"]["name"]["value"].replace(
    /\(Sub [0-9]+\)/,
    ""
  );
  const goodName = toTitleCase(cleanedName)
    .replace("F.c", "F.C.")
    .replace("Fc", "F.C.")
    .replace("Cd", "C.D.")
    .replace(/ - Sub [0-9]+/, "")
    .trim();

  console.log("goodName", goodName);

  content["value"]["name"] = {
    value: goodName,
    type: "string",
  };

  console.log(JSON.stringify(content, null, 2));
  fs.writeFileSync(fil, JSON.stringify(content, null, 2));
}
