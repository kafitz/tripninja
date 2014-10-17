import os
import ConfigParser
import psycopg2
import fetch_gtfs_data as fetch
import type_def

# source data
url = 'http://www.mbta.com/uploadedfiles/MBTA_GTFS.zip'

# database parameters
conf = ConfigParser.ConfigParser()
conf.read('database.conf')
db_name = conf.get('postgres', 'database')
db_user = conf.get('postgres', 'username')
db_pass = conf.get('postgres', 'password')
db_host = conf.get('postgres', 'host')
db_port = conf.getint('postgres', 'port')
sql_schema = type_def.gtfs_schemas[conf.get('postgres', 'agency_schema')]

# download data from url and unpack
# fetch.gtfs_data(url, db_name)

# gather all gtfs .txt files in given directory
gtfs_data = 'static/geo/' + db_name
files = []
for root, directory, filename in os.walk(gtfs_data):
    for f in filename:
        if f.endswith('.txt'):
            # (table name from filepath, filepath)
            files.append((f.split('.')[0], os.path.join(root, f)))

# create the database
print("Creating new gtfs database: {}...".format(db_name))
create_conn = psycopg2.connect(user=db_user, password=db_pass, host=db_host, port=db_port)
create_cur = create_conn.cursor()
create_conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
create_cur.execute("""DROP DATABASE IF EXISTS {};""".format(db_name))
create_cur.execute("""CREATE DATABASE {};""".format(db_name))
create_cur.close()
create_conn.close()

# connect to new database
db_conn = psycopg2.connect(user=db_user, host=db_host, port=db_port, database=db_name)
db_cur = db_conn.cursor()

# create table using schema file
for table, col_defs in sql_schema.iteritems():
    print('Creating table {}'.format(table))
    create_table_sql = """CREATE TABLE {}(""".format(table)
    for idx, col_def in enumerate(col_defs):
        create_table_sql += """{} {}""".format(*col_def)
        if idx + 1 != len(col_defs):
            create_table_sql += ', '
    create_table_sql += """);"""
    db_cur.execute(create_table_sql)
db_conn.commit()

# add gtfs .txt files to database
copy_sql = """
    COPY {} FROM STDIN WITH
        CSV
        HEADER
        DELIMITER AS ','
    """
for file_tuple in files:
    table_name, file_path = file_tuple
    print('Adding {}'.format(table_name))

    db_rows = []
    with open(file_path, 'r') as gtfs_data:
        db_conn.cursor().copy_expert(sql=copy_sql.format(table_name), file=gtfs_data)
db_conn.commit()

# tables (keys) to create indices (values) on in db
index_dict = {
    'calendar_dates': ['date'],
    'routes': ['route_type'],
    'trips': ['route_id', 'trip_id'],
    'stop_times': ['trip_id', 'arrival_time'],
    'stops': ['stop_id']
}

for table, indices in index_dict.iteritems():
    print('Creating index on {}'.format(table))
    index_sql = """CREATE INDEX {}_idx ON {} (""".format(table, table)
    index_sql += (', ').join(indices)
    index_sql += """);"""
    db_cur.execute(index_sql)
db_conn.commit()

# create view for specific python query (rework this)
print('Create (temporary) view')
db_cur.execute("""CREATE MATERIALIZED VIEW st_join_t AS SELECT t.trip_id, t.route_id, t.service_id, s.arrival_time FROM trips t INNER JOIN stop_times s ON t.trip_id=s.trip_id;""")
db_cur.execute("""CREATE INDEX view_idx ON st_join_t (service_id, arrival_time);""")
db_conn.commit()

# close db connection
db_cur.close()
db_conn.close()

