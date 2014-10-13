#!/usr/bin/env python
# Kyle Fitzsimmons, 2014
from flask import Flask, render_template, jsonify, json
from werkzeug.contrib.cache import SimpleCache
from urllib2 import HTTPError
import gtfs_database as gdb

app = Flask(__name__)
cache = SimpleCache()

@app.route("/")
def hello():
    routes = gdb.get_trips_now()
    route_nums = sorted(routes.keys())
    cache.set('routes', routes, timeout=3 * 60)
    return render_template('index.html', active_routes=route_nums)

@app.route("/<int:route>")
def get_geojson(route):
    available_routes = cache.get('routes')
    if not available_routes:
        available_routes = gdb.get_trips_now()
    geojson = gdb.route_geojson(routes=available_routes, selected_route=route)
    return jsonify(geojson)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

