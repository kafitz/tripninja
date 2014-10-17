#!/usr/bin/env python
# Kyle Fitzsimmons, 2014
import os
from subprocess import call

def gtfs_data(url, gtfs_dir):
    # set output folder/files off url
    gtfs_zip = url.split('/')[-1]
    gtfs_dir = './static/geo/' + gtfs_dir

    # create output directory
    if not os.path.exists(gtfs_dir):
        os.mkdir(gtfs_dir)

    # download and uzip using standard unix tools
    os.chdir(gtfs_dir)
    call(["wget", url])
    call(["unzip", gtfs_zip])

if __name__ == '__main__':
    # set script variables
    stm_gtfs_url = 'http://www.stm.info/sites/default/files/gtfs/gtfs_stm.zip'
    fetch_data(stm_gtfs_url, 'stm_gtfs')