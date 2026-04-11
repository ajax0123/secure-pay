import json
import urllib.request
import urllib.error
import sys
url = 'http://127.0.0.1:5000/api/auth/login'
data = json.dumps({'email':'testlogin_20260410003013@example.com','password':'password123'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as resp:
        print('status', resp.status)
        print(resp.read().decode())
except urllib.error.HTTPError as e:
    sys.stdout.write('status ' + str(e.code) + '\n')
    sys.stdout.write(e.read().decode() + '\n')
except Exception as e:
    print('error', e)
