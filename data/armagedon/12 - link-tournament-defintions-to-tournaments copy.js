const fs = require("fs");
const path = require("path");

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
for (const fil of tournaments) {
  const content = JSON.parse(fs.readFileSync(fil));

  content["value"]["tournament-layout-id"] = {
    value: "155b473c8db7486f995d",
    type: "string",
  };

  console.log(JSON.stringify(content, null, 2));
  fs.writeFileSync(fil, JSON.stringify(content, null, 2));
}
