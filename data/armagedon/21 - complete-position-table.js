const fs = require("fs");
const path = require("path");
const firestore = require("@google-cloud/firestore");

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";
const matchFilesPattern = [/tournaments\\[a-z0-9A-Z]+\\data.json/i];

function listFilesRecursive(directory) {
  const response = [];
  if (fs.existsSync(directory)) {
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
  }
  return response;
}
const tournamentFiles = listFilesRecursive(`${toPath}/tournaments`).filter(
  (f) => {
    const res = matchFilesPattern[0].test(f);

    return res;
  }
);

function parseInformation(data) {
  let response = null;
  const value = data;

  if (Array.isArray(value)) {
    const tempArray = [];
    for (const item of value) {
      tempArray.push(parseInformation(item));
    }
    response = {
      type: "Array",
      value: tempArray,
    };
  } else if (typeof value === "object") {
    if (value instanceof firestore.Timestamp) {
      response = {
        type: "date",
        value: value.toDate(),
      };
    } else if (value instanceof firestore.DocumentReference) {
      response = {
        type: "reference",
        value: value.path,
      };
    } else if (value instanceof firestore.GeoPoint) {
      response = {
        type: "GeoPoint",
        value: {
          latitude: value.latitude,
          longitude: value.longitude,
        },
      };
    } else {
      const temp = {};
      for (const key in value) {
        const element = value[key];
        temp[key] = parseInformation(element);
      }

      response = {
        type: "object",
        value: temp,
      };
    }
  } else {
    response = {
      type: typeof value,
      value: value,
    };
  }
  return response;
}

function getPositionTable(tournamentId) {
  const http = require("https");

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "us-central1-deporty-app.cloudfunctions.net",
      path: "/tournaments/" + tournamentId + "/position-tables",
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(JSON.parse(data)["data"]);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}
async function main(tournamentFiles) {
  for (const fil of tournamentFiles) {
    const tournamentId = fil.split("\\")[2];
    console.log(fil, tournamentId);
    const positionTablesByTournament = await getPositionTable(tournamentId);

    const fixtureStageFiles = listFilesRecursive(
      `${toPath}/tournaments/${tournamentId}/fixture-stages`
    ).filter((f) => {
      return /fixture-stages\\[a-z0-9A-Z]+\\data.json/i.test(f);
    });

    for (const fixtureStageFile of fixtureStageFiles) {
      const fixtureStageId = fixtureStageFile.split("\\")[4];

      const intergroupMatchesFiles = listFilesRecursive(
        `${toPath}/tournaments/${tournamentId}/fixture-stages`
      ).filter((f) => {
        return /fixture-stages\\[a-z0-9A-Z]+\\intergroup-matches\\[a-z0-9A-Z]+\\data.json/i.test(
          f
        );
      });
      console.log(intergroupMatchesFiles);
      const intergroupMatches = intergroupMatchesFiles.map((f) => {
        const data = JSON.parse(fs.readFileSync(f));
        return {
          content: [
            data["value"]["match"]["value"]["team-a-id"]["value"],
            data["value"]["match"]["value"]["team-b-id"]["value"],
          ],
          id: f.split("\\")[6],
          file: f,
        };
      });

      console.log("intergroupMatches", intergroupMatches);

      const groupFiles = listFilesRecursive(
        `${toPath}/tournaments/${tournamentId}/fixture-stages`
      ).filter((f) => {
        return /fixture-stages\\[a-z0-9A-Z]+\\groups\\[a-z0-9A-Z]+\\data.json/i.test(
          f
        );
      });

      for (const groupFile of groupFiles) {
        console.log(groupFile);
        const groupId = groupFile.split("\\")[6];
        const matchFiles = listFilesRecursive(
          `${toPath}/tournaments/${tournamentId}/fixture-stages/${fixtureStageId}/groups/${groupId}`
        ).filter((f) => {
          return /fixture-stages\\[a-z0-9A-Z]+\\groups\\[a-z0-9A-Z]+\\matches\\[a-z0-9A-Z]+\\data.json/i.test(
            f
          );
        });

        const matchIds = matchFiles.map((match) => match.split("\\")[8]);

        const groupContent = JSON.parse(fs.readFileSync(groupFile));

        const teamsInGroup = groupContent["value"]["teams"]["value"].map(
          (teams) => teams["value"]
        );

        console.log("Equipos dentro del grupo ", teamsInGroup);

        const intergroupMatchesId = intergroupMatches
          .filter((f) => {
            return (
              teamsInGroup.includes(f.content[0]) ||
              teamsInGroup.includes(f.content[1])
            );
          })
          .map((f) => f.id);

        const fixtureStageTables = positionTablesByTournament[fixtureStageId];
        const groupLabel = groupContent["value"]["label"]["value"];
        const groupPositionTable = fixtureStageTables[groupLabel];
        // console.log(tournamentContent);

        // console.log(groupPositionTable);

        const stadistics1 = groupPositionTable.map((g) => {
          const t = {
            "team-id": g["team"]["id"],
            stadistics: {
              "goals-against": g.goalsAgainst,
              "goals-against-per-match": g.goalsAgainstPerMatch,
              "goals-difference": g.goalsDifference,
              "goals-in-favor": g.goalsInFavor,
              "fair-play": g.fairPlay,
              "lost-matches": g.lostMatches,
              "played-matches": g.playedMatches,
              points: g.points,
              "tied-matches": g.tiedMatches,
              "won-matches": g.wonMatches,
            },
            "was-by-random": false,
          };
          return t;
        });
        const fullIds = [...matchIds, ...intergroupMatchesId];

        const positionTableFull = {
          table: stadistics1,
          "analized-matches": fullIds,
        };

        console.log(positionTableFull);
        console.log();

        groupContent["value"]["positions-table"] =
          parseInformation(positionTableFull);
        fs.writeFileSync(groupFile, JSON.stringify(groupContent, null, 2));
      }
    }
  }
}

main(tournamentFiles);
