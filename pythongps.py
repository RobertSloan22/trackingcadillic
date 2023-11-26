import requests
import json

def get_location():
    response = requests.get('https://ipinfo.io')
    data = json.loads(response.text)
    return data['loc']

while True:
    location = get_location()
    # Send the data to your server
    requests.post('http://localhost:3000', data={'loc': location})