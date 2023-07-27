const xlsx = require("node-xlsx");
const fs = require("fs");
const moment = require("moment");
const helpers = require("./helpers");
const uuid = require("uuid");
const BOOK = xlsx.parse(__dirname + "/data.xlsx");

const PLAYERS = [];
const TEAMS = {};
const getSheet = (book, sheetName) => {
  return book
    .filter((sheet) => {
      return sheet["name"] === sheetName;
    })
    .map((sheet) => {
      return sheet["data"];
    })
    .pop();
};

const extractId = (player) => {
  const id = player[0];
  return id.toString();
};

const extractName = (player) => {
  const name = player[1];
  const fragments = name
    .split(" ")
    .map((f) => {
      let temp = f.toLowerCase();
      const first = temp.charAt(0);
      temp = temp.replace(first, first.toUpperCase());
      return temp;
    })
    .filter((f) => {
      return f != "" && f != " ";
    });
  if (fragments.length == 4) {
    return {
      "first-name": fragments[0],
      "second-name": fragments[1],
      "first-last-name": fragments[2],
      "second-last-name": fragments[3],
    };
  } else if (fragments.length == 3) {
    return {
      "first-name": fragments[0],
      "second-name": "",
      "first-last-name": fragments[1],
      "second-last-name": fragments[2],
    };
  } else if (fragments.length == 2) {
    return {
      "first-name": fragments[0],
      "second-name": "",
      "first-last-name": fragments[1],
      "second-last-name": "",
    };
  } else {
    return {
      "first-name": fragments[1],
      "second-name": "",
      "first-last-name": "",
      "second-last-name": "",
    };
  }
};

const extractTeam = (player) => {
  const team = player[2];
  return team;
};

const extractDateOdBirth = (player) => {
  const date = player[3];
  if (date) {
    const today = moment("01-01-1900", "DD-MM-YYYY");
    const bornDate = today.add(date - 2, "days");
    console.log(bornDate.toDate());
    return bornDate;
  }
  return "";
};

const extractInitDate = (player) => {
  const date = player[3];
  if (date) {
    const today = moment("01-01-1900", "DD-MM-YYYY");
    const bornDate = today.add(date - 2, "days");
    return bornDate.valueOf() / 1000;
  }
  return "";
};

const getUUID = () => {
  return uuid.v4().toString().replace(/-/g, "").substring(0, 20);
};

const PLAYERS_SHEET = getSheet(BOOK, "JUGADORES");
for (let row = 1; row < PLAYERS_SHEET.length; row++) {
  const player = PLAYERS_SHEET[row];
  const document = extractId(player);
  const name = extractName(player);
  const team = extractTeam(player);
  const initDate = moment().toDate();

  let formattedPlayer = {
    ...name,
    document: document,
    id: getUUID(),
    roles: ["OmUGOqmXbey71Uys1Em2"],
    alias: "",
    "sports-modalities": {
      soccer: {},
    },
    image: "",
    email: "",
    phone: "",
  };
  // formattedPlayer = { player: formattedPlayer, initDate: initDate };

  PLAYERS.push(formattedPlayer);

  if (team) {
    const index = Object.keys(TEAMS).indexOf(team);
    let teamId = getUUID();
    if (index == -1) {
      TEAMS[team] = {
        members: [],
        players: [],
        data: {
          category: "Open",
          id: teamId,
          name: team,
        },
      };
    } else {
      teamId = TEAMS[team].data.id;
    }
    TEAMS[team].players.push(formattedPlayer);
    TEAMS[team].members.push({
      "user-id": formattedPlayer.id,
      id: getUUID(),
      "init-date": initDate,
      "team-id": teamId,
    });
  }
}

fs.rmdirSync("results", { recursive: true });
fs.mkdirSync("results");

fs.mkdirSync("results/users");
fs.mkdirSync("results/teams");

for (const player of PLAYERS) {
  const id = player.id;
  fs.mkdirSync(`results/users/${id}`);
  fs.writeFileSync(
    `results/users/${id}/data.json`,
    JSON.stringify(helpers.parseInformation(player), null, 2)
  );
}
for (const teamName in TEAMS) {
  if (Object.hasOwnProperty.call(TEAMS, teamName)) {
    const team = TEAMS[teamName];

    const teamId = team.data.id;
    fs.mkdirSync(`results/teams/${teamId}`);
    fs.writeFileSync(
      `results/teams/${teamId}/data.json`,
      JSON.stringify(helpers.parseInformation(team.data), null, 2)
    );

    for (const member of team.members) {
      const memberId = member.id;
      if(!fs.existsSync(`results/teams/${teamId}/members`)){

        fs.mkdirSync(`results/teams/${teamId}/members`);
      }
      fs.mkdirSync(`results/teams/${teamId}/members/${memberId}`);
      fs.writeFileSync(
        `results/teams/${teamId}/members/${memberId}/data.json`,
        JSON.stringify(helpers.parseInformation(member), null, 2)
      );
    }
  }
}

fs.writeFileSync("players.json", JSON.stringify(PLAYERS, null, 2));
fs.writeFileSync("teams.json", JSON.stringify(TEAMS, null, 2));
