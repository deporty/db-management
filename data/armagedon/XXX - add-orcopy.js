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

const teams = listFilesRecursive(`${toPath}/users`).filter((f) => {
  const res = patterns[0].test(f);
  return res;
});

const USER_DATA = {
  type: "object",
  value: {
    document: {
      type: "string",
      value: "6665554441",
    },
    email: {
      type: "string",
      value: "referee@gmail.com",
    },
    alias: {
      type: "string",
      value: "",
    },
    roles: {
      type: "Array",
      value: [
        {
          type: "string",
          value: "iThJqDkoVhcnRcGGvRru",
        },
      ],
    },
    image: {
      type: "string",
      value: "",
    },
    phone: {
      type: "string",
      value: "",
    },
    "first-name": {
      value: "Edgar",
      type: "string",
    },
    "second-name": {
      value: "Vladimir",
      type: "string",
    },
    "first-last-name": {
      value: "Restrepo",
      type: "string",
    },
    "second-last-name": {
      value: "Ariza",
      type: "string",
    },
  },
};

const id = 'a2f1ad7b8a064c3b9153';

const folderPath = `${toPath}/users/${id}`;

const userPath = `${folderPath}/data.json`;

fs.mkdirSync(folderPath);

fs.writeFileSync(userPath, JSON.stringify(USER_DATA, null, 2));
