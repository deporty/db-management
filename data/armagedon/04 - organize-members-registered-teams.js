const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const patterns = [
  /[a-z0-9A-Z]+\\tournaments\\[a-z0-9A-Z]+\\registered-teams\\[a-z0-9A-Z]+\\data.json/i,
];

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

const registeredMembersFiles = listFilesRecursive(
  `${toPath}/tournaments`
).filter((f) => {
  const res = patterns[0].test(f);
  return res;
});

function getUserMember() {
  const response = {};
  const fromFiles = listFilesRecursive(`${toPath}/teams`).filter((f) => {
    const res = membersPatterns[0].test(f);
    return res;
  });
  for (const f of fromFiles) {
    const file = JSON.parse(fs.readFileSync(f));

    const userId = file["value"]["user-id"]["value"];
    const fragments = f.split("\\");
    response[userId] = {
      'member-id': fragments[fragments.length - 2],
      'team-id': fragments[fragments.length - 4],
    };
  }
  return response;
}

const userMember = getUserMember();
// console.log(userMember);

for (const fil of registeredMembersFiles) {
  const registeredTeam = JSON.parse(fs.readFileSync(fil));

  let members = registeredTeam["value"]["members"]["value"];

  for (const member of members) {
    const userId = member["value"]["user-id"]['value'];
    console.log(userId);
    member["value"]["member-id"] = {
      value: userMember[userId]['member-id'],
      type: "string",
    };
    console.log(member);
  }
  fs.writeFileSync(fil, JSON.stringify(registeredTeam, null, 2));
}
