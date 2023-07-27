const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const pattern = /tournaments\\[a-z0-9A-Z]+\\data.json/i;

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

const tournaments = listFilesRecursive(`${toPath}/tournaments`).filter((f) => {
  return pattern.test(f);
});
const propertyName = "Copa Ciudad Manizales";
for (const fil of tournaments) {
  const content = JSON.parse(fs.readFileSync(fil));

  const cleanedName = content["value"]["name"]["value"]
    .replace(/Sub [0-9]+/, "")
    .replace(" V2 ", "");
  const metal = cleanedName.replace(propertyName, "");

  console.log("cleanedName", cleanedName);

  content["value"]["version"] = {
    value: "2",
    type: "string",
  };

  content["value"]["name"] = {
    value: cleanedName,
    type: "string",
  };
  content["value"]["year"] = {
    value: 2022,
    type: "number",
  };

  content["value"]["tags"] = {
    value: [
      {
        type: "string",
        value: metal.trim(),
      },
    ],
    type: "Array",
  };

  content["value"]["status"] = {
    value: "finished",
    type: "string",
  };
  console.log(JSON.stringify(content, null, 2));
  fs.writeFileSync(fil, JSON.stringify(content, null, 2));
}
