import json
import os
import shutil
TEAMS_FOLDER = './teams'

def get_user_ids_of_team(team_id):
  member_ids = os.listdir(f'{TEAMS_FOLDER}/{team_id}/members')
  users = []
  for member_id in member_ids:
    with open(f'{TEAMS_FOLDER}/{team_id}/members/{member_id}/data.json') as f:
      member_content = json.load(f)

    user_id = member_content['value']['user-id']['value']
    users.append(user_id)


  return users

def get_not_allowed_teams():
  team_id_folders = os.listdir(TEAMS_FOLDER)
  invalids = []
  for team_id_folder in team_id_folders:
    route = f'{TEAMS_FOLDER}/{team_id_folder}/data.json'
    with open(route,'r') as t: 
      content = json.load(t)
    
    if('shield' not in content['value']):
      print(':: ', team_id_folder)

      users = get_user_ids_of_team(team_id_folder)

      invalids.append({
        'route': f'{TEAMS_FOLDER}/{team_id_folder}',
        'teamId': team_id_folder,
        'users': users
      })
  
  # res  = list(
  #   lambda x: x
  # )
  return invalids


res = get_not_allowed_teams()

print(json.dumps(res, indent=4))
with open('data.json', 'w') as f:
  f.write(json.dumps(res, indent=2))

for team in res:
  print('Removiendo ', team['route'])
  shutil.rmtree(team['route'])
  for user in team['users']:
    print('Removiendo ', f"./users/{user}")
    shutil.rmtree(f"./users/{user}" )
