const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const fromPath = "../dev/2022-12-13-21-55-40";

const fromPattern = /[a-z0-9A-Z]+\\data.json/i;

const toPath = "target";

const matchFilesPattern = /[a-z0-9A-Z]+\\data.json/i;

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

const matchFiles = listFilesRecursive(`${toPath}/locations`).filter((f) =>
  matchFilesPattern.test(f)
);

const meta = {
  Fl8q6kAyHiAxPEfCnp0c: {
    latitude: 5.058446652100415,
    longitude: -75.51087207312828,
    address: "Cl. 47 #37a88",
  },
  IE4qNsCVvLcDmAb6dRc3: {
    latitude: 5.057068817359157,
    longitude: -75.48894884429623,
    address: "",
  },
  P8sds0iDJaem6eVMJocY: {
    latitude: 5.042007131541637,
    longitude: -75.49914224984579,
    address: "Cra. 42 #722",
  },
  XmPL0Gaia6p4a6mxOJ1X: {
    latitude: 5.056189365801711,
    longitude: -75.47996813080327,
    address: "Cra. 17 #6767",
  },
  bhq0R8ThmxrN5jf5hhcV: {
    latitude: 5.030534087437448,
    longitude: -75.46390433068554,
    address: "",
  },
  gpFqyEIQdovjkop76ZfJ: {
    latitude: null,
    longitude: null,
    address: "",
  },
  kBystvg9Ni60jF799QgK: {
    latitude: 5.057689912396549,
    longitude: -75.49276537353865,
    address: "Cra. 25 #626",
  },
};
for (const fil of matchFiles) {
  const fragments = fil.split("\\");
  console.log(fragments);
  const locationId = fragments[2];
  const metaData = meta[locationId];

  const matchContent = JSON.parse(fs.readFileSync(fil));
  if (metaData["latitude"]) {
    matchContent["value"]["coordinate"] = {
      type: "GeoPoint",
      value: {
        latitude: metaData["latitude"],

        longitude: metaData["longitude"],
      },
    };
  }
  if (metaData["address"]) {
    matchContent["value"]["address"] = {
      type: "string",
      value: metaData["address"],
    };
  }
  console.log(matchContent, fil);

  fs.writeFileSync(fil, JSON.stringify(matchContent, null, 2));
}
2023;
