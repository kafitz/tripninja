#!/usr/bin/env python
# Kyle Fitzsimmons, 2014
from flask import Flask, render_template, jsonify, json
from werkzeug.contrib.cache import SimpleCache
from urllib2 import HTTPError
import gtfs_database as gdb

import time

app = Flask(__name__)
cache = SimpleCache()

@app.route("/")
def hello():
    t0 = time.time()
    routes = gdb.get_trips_now()
    route_nums = sorted(routes.keys())
    cache.set('routes', routes, timeout=3 * 60)
    print('hello: {}'.format(time.time() - t0))
    return render_template('index.html', active_routes=route_nums)

@app.route("/route<int:route>")
def get_geojson(route):
    t0 = time.time()
    available_routes = cache.get('routes')
    if not available_routes:
        available_routes = gdb.get_trips_now()
    geojson = gdb.route_geojson(routes=available_routes, selected_route=route)
    print('route: {}'.format(time.time() - t0))
    return jsonify(geojson)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

