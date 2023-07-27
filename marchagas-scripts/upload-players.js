const fs = require("fs");
const http = require("https");
const querystring = require("querystring");

const playersData = "players.json";
const apiUrl = "us-central1-deporty-app.cloudfunctions.net";

const players = JSON.parse(fs.readFileSync(playersData));

const results = [];
const promises = [];

const options = {
  hostname: apiUrl,
  path: "/players",
  method: "POST",
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
};

for (const player of players) {
  upload(player);
  break
}
Promise.all(promises).then(() => {
  fs.writeFileSync("players-status.json", JSON.stringify(results, null, 2));
});
function upload(player) {
  promises.push(
    new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let chunks_of_data = [];

        res.on("data", (fragments) => {
          chunks_of_data.push(fragments);
        });

        res.on("error", (chunk) => {
          console.log(`Error: ${chunk}`);
          reject();
        });
        res.on("end", () => {
          let response_body = JSON.parse(
            Buffer.concat(chunks_of_data).toString()
          );
          results.push({
            player,
            res: response_body,
          });
          resolve();
        });
      });

      req.write(JSON.stringify(player.player));
      req.end();
    })
  );
}
