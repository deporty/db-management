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

function chooseWinner(match) {
  const score = match["value"]["match"]["value"]["score"];
  if (score) {
    const teamA = score["value"]["team-a"];
    const teamB = score["value"]["team-B"];
    let dataA = 0;
    if (teamA) {
      dataA = teamA["value"];
    }
    let dataB = 0;
    if (teamB) {
      dataB = teamB["value"];
    }

    if (dataA > dataB) {
      return ["team-a-id", "team-b-id"];
    } else {
      return ["team-b-id", "team-a-id"];
    }
  }
}

async function main(tournamentFiles) {
  for (const fil of tournamentFiles) {
    const tournamentId = fil.split("\\")[2];

    const tournamentContent = JSON.parse(fs.readFileSync(fil));
    const mainDraw = listFilesRecursive(
      `${toPath}/tournaments/${tournamentId}/main-draw`
    ).filter((f) => {
      return /tournaments\\[a-z0-9A-Z]+\\main-draw\\[a-z0-9A-Z]+\\data.json/i.test(
        f
      );
    });

    const contents = mainDraw.map((x) => {
      return JSON.parse(fs.readFileSync(x));
    });

    const final = contents
      .filter((x) => {
        return x["value"]["level"]["value"] == 0;
      })
      .pop();

    const thirdFourth = contents
      .filter((x) => {
        return x["value"]["level"]["value"] == 0.5;
      })
      .pop();

    const podium = [];

    if (final) {
      // console.log(
      //   "--------------------------------------------------------------"
      // );
      // console.log("Final");
      // console.log(final);
      const winner = chooseWinner(final);

      if (winner) {
        const temp1 = final["value"]["match"]["value"][winner[0]];
        const temp2 = final["value"]["match"]["value"][winner[1]];
        if (temp1) {
          podium.push({
            type: "string",
            value: temp1["value"],
          });
        }
        if (temp2) {
          podium.push({
            type: "string",
            value: temp2["value"],
          });
        }
      }

      // console.log(winner);
      // console.log(
      //   "--------------------------------------------------------------"
      // );
    }
    if (thirdFourth) {
      // console.log(
      //   "--------------------------------------------------------------"
      // );
      // console.log("Tercero ");
      // console.log(thirdFourth["value"]["match"]["value"]);
      const winner = chooseWinner(thirdFourth);
      if (winner) {
        const temp = thirdFourth["value"]["match"]["value"][winner[0]];
        if (temp) {
          podium.push({
            type: "string",
            value: temp["value"],
          });
        }
      }
      // console.log(winner);
      // console.log(
      //   "--------------------------------------------------------------"
      // );
    }

    tournamentContent['value']['podium'] = {
      type: "Array",
      value: podium
    }
    fs.writeFileSync(fil, JSON.stringify(tournamentContent, null, 2));
  }
}

main(tournamentFiles);
