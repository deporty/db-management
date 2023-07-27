const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const matchFilesPattern =
  /[a-z0-9A-Z]+\\fixture-stages\\[a-z0-9A-Z]+\\groups\\[a-z0-9A-Z]+\\matches\\[a-z0-9A-Z]+\\data.json/i;

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

const matchFiles = listFilesRecursive(`${toPath}/tournaments`).filter((f) =>
  matchFilesPattern.test(f)
);

let counter = 0;
for (const fil of matchFiles) {
  const fragments = fil.split("\\");
  console.log(fragments);
  const tournamentId = fragments[2];
  const fixtureStageId = fragments[4];
  const groupId = fragments[6];
  const matchId = fragments[8];

  const matchContent = JSON.parse(fs.readFileSync(fil));

  // fs.rmdirSync(
  //   `${toPath}/tournaments/${tournamentId}/fixture-stages/${fixtureStageId}/groups/${groupId}/matches/${matchId}/stadistics`,
  //   { recursive: true }
  // );
  // fs.rmdirSync(
  //   `${toPath}/tournaments/${tournamentId}/fixture-stages/${fixtureStageId}/groups/${groupId}/matches/${matchId}/player-form`,
  //   { recursive: true }
  // );
  // const playerFormFile = listFilesRecursive(
  //   `${toPath}/tournaments/${tournamentId}/fixture-stages/${fixtureStageId}/groups/${groupId}/matches/${matchId}/player-form`
  // )
  //   .filter((f) => fromPattern.test(f))
  //   .pop();

  // const stadisticsFile = listFilesRecursive(
  //   `${toPath}/tournaments/${tournamentId}/fixture-stages/${fixtureStageId}/groups/${groupId}/matches/${matchId}/stadistics`
  // )
  //   .filter((f) => fromPattern.test(f))
  //   .pop();

  // const playerFormContent = JSON.parse(fs.readFileSync(playerFormFile));
  // const stadisticsContent = JSON.parse(fs.readFileSync(stadisticsFile));

  matchContent["value"]["player-form"] =
    matchContent["value"]["player-form"]["value"];
  matchContent["value"]["stadistics"] =
    matchContent["value"]["stadistics"]["value"];
  // matchContent["value"]["player-form"] = {
  //   type: "object",
  //   value: playerFormContent,
  // };
  // matchContent["value"]["stadistics"] = {
  //   type: "object",
  //   value: stadisticsContent,
  // };

  fs.writeFileSync(fil, JSON.stringify(matchContent, null, 2));

  fs.rmdirSync(playerFormFile, { recursive: true });
  fs.rmdirSync(stadisticsFile, { recursive: true });

  // console.log(matchContent, fil);

  counter++;
  //   }
}
