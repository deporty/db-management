const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const matchFilesPattern =
  /[a-z0-9A-Z]+\\fixture-stages\\[a-z0-9A-Z]+\\intergroup-matches\\[a-z0-9A-Z]+\\data.json/i;

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

function findMatchInFile(match, content, currentGroup) {
  function makeScore(match) {
    const score = match.value.score?.value;
    return `${score["team-a"]?.value}-${score["team-b"]?.value}`;
  }

  const dateIn = match.value.date?.value;
  const score = makeScore(match);
  const group = content.value.groups.value
    .filter((g) => {
      return g.value.label.value == currentGroup.value.label.value;
    })
    .pop();

  let response = null;
  if (group) {
    const matches = group.value.matches.value;

    for (const ma of matches) {
      const date = ma.value.date?.value;
      const insideScore = makeScore(ma);

      if (date == dateIn && date != undefined) {
        response = ma;
      } else if (insideScore == score) {
        response = ma;
      } else {
      }
    }
  }
  return response;
}

function getTeamMembers(playerForm, stadistics) {
  try {
    return {
      "team-a": playerForm.value["team-a"].value[0].value,
      "team-b": playerForm.value["team-b"].value[0].value,
    };
  } catch (error) {
    try {
      return {
        "team-a": stadistics.value["team-a"].value[0].value["user-id"].value,
        "team-b": stadistics.value["team-b"].value[0].value["user-id"].value,
      };
    } catch (error) {}
  }
}

function getTeams() {
  const response = [];
  const fromFiles = listFilesRecursive(`${fromPath}/teams`);
  for (const f of fromFiles) {
    const file = JSON.parse(fs.readFileSync(f));
    response.push(file);
  }
  return response;
}

function searchTeam(teams, _member) {
  for (const team of teams) {
    const members = team.value.members.value;
    for (const member of members) {
      const player = member.value.player.value.split("/")[1];
      if (player == _member) {
        return team.value.id.value;
      }
    }
  }
}

const teams = getTeams();

const matchFiles = listFilesRecursive(`${toPath}/tournaments`).filter((f) =>
  matchFilesPattern.test(f)
);

let counter = 0;
for (const fil of matchFiles) {
  const fragments = fil.split("\\");
  console.log(fragments);
  const tournamentId = fragments[2];
  const fixtureStageId = fragments[4];
  const matchId = fragments[6];

  //   const p = `${fromPath}/tournaments/${tournamentId}/fixture-stages/${fixtureStageId}/`;
  //   console.log("12", p);
  //   if (fs.existsSync(p)) {
  // const fromFile = listFilesRecursive(p)
  //   .filter((f) => fromPattern.test(f))
  //   .filter((f) => f.indexOf("intergroup-matches") > -1)
  //   .pop();

  //   const playerFormFile = listFilesRecursive(
  //     `${toPath}/tournaments/${tournamentId}/fixture-stages/${fixtureStageId}/intergroup-matches/${matchId}/player-form`
  //   )
  //     .filter((f) => fromPattern.test(f))
  //     .pop();

  //   const stadisticsFile = listFilesRecursive(
  //     `${toPath}/tournaments/${tournamentId}/fixture-stages/${fixtureStageId}/intergroup-matches/${matchId}/stadistics`
  //   )
  //     .filter((f) => fromPattern.test(f))
  //     .pop();

  // const originContent = JSON.parse(fs.readFileSync(fromFile));

  //   const playerFormContent = JSON.parse(fs.readFileSync(playerFormFile));
  //   const stadisticsContent = JSON.parse(fs.readFileSync(stadisticsFile));

  const matchContent = JSON.parse(fs.readFileSync(fil));


  const playerFormContent =
    matchContent["value"]["match"]["value"]["player-form"];

  const stadisticsContent =
    matchContent["value"]["match"]["value"]["stadistics"];

  const members = getTeamMembers(playerFormContent, stadisticsContent);

  if (members) {
    const teamA = searchTeam(teams, members["team-a"]);
    const teamB = searchTeam(teams, members["team-b"]);
    console.log(counter, "Miembros ", members);
    if (teamA && teamB) {
      matchContent["value"]["match"]["value"]["team-a-id"] = {
        type: "string",
        value: teamA,
      };

      matchContent["value"]["match"]["value"]["team-b-id"] = {
        type: "string",
        value: teamB,
      };
    } else {
      console.error("No ", teamA, teamB);
    }
  } else {
    const match = findMatchInFile(matchContent, originContent, groupContent);
    if (!match) {
      console.log("error +=+");
    } else {
      const teamAid = match.value["team-a"].value.split("/")[1];
      const teamBid = match.value["team-b"].value.split("/")[1];

      matchContent["value"]["match"]["value"]["team-a-id"] = {
        type: "string",
        value: teamAid,
      };

      matchContent["value"]["match"]["value"]["team-b-id"] = {
        type: "string",
        value: teamBid,
      };
    }
  }

  console.log(matchContent,fil);

    fs.writeFileSync(fil, JSON.stringify(matchContent, null, 2));

  counter++;
  //   }
}
// function getGroup( matchContent, groupsContents) {

//   let response = null;
//   for (const group of groupsContents) {

//     const teams =

//   }
// }
