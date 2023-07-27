const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const matchFilesPattern = [
  /[a-z0-9A-Z]+\\main-draw\\[a-z0-9A-Z]+\\data.json/i,
  /[a-z0-9A-Z]+\\fixture-stages\\[a-z0-9A-Z]+\\intergroup-matches\\[a-z0-9A-Z]+\\data.json/i,
  /[a-z0-9A-Z]+\\fixture-stages\\[a-z0-9A-Z]+\\groups\\[a-z0-9A-Z]+\\matches\\[a-z0-9A-Z]+\\data.json/i,
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

const matchFiles = listFilesRecursive(`${toPath}/tournaments`).filter((f) => {
  const res =
    matchFilesPattern[0].test(f) ||
    matchFilesPattern[1].test(f) ||
    matchFilesPattern[2].test(f);


  return res;
});

let counter = 0;
for (const fil of matchFiles) {
  if (fil.indexOf("main-draw") > -1) {
    console.log(fil);
  }
  const fragments = fil.split("\\");
  const matchContent = JSON.parse(fs.readFileSync(fil));
  if (fil.indexOf("intergroup") > -1 || fil.indexOf("main-draw") > -1) {
    newFunction(matchContent, "team-a",'match', fil);
    newFunction(matchContent, "team-b", "match", fil);
  } else {
    newFunction(matchContent, "team-a", null, fil);
    newFunction(matchContent, "team-b", null, fil);
  }

  // console.log(matchContent);

  fs.writeFileSync(fil, JSON.stringify(matchContent, null, 2));

  counter++;
  //   }
}
function newFunction(matchContent, team, prefix, p) {
  const news = [];
  let match = matchContent["value"];

  if (prefix) {
    match = match[prefix]['value'];
  }

  if (match["stadistics"]) {
    for (const item of match["stadistics"]["value"][team]["value"]) {
      if (item["value"]["total-goals"]["type"] !== "number") {
        item["value"]["total-goals"]["value"] = 0;
        item["value"]["total-goals"]["type"] = "number";
      }
      if (item["value"]["total-yellow-cards"]["type"] !== "number") {
        item["value"]["total-yellow-cards"]["value"] = 0;
        item["value"]["total-yellow-cards"]["type"] = "number";
      }
      if (item["value"]["total-red-cards"]["type"] !== "number") {
        item["value"]["total-red-cards"]["value"] = 0;
        item["value"]["total-red-cards"]["type"] = "number";
      }
      const goals = item["value"]["goals"]["value"];
      const yellowCards = item["value"]["yellow-cards"]["value"];
      const redCards = item["value"]["red-cards"]["value"];
      const totalGoals = item["value"]["total-goals"]["value"];
      const totalYellowCards = item["value"]["total-yellow-cards"]["value"];
      const totalRedCards = item["value"]["total-red-cards"]["value"];
      if (p.indexOf("4XHTy8RXs72cZYXFi88f") > -1) {
        console.log(p);
        console.log(
          goals,
          redCards,
          yellowCards,
          totalGoals,
          totalYellowCards,
          totalRedCards
        );
        console.log(goals.length, redCards.length, yellowCards.length);
      }

      if (
        !(
          totalGoals == 0 &&
          totalYellowCards == 0 &&
          totalRedCards == 0 &&
          goals.length == 0 &&
          yellowCards.length == 0 &&
          redCards.length == 0
        )
      ) {
        news.push(item);
      } else {
        console.log("Se elimina");
      }
    }
    match["stadistics"]["value"][team]["value"] = news;
  } else {
    console.log("No tiene");
  }
}
