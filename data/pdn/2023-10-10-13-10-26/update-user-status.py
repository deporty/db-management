import json
import os
import shutil
TEAMS_FOLDER = './users'
# administrationMode

user_ids = os.listdir(TEAMS_FOLDER)

for user in user_ids:
  print(user)
  with open(f'{TEAMS_FOLDER}/{user}/data.json', 'r', encoding='utf-8') as f:
    content = json.load(f)
  content['value']['administration-mode'] = {
    'value': 'self-managed',
    'type': 'string'
  }
  with open(f'{TEAMS_FOLDER}/{user}/data.json', 'w' , encoding='utf-8') as f:
    f.write(json.dumps(content, indent=2))

