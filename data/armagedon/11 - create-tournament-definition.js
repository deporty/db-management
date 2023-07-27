const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const patterns = [/users\\[a-z0-9A-Z]+\\data.json/i];

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



const TOURNAMENT_LAYOUT = {
  type: "object",
  value: {
    flayer: {
      type: "string",
      value: "",
    },
    name: {
      type: "string",
      value: "Copa Ciudad Manizales",
    },
    description: {
      type: "string",
      value: `Copa Ciudad de Manizales
      Deportes y recreación`,
    },
    tags: {
      type: "Array",
      value: [],
    },

    categories: {
      type: "Array",
      value: [
        {
          type: "string",
          value: "Sub 9",
        },
        {
          type: "string",
          value: "Sub 11",
        },
        {
          type: "string",
          value: "Sub 13",
        },
        {
          type: "string",
          value: "Sub 15",
        },
        {
          type: "string",
          value: "Sub 17",
        },
      ],
    },

    "organization-id": {
      type: "string",
      value: "Wsib20rGNlTR2UsU42eY",
    },
  },
};

const id = "155b473c8db7486f995d";

const tournamentLayoutPath = `${toPath}/organizations/Wsib20rGNlTR2UsU42eY/tournament-layouts`;
const tournamentLayoutIdPath = `${tournamentLayoutPath}/${id}`;

const userPath = `${tournamentLayoutIdPath}/data.json`;

fs.mkdirSync(tournamentLayoutPath);
fs.mkdirSync(tournamentLayoutIdPath);

fs.writeFileSync(userPath, JSON.stringify(TOURNAMENT_LAYOUT, null, 2));
