import json
import os
import shutil
USERS_FOLDER = './users'
TEAMS_FOLDER = './teams'

def get_team_ids(team_id, members_ids):
  teams = []
  for member_id in members_ids:
    with open(f'{TEAMS_FOLDER}/{team_id}/members/{member_id}/data.json') as f:
      member_id_content = json.load(f)
    team_id = member_id_content['value']['team-id']['value']
    teams.append({
      'team-id': team_id,
      'member-id': member_id,
      'content': member_id_content
    })
  return teams

def get_not_allowed_tournaments():

  teams_id_folders = os.listdir(TEAMS_FOLDER)

  invalids = []
  for team_id_folder in teams_id_folders:
    print('Team ID folder', team_id_folder)
    registered_teams_path = f'{TEAMS_FOLDER}/{team_id_folder}/members'
    if(os.path.exists(registered_teams_path)):
      registered_teams_ids = os.listdir(registered_teams_path)
      team_ids = get_team_ids(team_id_folder,registered_teams_ids)

      for element in team_ids:

        print()
        t = f"{USERS_FOLDER}/{element['content']['value']['user-id']['value']}/teams-participations"
        print(t)
        if(not os.path.exists(t)):
          os.mkdir(t)
        
        y = f"{t}/{element['member-id']}"

        if(not os.path.exists(y)):
          os.mkdir(y)
        
        with open(f'{y}/data.json', 'w') as fh:
          fh.write(json.dumps(element['content'], indent= 2))




  return invalids


res = get_not_allowed_tournaments()

