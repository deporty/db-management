const fs = require("fs");
const http = require("https");

const querystring = require("querystring");
const util = require("util");

const teamsData = "teams.json";
// const apiUrl = "us-central1-deporty-dev.cloudfunctions.net";
const apiUrl = "us-central1-deporty-app.cloudfunctions.net";

const defaultRoleId = "OmUGOqmXbey71Uys1Em2";
const teams = JSON.parse(fs.readFileSync(teamsData));

const results = [];
const promises = [];

const options = {
  hostname: apiUrl,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
};

function request(data, method, path) {
  return new Promise((resolve, reject) => {
    const op = { ...options };
    op.path = path;
    op.method = method;

    const req = http.request(op, (res) => {
      let chunks_of_data = [];
      res.on("data", (fragments) => {
        chunks_of_data.push(fragments);
      });
      res.on("error", (chunk) => {
        reject();
      });
      res.on("end", () => {
        let response_body = JSON.parse(
          Buffer.concat(chunks_of_data).toString()
        );
        resolve(response_body);
      });
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  for (const teamName in teams) {
    const team = {
      name: teamName,
    };
    console.log(team);
    const teamStatus = {};
    teamStatus.team = team;
    const reponseAddTeam = await request(team, "POST", "/teams");

    const code = reponseAddTeam.meta.code;
    teamStatus.meta = reponseAddTeam.meta;
    if (code === "TEAM-POST:SUCCESS") {
      const teamId = reponseAddTeam.data;
      teamStatus.teamId = teamId;
      teamStatus.players = [];
      await createPlayer(teamName, teamId, teamStatus);
    }
    results.push(teamStatus);
  }
  fs.writeFileSync("teams-status.json", JSON.stringify(results, null, 2));
})();
async function createPlayer(teamName, teamId, teamStatus) {
  for (const member of teams[teamName]) {
    const player = member.player;
    const playerTemp = {
      player,
    };
    const responseAddPlayer = await request(player, "POST", "/players");

    const codePlayer = responseAddPlayer.meta.code;
    playerTemp.meta = responseAddPlayer.meta;
    teamStatus.players.push(playerTemp);

    if (codePlayer === "PLAYER-undefined") {
      

      const playerId = responseAddPlayer.data;
      playerTemp.playerId = playerId;



      const responseAsignRole = await request(
        {
          rolesIds: [defaultRoleId],
          userId: playerId,
        },
        "PUT",
        "/users/assign-roles"
      );


      const responseAsignPlayer = await request(
        {
          teamId,
          playerId,
        },
        "PUT",
        "/teams/assign-player"
      );

      const codeAsign = responseAsignPlayer.meta.code;
      if (codePlayer === "TEAM-PLAYER-ASSIGNED:SUCCESS") {
        playerTemp.asign = "SUCCESS";
      } else {
        playerTemp.asign = codeAsign;
      }
    }
  }
}
