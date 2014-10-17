#!/usr/bin/env python
# Kyle Fitzsimmons, 2014
import time
import datetime
import ConfigParser
import psycopg2
import psycopg2.extras
import type_def

# database parameters
conf = ConfigParser.ConfigParser()
conf.read('database.conf')
db_name = conf.get('postgres', 'database')
db_user = conf.get('postgres', 'username')
db_pass = conf.get('postgres', 'password')
db_host = conf.get('postgres', 'host')
db_port = conf.getint('postgres', 'port')
sql_schema = type_def.gtfs_schemas[conf.get('postgres', 'agency_schema')]
# Initialize database connection
db_conn = psycopg2.connect(user=db_user, 
                           password=db_pass, 
                           host=db_host, 
                           port=db_port, 
                           database=db_name)
db_cur = db_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)


## Database queries
def get_schedule(date):
    sql_query = """SELECT service_id FROM calendar_dates WHERE date=%s;"""
    db_cur.execute(sql_query, (date,))
    schedule = db_cur.fetchone()
    if schedule:
        return schedule[0]
    else:
        return None

def get_trips(service_id, times):
    sql_query = """SELECT * FROM st_join_t s WHERE service_id='{}' AND arrival_time BETWEEN '{}' AND '{}'""".format(service_id, *times)
    db_cur.execute(sql_query)
    current_trips = db_cur.fetchall()
    return current_trips

def get_stops(trip_ids):
    sql_query = """SELECT arrival_time, departure_time, stop_sequence, stop_id, trip_id FROM stop_times
                   WHERE """
    for idx, trip_id in enumerate(trip_ids):
        sql_query += "trip_id='{}'".format(trip_id)
        if idx + 1 != len(trip_ids):
            sql_query += ' OR '
    db_cur.execute(sql_query)
    stops = db_cur.fetchall()
    return stops

def get_stops_details(stop_ids):
    # stop_info = db['stops'].find_one(stop_id=int(stop_id))
    sql_query = """SELECT * FROM stops WHERE """
    for idx, stop_id in enumerate(stop_ids):
        sql_query += 'stop_id={}'.format(stop_id)
        if idx + 1 != len(stop_ids):
            sql_query += ' OR '
    db_cur.execute(sql_query)
    stops_info = db_cur.fetchall()
    return stops_info


# General functions
def get_trips_now():
    # find the schedule code in effect for today's date
    today = time.strftime('%Y%m%d')
    service_id = get_schedule(today)

    # get today's trips and group in a dict of routes
    now = datetime.datetime.now()
    start_time = (now - datetime.timedelta(minutes=5)).time()
    end_time = (now + datetime.timedelta(minutes=10)).time()

    times = (start_time.strftime("%H:%M:%S"), end_time.strftime("%H:%M:%S"))
    trips = get_trips(service_id, times)

    # check for trips in extended hours counted for the day before
    st, et = None, None
    if start_time.hour < 6:
        st = str(start_time.hour + 24) + start_time.strftime(":%M:%S")
    if end_time.hour < 6:
        et = str(end_time.hour + 24) + end_time.strftime(":%M:%S")
    if st or et:
        yesterday = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime('%Y%m%d')
        adj_service_id = get_schedule(yesterday)
        if st and et:
            adj_times = (st, et)
        elif st:
            adj_times = (st, end_time)
        elif et:
            adj_times = (start_time, et)
        trips += get_trips(adj_service_id, adj_times)

    columns = ['trip_id', 'route_id', 'service_id', 'arrival_time']
    routes = {}
    for t in trips:
        trip = dict(zip(columns, t))
        route_id = int(trip['route_id'])
        routes.setdefault(route_id, [])
        routes[route_id].append(trip)
    return routes

def point(properties, latitude, longitude):
    feature = {
        'type': 'Feature',
        'properties': properties,
        'geometry': {
            'type': 'point',
            'coordinates': [longitude, latitude]
        }
    }
    return feature

def convert_timedelta(duration):
    days, seconds = duration.days, duration.seconds
    hours = days * 24 + seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = (seconds % 60)
    return (hours, minutes, seconds)

def adjust_timestamp(arrival_time, departure_time):
        # check if 24 used as hour in timestamp, move forward to 0 hour of next day
        today = time.strftime('%Y-%m-%d')
        arrival_time = convert_timedelta(arrival_time)
        departure_time = convert_timedelta(departure_time)
        if arrival_time[0] >= 24:
            hour = unicode(arrival_time[0] - 24)
            arrival_time = "{}:{}:{}".format(hour, unicode(arrival_time[1]), unicode(arrival_time[2]))
            arrival_day = (datetime.date.today() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
        else:
            arrival_time = "{}:{}:{}".format(*arrival_time)
            arrival_day = today
        if departure_time[0] >= 24:
            hour = unicode(departure_time[0] - 24)
            departure_time = "{}:{}:{}".format(hour, unicode(departure_time[1]), unicode(departure_time[2]))
            departure_day = (datetime.date.today() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
        else:
            departure_time = "{}:{}:{}".format(*departure_time)
            departure_day = today
        arrival = int(time.mktime(datetime.datetime.strptime(arrival_day + " " + arrival_time, "%Y-%m-%d %H:%M:%S").timetuple()) * 1000)
        departure = int(time.mktime(datetime.datetime.strptime(departure_day + " " + departure_time, "%Y-%m-%d %H:%M:%S").timetuple()) * 1000)
        return arrival, departure

def get_trip_points(trip_id, route_id, stops, stops_details):
    stop_ids = []
    stop_properties = {}
    for arrival_time, departure_time, stop_sequence, stop_id in sorted(stops, key=lambda x: int(x[2])):
        arrival, departure = adjust_timestamp(arrival_time, departure_time)
        properties = {
            'station_name': None,
            'arrival': arrival,
            'departure': departure,
            'sequence': stop_sequence,
            'stop_code': None,
            'stop_id': stop_id,
            'trip_id': trip_id,
            'route_id': route_id
        }
        stop_properties[stop_id] = properties
        stop_ids.append(stop_id)

    point_features = []
    details_dict = {s['stop_id']: s for s in stops_details}
    for stop_id in stop_ids:
        details = details_dict[stop_id]
        latitude = float(details['stop_lat'])
        longitude = float(details['stop_lon'])
        name = details['stop_name']
        # account for unicode extra character in fixed-width display
        spacer = ''
        if len(name) - len(details['stop_name']) == 1:
            spacer = ' '
        stop_code = details['stop_code']

        properties = stop_properties[stop_id]
        properties['station_name'] = name
        properties['stop_code'] = stop_code

        point_features.append(point(properties, latitude, longitude))

    schema = {
        "type": "FeatureCollection",
        "features": point_features
    }
    return schema

def points_to_line(all_points):
    schema = {
        "type": "FeatureCollection",
        "features": []
    }

    for points in all_points:
        latlngs = []
        times = []
        for feature in points['features']:
            latlngs.append(feature['geometry']['coordinates'])
            times.append(feature['properties']['arrival'])
            trip_id = feature['properties']['trip_id']
            route_id = feature['properties']['route_id']

        json_feat = {
            "type": "Feature",
            "properties": {'trip_id': trip_id, 'route_id': route_id, 'time': times},
            "geometry": {
                "type": "LineString",
                "coordinates": latlngs,
            }
        }
        schema['features'].append(json_feat)
    return schema

def route_geojson(routes, selected_route):
    all_points = []
    trip_ids = []
    selected_features = routes.get(selected_route)
    if not selected_features:
        return None

    # get trip and route ids of trips now for selected route
    for idx, r in enumerate(selected_features):
        trip_id, route_id = r['trip_id'], r['route_id']
        trip_ids.append(trip_id)
    
    # get arrive, departure, seq for all stops along trips
    all_stops = get_stops(trip_ids)
    stops = {}
    stop_ids = []
    for t in all_stops:
        arrival, departure, sequence, stop_id, trip_id = t
        stops.setdefault(trip_id, [])
        stops[trip_id].append((arrival, departure, sequence, stop_id))
        stop_ids.append(stop_id)
    
    # get information about each stop within trips
    stop_ids = set(stop_ids)
    stops_details = get_stops_details(stop_ids)

    # get each bus trip as a geojson feature
    for idx, r in enumerate(selected_features):
        trip_id, route_id = r['trip_id'], r['route_id']
        trip_stops = stops[trip_id]
        stop_points = get_trip_points(trip_id, route_id, trip_stops, stops_details)
        all_points.append(stop_points)

    line_feature = points_to_line(all_points)
    return line_feature


