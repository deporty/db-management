const fs = require('fs');

const root = 'today';
const strongEntity = 'teams';
const subStrongEntity = 'members';

const weakEntity = 'users';
const subWeakEntity = 'teams-participations';
// const strongEntity = 'tournaments';
// const subStrongEntity = 'registered-teams';

// const weakEntity = 'teams';
// const subWeakEntity = 'tournament-inscriptions';

function main() {
  const teams = fs.readdirSync(`${root}/${strongEntity}`);
  const response = [];
  for (const team of teams) {
    const members = fs.readdirSync(`${root}/${strongEntity}/${team}/${subStrongEntity}`);

    for (const member of members) {
      const data = JSON.parse(fs.readFileSync(`${root}/${strongEntity}/${team}/${subStrongEntity}/${member}/data.json`));
      const userId = data['value']['user-id']['value'];
      // const initDate = data['value']['init-date']['value'];

      const alfa = {
        position: data['value']['position'] ? data['value']['position']['value'] : undefined,
        initDate:
          data['value']['init-date'] && Object.keys(data['value']['init-date']['value']).length > 0
            ? data['value']['init-date']['value']
            : undefined,
        number:
          data['value']['number'] && Object.keys(data['value']['number']['value']).length > 0
            ? data['value']['number']['value']
            : undefined,
        kindMember: data['value']['kind-member'] ? data['value']['kind-member']['value'] : undefined,
        enrollmentDate: data['value']['enrollment-date'] ? data['value']['enrollment-date']['value'] : undefined,
      };
      // const dateFragmentInRegisteredTeam = initDate.split('T')[0];

      const teamPath = `${root}/${weakEntity}/${userId}`;

      const rightTournamentInscription = `${teamPath}/${subWeakEntity}/${member}`;
      if (fs.existsSync(rightTournamentInscription)) {
        // console.log('ya existe, no se crea nada nuevo');
      } else {
        const teamsParticipationsPath = `${teamPath}/${subWeakEntity}`;

        if (fs.existsSync(teamsParticipationsPath)) {
          const teamsParticipations = fs.readdirSync(teamsParticipationsPath);
          const found = [];
          for (const teamParticipation of teamsParticipations) {
            const tournamentInscriptionData = JSON.parse(fs.readFileSync(`${teamsParticipationsPath}/${teamParticipation}/data.json`));
            // const enrollmentDate = tournamentInscriptionData['value']['init-date']['value'];
            // const dateFragment = enrollmentDate.split('T')[0];

            const beta = {
              position: tournamentInscriptionData['value']['position']
                ? tournamentInscriptionData['value']['position']['value']
                : undefined,
              initDate:
                tournamentInscriptionData['value']['init-date'] &&
                Object.keys(tournamentInscriptionData['value']['init-date']['value']).length > 0
                  ? tournamentInscriptionData['value']['init-date']['value']
                  : undefined,
              number:
                tournamentInscriptionData['value']['number'] &&
                Object.keys(tournamentInscriptionData['value']['number']['value']).length > 0
                  ? tournamentInscriptionData['value']['number']['value']
                  : undefined,
              kindMember: tournamentInscriptionData['value']['kind-member']
                ? tournamentInscriptionData['value']['kind-member']['value']
                : undefined,
              enrollmentDate: tournamentInscriptionData['value']['enrollment-date']
                ? tournamentInscriptionData['value']['enrollment-date']['value']
                : undefined,
            };

            if (alfa.initDate == beta.initDate && beta.number == beta.number && beta.position == beta.position) {
              // if (dateFragment == dateFragmentInRegisteredTeam) {
              found.push({
                teamParticipationPath: `${teamsParticipationsPath}/${teamParticipation}/data.json`,
                // tournamentInscriptionData,
                memberPath: `${root}/${strongEntity}/${team}/${subStrongEntity}/${member}/data.json`,
                memberId: member,
                teamParticipationId: teamParticipation,
                userId: userId,
                teamId: team,
              });
            }
          }

          if (found.length == 2) {
            response.push({
              found,
              kind: 2,
            });
          } else if (found.length == 0) {
            response.push({
              kind: 0,
              memberPath: `${root}/${strongEntity}/${team}/${subStrongEntity}/${member}/data.json`,

              memberId: member,
              userId: userId,
              teamId: team,
            });
          } else {
            const t = found[0];
            response.push({
              kind: found.length,
              found,
            });
          }
        } else {
          response.push({
            emptyFolder: true,
            memberPath: `${root}/${strongEntity}/${team}/${subStrongEntity}/${member}/data.json`,

            memberId: member,
            userId: userId,
            tournamentId: team,
          });
        }
      }
    }
  }
  fs.writeFileSync('result.json', JSON.stringify(response, null, 2));
}

function organizeKindEmpty() {
  const data = JSON.parse(fs.readFileSync('result.json'));

  const kindZero = data.filter((item) => item.emptyFolder);

  for (const kindItem of kindZero) {
    const registeredTeamData = fs.readFileSync(kindItem.memberPath);
    const memberId = kindItem.memberId;
    const userId = kindItem.userId;

    const tournamentInscriptionPath = `${root}/${weakEntity}/${userId}/${subWeakEntity}`;

    if (!fs.existsSync(tournamentInscriptionPath)) {
      fs.mkdirSync(tournamentInscriptionPath);
    }

    const temp = `${tournamentInscriptionPath}/${memberId}`;

    if (!fs.existsSync(temp)) {
      fs.mkdirSync(temp);
    }
    fs.writeFileSync(`${temp}/data.json`, registeredTeamData);
  }
}

function deleteFolder(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      let curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
function deleteSubWeakEntity() {
  const users = fs.readdirSync(`${root}/${weakEntity}`);
  for (const user of users) {
    const p = `${root}/${weakEntity}/${user}/${subWeakEntity}`;
    deleteFolder(p);
  }
}
function organizeKind0() {
  const data = JSON.parse(fs.readFileSync('result.json'));

  const kindZero = data.filter((item) => item.kind == 0);

  for (const kindItem of kindZero) {
    const registeredTeamData = fs.readFileSync(kindItem.registeredTeamPath);
    const memberId = kindItem.memberId;
    const teamId = kindItem.teamId;

    const tournamentInscriptionPath = `${root}/${weakEntity}/${teamId}/${subWeakEntity}`;

    if (!fs.existsSync(tournamentInscriptionPath)) {
      fs.mkdirSync(tournamentInscriptionPath);
    }

    const temp = `${tournamentInscriptionPath}/${memberId}`;

    fs.mkdirSync(temp);
    fs.writeFileSync(`${temp}/data.json`, registeredTeamData);
  }
}

function organizeKind1() {
  const data = JSON.parse(fs.readFileSync('result.json'));

  const kindZero = data.filter((item) => item.kind == 1);

  for (const kindItem of kindZero) {
    const foundData = kindItem.found[0];

    const registeredTeamData = fs.readFileSync(foundData.registeredTeamPath);
    const memberId = foundData.memberId;
    const teamId = foundData.teamId;
    const tournamentInscriptionPath = foundData.tournamentInscriptionPath;

    fs.unlinkSync(tournamentInscriptionPath);
    const subFolder = tournamentInscriptionPath.replace('/data.json', '');

    fs.rmdirSync(subFolder);
    const fragments = tournamentInscriptionPath.split('/');
    const newPath = fragments.splice(0, fragments.length - 2).join('/');
    // console.log(newPath);
    const temp = `${newPath}/${memberId}`;

    fs.mkdirSync(temp);
    fs.writeFileSync(`${temp}/data.json`, registeredTeamData);
  }
}

// organizeKind0();
// organizeKind1();
organizeKindEmpty();
// deleteSubWeakEntity();
main();
