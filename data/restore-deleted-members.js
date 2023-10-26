const fs = require('fs');
const path = require('path');

const PDN_TEAMS = 'pdn/2023-10-26-13-53-21/teams';
const BACKUP_TEAMS = 'dev/2023-10-24-16-07-05/teams';

///Equipos eliminados por los profesores

/// 0cYjNe9AIFbdn7S98I97 - Holocausto Norte SUB 15
/// 1uFexPkLtA2EzxTHdrLA - Caterpillar Motor SUB 11 (Andrea) [status - deleted]
/// iAwHUoxblfazUZjPpeCd - Asofutbol SUB 11 (Gerson Mayo - 3122573482) Elimino y creo Deportes Caldas Futbol Club
const teamExceptions = [
  'DxGxwNaBJ3ntJMiIThpv',
  'FWs6ukrRtWav0UeWgG9E',
  'hHVKTHI1GmHZWINR9GIH',
  'KBvVIwPNtecfB7ZSemZ8',
  'osMNC6l9zDq8albWyoTo',
  'Pfp8mfbkHnqPD9R8N1Vr',
  'tuTvY3pJh5XI3wRLt1ag',
  'WRPtijJtDPzotPZ1deSp',
  'yB78vMrNqYIDe0OnE0YE',
  'yFqhVKUcykGRlX59JDMU',
  'ymCcqZkug8yLUU9cG1Sy',
  'zqWkqEwuBUup4Uxz1Xhb',
];

function listTeams(dir) {
  const response = fs.readdirSync(dir);
  return response;
}

PDN_TEAM_IDS = listTeams(PDN_TEAMS);
BACKUP_TEAM_IDS = listTeams(BACKUP_TEAMS);


const deletedTeams = BACKUP_TEAM_IDS.filter((id) => {
  return !PDN_TEAM_IDS.includes(id) && !teamExceptions.includes(id);
});


console.log('Equipos eliminados ', deletedTeams);


for (const teamId of PDN_TEAM_IDS) {
  // No toma encuenta los equipos nuevos que se encuentran en PDN (COPA V3)
  if (BACKUP_TEAM_IDS.includes(teamId)) {

    if (fs.existsSync(`${PDN_TEAMS}/${teamId}/members`)) {
      const pdn_members = fs.readdirSync(`${PDN_TEAMS}/${teamId}/members`);
      const backup_members = fs.readdirSync(`${BACKUP_TEAMS}/${teamId}/members`);

      if (pdn_members.length != backup_members.length) {
        console.log('Diferentes ', pdn_members.length - backup_members.length);
      }
    }else{
      console.log('No existe', `${PDN_TEAMS}/${teamId}/members`);
    }
  }
}
