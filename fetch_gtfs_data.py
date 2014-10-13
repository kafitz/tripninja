#!/usr/bin/env python
# Kyle Fitzsimmons, 2014
import os
from subprocess import call

# set script variables
stm_gtfs_url = 'http://www.stm.info/sites/default/files/gtfs/gtfs_stm.zip'

# set output folder/files off url
gtfs_zip = stm_gtfs_url.split('/')[-1]
gtfs_dir = './static/geo/' + gtfs_zip.split('.')[0]

# create output directory
if not os.path.exists(gtfs_dir):
    os.mkdir(gtfs_dir)

# download and uzip using standard unix tools
os.chdir(gtfs_dir)
call(["wget", stm_gtfs_url])
call(["unzip", gtfs_zip])