const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const patterns = [
  /[a-z0-9A-Z]+\\main-draw\\[a-z0-9A-Z]+\\data.json/i,
  /[a-z0-9A-Z]+\\fixture-stages\\[a-z0-9A-Z]+\\intergroup-matches\\[a-z0-9A-Z]+\\data.json/i,
  /[a-z0-9A-Z]+\\fixture-stages\\[a-z0-9A-Z]+\\groups\\[a-z0-9A-Z]+\\matches\\[a-z0-9A-Z]+\\data.json/i,
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
  const res = patterns[0].test(f) || patterns[1].test(f) || patterns[2].test(f);
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
      "member-id": fragments[fragments.length - 2],
      "team-id": fragments[fragments.length - 4],
    };
  }
  return response;
}

const userMember = getUserMember();
// console.log(userMember);

for (const fil of registeredMembersFiles) {
  const fullMatchData = JSON.parse(fs.readFileSync(fil));

  let match = fullMatchData["value"];

  if (fil.indexOf("intergroup") > -1 || fil.indexOf("main-draw") > -1) {
    match = fullMatchData["value"]["match"]["value"];
  }

  console.log(match);
  if (Object.keys(match).length > 0) {
    let playerForm = match["player-form"]["value"];
    let teamNames = ["team-a", "team-b"];
    for (const teamName of teamNames) {
      const newPlayerForm = [];
      for (const userId of playerForm[teamName]["value"]) {
        const val = userMember[userId["value"]];
        if (val) {
          newPlayerForm.push({
            value: userMember[userId["value"]]["member-id"],
            type: "string",
          });
        }
      }
      playerForm[teamName]["value"] = newPlayerForm;
    }

    let stadistics = match["stadistics"]["value"];
    for (const teamName of teamNames) {
      const newStadistics = [];
      for (const result of stadistics[teamName]["value"]) {
        const val = userMember[result["value"]["user-id"]["value"]];
        if (val) {
          const cop = { ...result };
          cop["value"]["member-id"] = {
            value: val["member-id"],
            type: "string",
          };

          newStadistics.push(cop);
        }
      }
      stadistics[teamName]["value"] = newStadistics;
    }

    fs.writeFileSync(fil, JSON.stringify(fullMatchData, null, 2));
  }
}
