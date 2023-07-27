const fs = require("fs");

const path = "tournaments";

const response = [];

function isFolder(path) {
  return path.split(".").length === 1;
}

function transform(path) {
  const content = fs.readFileSync(path, {
    encoding: 'utf-8'
  });
  if (!content["type"] && !content["value"]) {
    const newContent = {
      type: "object",
      value: {
        team: JSON.parse(content),
      }
    };
    console.log(newContent);
    // fs.writeFileSync(path, JSON.stringify(newContent, null, 2));
  }
}
function getFilesToTransform(path, response) {
  const files = fs.readdirSync(path);
  for (const file of files) {
    const pathFile = `${path}/${file}`;
    const pattern =
      /groups\/[a-zA-Z0-9]+\/teams\/[a-zA-Z0-9]+\/data\.json/g;
    const result = pattern.exec(pathFile);
    console.log(result,pathFile);
    if (result) {
      response.push(pathFile);
      transform(pathFile);
    }
    if (isFolder(pathFile)) {
      getFilesToTransform(pathFile, response);
    }
  }
}

getFilesToTransform(path, response);

fs.writeFileSync("galatea-results.json", JSON.stringify(response, null, 2));
