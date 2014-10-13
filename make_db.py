import time
import datetime
import os
import json
import dataset
import sqlalchemy
import type_def


gtfs_data = 'static/geo/gtfs_stm'
db_name = 'gtfs_stm.db'
db = dataset.connect('postgres://postgres:nutun@localhost/gtfs2')

# gather all gtfs .txt files in given directory
files = []
for root, directory, filename in os.walk(gtfs_data):
    for f in filename:
        if f.endswith('.txt'):
            files.append((f.split('.')[0], os.path.join(root, f)))

for file_tuple in files:
    f, file_path = file_tuple
    print('Adding {}'.format(f))

    db_rows = []
    inserted_rows = False
    with open(file_path, 'r') as file_data:
        for idx, line in enumerate(file_data):
            row = line.strip().split(',')
            # row_data = [r.decode('utf-8-sig') for r in row]
            row_data = []
            for r in row:
                r = r.decode('utf-8-sig')
                try:
                    r = int(r)
                except ValueError:
                    pass
                row_data.append(r)

            if idx == 0:
                headers = row_data
                types = type_def.type_dict[f]
                for index in headers:
                    col_type = None
                    for t in types:
                        if t[0] == index:
                            col_type = t[1]
                    print index, col_type
                    db[f].create_column(index, col_type)
                continue
            db_rows.append(dict(zip(headers, row_data)))
            if len(db_rows) % 50000 == 0:
                db[f].insert_many(db_rows, chunk_size=1500)
                db_rows = []
                inserted_rows = True

    if db_rows:
        db[f].insert_many(db_rows, chunk_size=1500)


# tables (keys) to create indices on in db (values)
index_dict = {
    'calendar_dates': ['date'],
    'routes': ['route_types'],
    'trips': ['route_id', 'trip_id'],
    'stop_times': ['trip_id', 'arrival_time'],
    'stops': ['stop_id']
}
for table, indices in index_dict.iteritems():
    print('Creating index on {}'.format(table))
    db[table].create_index(indices)

# needed view
# SELECT t.id FROM trips t INNER JOIN stop_times s ON t.trip_id = s.trip_id WHERE t.service_id = '14S_I' AND s.arrival_time BETWEEN '18:09:52' AND '18:19:52' GROUP BY t.trip_id

