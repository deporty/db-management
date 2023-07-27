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

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const teams = listFilesRecursive(`${toPath}/users`).filter((f) => {
  const res = patterns[0].test(f);
  return res;
});

for (const fil of teams) {
  console.log();
  console.log(fil);
  const userData = JSON.parse(fs.readFileSync(fil));

  const name = userData["value"]["name"];
  const lastName = userData["value"]["last-name"];
  console.log(name, ".", lastName);
  let firstName = "";
  let secondName = "";
  let firstLastName = "";
  let secondLastName = "";

  if (name) {
    const nameValue = toTitleCase(name["value"].trim());
    const nameFragments = nameValue
      .split(" ")
      .filter((x) => x != " " && x != "");

    if (nameFragments.length == 2) {
      firstName = nameFragments[0];
      secondName = nameFragments[1];
    } else if (nameFragments.length == 1) {
      firstName = nameFragments[0];
    }
  }
  if (lastName) {
    const lastNameValue = toTitleCase(lastName["value"].trim());
    const lastNameFragments = lastNameValue
      .split(" ")
      .filter((x) => x != " " && x != "");
    console.log(lastNameFragments);
    if (lastNameFragments.length == 2) {
      firstLastName = lastNameFragments[0];
      secondLastName = lastNameFragments[1];
    } else if (lastNameFragments.length == 1) {
      firstLastName = lastNameFragments[0];
    }
  }

  console.log(`${firstName}-${secondName}-${firstLastName}-${secondLastName}`);
  console.log();

  delete userData["value"]["name"];
  delete userData["value"]["last-name"];

  userData["value"]["first-name"] = { value: firstName, type: "string" };
  userData["value"]["second-name"] = { value: secondName, type: "string" };
  userData["value"]["first-last-name"] = {
    value: firstLastName,
    type: "string",
  };
  userData["value"]["second-last-name"] = {
    value: secondLastName,
    type: "string",
  };

  // console.log(JSON.stringify(userData,null,2));
  fs.writeFileSync(fil, JSON.stringify(userData, null, 2));
}
