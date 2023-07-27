const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const patterns = [/teams\\[a-z0-9A-Z]+\\members\\[a-z0-9A-Z]+\\data.json/i];

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

const teams = listFilesRecursive(`${toPath}/teams`).filter((f) => {
  const res = patterns[0].test(f);
  return res;
});

for (const fil of teams) {
  const fragments = fil.split("\\");

  const memberData = JSON.parse(fs.readFileSync(fil));

  const teamId = fragments[2];
  const memberId = fragments[4];

  const userId = memberData['value']['user-id']['value'];
  const kindMember = memberData['value']['kind-member'];
  if (!userId && !!kindMember) {
    const pathh = fil.replace("\\data.json", "");
    console.log('removing', pathh);
    fs.rmdirSync(pathh, {
      recursive: true,
    });
  }
}
