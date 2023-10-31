const fs = require('fs');
const path = require('path');
const fromPath = './tournaments';

const fromPattern = /tournaments\\[a-z0-9A-Z]+\\fixture-stages\\[a-z0-9A-Z]+\\data.json/i;

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

const matchFiles = listFilesRecursive(fromPath).filter((f) => fromPattern.test(f));

console.log(matchFiles);

for (const tournament of matchFiles) {
  const fragments = tournament.split('\\');
  const tournamentId = fragments[1];
  const fixtureStageId = fragments[3];
  const intergroupMatches = `tournaments\\${tournamentId}\\fixture-stages\\${fixtureStageId}\\intergroup-matches`;

  if (fs.existsSync(intergroupMatches)) {
    const groupFiles = `tournaments\\${tournamentId}\\fixture-stages\\${fixtureStageId}\\groups`;
    const integroups = listFilesRecursive(intergroupMatches).filter((f) => /[a-z0-9A-Z]+\\data.json/i.test(f));
    const groups = listFilesRecursive(groupFiles).filter((f) =>
      /tournaments\\[a-z0-9A-Z]+\\fixture-stages\\[a-z0-9A-Z]+\\groups\\[a-z0-9A-Z]+\\data.json/i.test(f)
    );
    const groupContents = groups.map((group) => {
      return {
        path: group,
        content: JSON.parse(fs.readFileSync(group, { encoding: 'utf8' })),
      };
    });
    for (const integroup of integroups) {
      const intergroupContent = JSON.parse(
        fs.readFileSync(integroup, {
          encoding: 'utf8',
        })
      );

      const teamAId = intergroupContent['value']['match']['value']['team-a-id']['value'];
      const teamBId = intergroupContent['value']['match']['value']['team-b-id']['value'];
      const teamAGroup = groupContents

        .filter((data) => {
          return data['content']['type'] != 'undefined';
        })
        .filter((group) => {
          const data = group['content'];
          const teamsIds = data['value']['teams']['value'];
          return teamsIds
            .map((team) => {
              return team['value'];
            })
            .includes(teamAId);
        });
      const teamBGroup = groupContents

        .filter((data) => {
          return data['content']['type'] != 'undefined';
        })
        .filter((group) => {
          const data = group['content'];

          const teamsIds = data['value']['teams']['value'];
          return teamsIds
            .map((team) => {
              return team['value'];
            })
            .includes(teamBId);
        });

      console.log(' - ', teamAId, teamBId);

      const getGroupId = (data) => data['path'].split('\\')[5];
      console.log(getGroupId(teamAGroup[0]));
      console.log(getGroupId(teamBGroup[0]));
      console.log(' --- ');

      intergroupContent['value']['team-a-group-id'] = {
        type: 'string',
        value: getGroupId(teamAGroup[0]),
      };
      intergroupContent['value']['team-b-group-id'] = {
        type: 'string',
        value: getGroupId(teamBGroup[0]),
      };

      console.log(integroup);
      console.log(intergroupContent);
      fs.writeFileSync(integroup, JSON.stringify(intergroupContent, null, 2));
    }
  }

  // const tournamentPath = tournament.replace('\\data.json','')
  // const fixtureStageFiles = listFilesRecursive(`${tournamentPath}`).filter((f) =>
  // fromPattern.test(f)
  // );
}
