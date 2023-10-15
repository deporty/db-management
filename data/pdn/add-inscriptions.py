import json
import os
import shutil
TEAMS_FOLDER = './teams'
TOURNAMENTS_FOLDER = './tournaments'

def get_team_ids(tournament_id, registered_teams_ids):
  teams = []
  for registered_teams_id in registered_teams_ids:
    with open(f'{TOURNAMENTS_FOLDER}/{tournament_id}/registered-teams/{registered_teams_id}/data.json') as f:
      registered_teams_id_content = json.load(f)
    team_id = registered_teams_id_content['value']['team-id']['value']
    teams.append({
      'team-id': team_id,
      'registered-team-id': registered_teams_id,
      'content': registered_teams_id_content
    })
  return teams

def get_not_allowed_tournaments():

  tournament_id_folders = os.listdir(TOURNAMENTS_FOLDER)

  invalids = []
  for tournament_id_folder in tournament_id_folders:
    print('Tournament ID folder', tournament_id_folder)
    registered_teams_path = f'{TOURNAMENTS_FOLDER}/{tournament_id_folder}/registered-teams'
    if(os.path.exists(registered_teams_path)):
      registered_teams_ids = os.listdir(registered_teams_path)
      team_ids = get_team_ids(tournament_id_folder,registered_teams_ids)

      for team_id in team_ids:

        print()
        print()
        t = f"{TEAMS_FOLDER}/{team_id['team-id']}/tournament-inscriptions"
        if(not os.path.exists(t)):
          os.mkdir(t)
        
        y = f"{t}/{team_id['registered-team-id']}"

        if(not os.path.exists(y)):
          os.mkdir(y)
        
        with open(f'{y}/data.json', 'w') as fh:
          fh.write(json.dumps(team_id['content'], indent= 2))




  return invalids


res = get_not_allowed_tournaments()

