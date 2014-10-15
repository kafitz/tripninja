import time
import datetime
import os
import json
import psycopg2
import dataset
import sqlalchemy
import type_def
import sys

# gather all gtfs .txt files in given directory
gtfs_data = 'static/geo/gtfs_stm'
files = []
for root, directory, filename in os.walk(gtfs_data):
    for f in filename:
        if f.endswith('.txt'):
            # (table name from filepath, filepath)
            files.append((f.split('.')[0], os.path.join(root, f)))


# Create the database
print("Creating new gtfs database...")
create_conn = psycopg2.connect(user='kyle', host='localhost', port=5432)
create_cur = create_conn.cursor()
create_conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
create_cur.execute("""DROP DATABASE IF EXISTS gtfs2;""")
create_cur.execute("""CREATE DATABASE gtfs2;""")

table_defs = type_def.type_dict
for table, col_defs in table_defs.iteritems():
    create_table_sql = """CREATE TABLE {} (""".format(table)
    for idx, col_def in enumerate(col_defs):
        create_table_sql += """{} {}""".format(*col_def)
        if idx + 1 != len(col_defs):
            create_table_sql += ', '
    create_table_sql += """);"""
    print create_table_sql
    create_cur.execute(create_table_sql)

sys.exit()

# Add gtfs .txt files to database
for file_tuple in files:
    table_name, file_path = file_tuple
    print('Adding {}'.format(f))

    db_rows = []
    with open(file_path, 'r') as gtfs_data:
        create_conn.cursor().copy_from(gtfs_data, table_name)
    # with open(file_path, 'r') as file_data:
    #     for idx, line in enumerate(file_data):
    #         row = line.strip().split(',')
    #         row_data = []
    #         for r in row:
    #             r = r.decode('utf-8-sig')
    #             try:
    #                 r = int(r)
    #             except ValueError:
    #                 pass
    #             row_data.append(r)

    #         if idx == 0:
    #             headers = row_data
    #             types = type_def.type_dict[f]
    #             for index in headers:
    #                 col_type = None
    #                 for t in types:
    #                     if t[0] == index:
    #                         col_type = t[1]
    #                 print index, col_type
    #                 db[f].create_column(index, col_type)
    #             continue
    #         db_rows.append(dict(zip(headers, row_data)))
    #         if len(db_rows) % 50000 == 0:
    #             db[f].insert_many(db_rows, chunk_size=1500)
    #             db_rows = []

    # if db_rows:
    #     db[f].insert_many(db_rows, chunk_size=1500)

create_cur.close()
create_conn.close()

# CREATE VIEW st_join_t AS SELECT t.trip_id, t.route_id, t.service_id, s.arrival_time FROM trips t INNER JOIN stop_times s ON t.trip_id=s.trip_id;

# # Connect to new database with 'dataset' wrapper
# print("Adding gtfs .txt files to database...")
# db = dataset.connect('postgres://kyle@localhost:5432/gtfs')
# # db = dataset.connect('sqlite:///./static/geo/gtfs_stm.sqlite')



# for file_tuple in files:
#     f, file_path = file_tuple
#     print('Adding {}'.format(f))

#     db_rows = []
#     with open(file_path, 'r') as file_data:
#         for idx, line in enumerate(file_data):
#             row = line.strip().split(',')
#             # row_data = [r.decode('utf-8-sig') for r in row]
#             row_data = []
#             for r in row:
#                 r = r.decode('utf-8-sig')
#                 try:
#                     r = int(r)
#                 except ValueError:
#                     pass
#                 row_data.append(r)

#             if idx == 0:
#                 headers = row_data
#                 types = type_def.type_dict[f]
#                 for index in headers:
#                     col_type = None
#                     for t in types:
#                         if t[0] == index:
#                             col_type = t[1]
#                     print index, col_type
#                     db[f].create_column(index, col_type)
#                 continue
#             db_rows.append(dict(zip(headers, row_data)))
#             if len(db_rows) % 50000 == 0:
#                 db[f].insert_many(db_rows, chunk_size=1500)
#                 db_rows = []

#     if db_rows:
#         db[f].insert_many(db_rows, chunk_size=1500)


# # tables (keys) to create indices on in db (values)
# index_dict = {
#     'calendar_dates': ['date'],
#     'routes': ['route_types'],
#     'trips': ['route_id', 'trip_id'],
#     'stop_times': ['trip_id', 'arrival_time'],
#     'stops': ['stop_id']
# }
# for table, indices in index_dict.iteritems():
#     print('Creating index on {}'.format(table))
#     db[table].create_index(indices)


