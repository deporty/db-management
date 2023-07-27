const { a } = require("./01 - add-references");


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

  a();