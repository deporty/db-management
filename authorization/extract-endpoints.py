from functools import reduce
import os
import glob
import json
import re
from pprint import pprint
import uuid
controller_folders = '../../server/functions/src'
exceptions = ['core', 'environments']

regex = re.compile('app.(get|put|post|delete|patch)\([`\'"]([\/a-zA-Z0-9:]+)[`\'"],')
folders = list(filter(lambda x: exceptions.count(x) == 0, os.listdir(controller_folders)))
print(folders)
endpoints = []
for folder in folders:
    folder_path = f'{controller_folders}/{folder}'
    if(os.path.isdir(folder_path)):
        path = f'{folder_path}/**/*.controller.ts'
        controller = glob.glob(path)
        if(len(controller) > 0):
            with open(controller[0], 'r', encoding='utf-8') as t:
                content = t.read()
            result = regex.findall(content)
            for i in result:
                endpoints.append(
                    {
                        'controller': controller[0].split('\\').pop().split('.')[0],
                        'method': i[0],
                        'path': i[1],

                    }
                )

resources = []
for endpoint in endpoints:
    sufix = ''
    if(endpoint['path'] == '/:id'):
        sufix = 'ById'
    else:
        rep = re.sub('/:[a-z]+','',endpoint['path'])
        frag = list(filter(lambda x: x!='',rep.split('/')))
        sufix = 'By' if len(frag) > 0 else ''
        print(frag)
        for u in frag:
            print(u,7)
            if(u != '' and u != '/' and u != ' ' and u != '\t' ):
                sufix = sufix +u.capitalize()
    name = endpoint['method'].capitalize()+endpoint['controller'].capitalize()+sufix
    resources.append(name)
pprint(resources)
with open('identifiers.json', 'w', encoding='utf-8') as t:
    json.dump(resources,t, indent=2)
data = []
for identifier in resources:
    data.append({
        'name': identifier,
        'id': str(uuid.uuid4()).replace('-','')[:20]
    })

with open('data/resources.json', 'w', encoding='utf-8') as t:
    json.dump(data,t, indent=2)
