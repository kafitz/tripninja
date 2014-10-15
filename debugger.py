import time
import gtfs_database as gdb

def test1():
    t0 = time.time()
    trips = gdb.get_trips_now()
    print time.time() - t0

if __name__ == '__main__':
    test1()
