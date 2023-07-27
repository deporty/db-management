const fs = require("fs");
const path = require("path");

const toPath = "target";
const pattern = /tournaments\\[a-z0-9A-Z]+\\registered-teams\\[a-z0-9A-Z]+\\data.json/i;

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

const registeredTeams = listFilesRecursive(`${toPath}/tournaments`).filter((f) => {
  return pattern.test(f);
});

for (const fil of registeredTeams) {
  const content = JSON.parse(fs.readFileSync(fil));

  content["value"]["status"] = {
    value: "enabled",
    type: "string",
  };

  console.log(JSON.stringify(content, null, 2));
  fs.writeFileSync(fil, JSON.stringify(content, null, 2));
}
