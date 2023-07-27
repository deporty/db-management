const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const patterns = [/teams\\[a-z0-9A-Z]+\\data.json/i];

const membersPatterns = [
  /[a-z0-9A-Z]+\\teams\\[a-z0-9A-Z]+\\members\\[a-z0-9A-Z]+\\data.json/i,
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

const teams = listFilesRecursive(`${toPath}/teams`).filter((f) => {
  const res = patterns[0].test(f);
  return res;
});

for (const fil of teams) {
  const fragments = fil.split("\\");
  console.log(fil, 1);
  const teamId = fragments[2];
  console.log(teamId);
  const teamData = JSON.parse(fs.readFileSync(fil));
  console.log("teamData", teamData);
  const newUUID = uuid.v4().toString().replace(/-/g, "").substring(0, 20);
  console.log("Id", newUUID);
  const technicalDirector = teamData["value"]["technical-staff"];
  if (technicalDirector) {
    console.log(JSON.stringify(technicalDirector, null, 2), 7);
    const technicalDirectorId =
      technicalDirector["value"]["technical-director"]["value"]['userId']['value'];
    const newMember = {
      type: "object",
      value: {
        "init-date": {
          type: "date",
          value: "2022-12-01T05:00:00.000Z",
        },
        "user-id": {
          value: technicalDirectorId,
          type: "string",
        },
        "kind-member": {
          value: "technical-director",
          type: "string",
        },
        "team-id": {
          value: teamId,
          type: "string",
        },
      },
    };
    console.log(newMember);
    const newMemberFolderPaht = fil.replace("data.json", "members\\" + newUUID);

    fs.mkdirSync(newMemberFolderPaht);
    const newMemberPaht = fil.replace(
      "data.json",
      "members\\" + newUUID + "\\data.json"
    );
    console.log(newMemberPaht);
    fs.writeFileSync(newMemberPaht, JSON.stringify(newMember, null, 2));
  }
}
