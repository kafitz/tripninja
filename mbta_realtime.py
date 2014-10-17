import requests 
import json

mbta_key = 'wX9NwuHnZU2ToO7GmGR9uw'
base_url = 'http://realtime.mbta.com/developer/api/v2/{}'

def update(endpoint, extra_params=None):
    parameters = {
        'api_key': mbta_key,
        'format': 'json'
    }
    if extra_params:
        parameters.update(extra_params)
    url = base_url.format(endpoint)
    print url
    response = requests.get(url, params=parameters)
    if response.status_code == 200:
        return json.loads(response.text)
    else:
        return None

routes = update('routes')
