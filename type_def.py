gtfs_schemas = {
    'stm': {
        'agency': [
            ('agency_url', 'text'), 
            ('agency_name', 'text'),
            ('agency_timezone', 'text'), 
            ('agency_id', 'text'),
            ('agency_lang', 'text')
        ],
        'calendar_dates': [
            ('service_id', 'text'),
            ('date', 'integer'),
            ('exception_type', 'integer')
        ],
        'fare_attributes': [
            ('fare_id', 'text'),
            ('price', 'real'),
            ('currency_type', 'text'), 
            ('payment_method', 'text'),         
            ('transfers', 'text'),
            ('transfer_duration', 'integer'),
        ],
        'fare_rules': [
            ('fare_id', 'text'), 
            ('route_id', 'integer'),
            ('contains_id', 'text'),
            ('destination_id', 'text'),
            ('origin_id', 'text')
        ],
        'frequencies': [
            ('trip_id', 'text'),
            ('start_time', 'interval'),
            ('end_time', 'text'),
            ('headway_secs', 'integer')
        ],
        'routes': [
            ('route_id', 'integer'),
            ('agency_id', 'text'),
            ('route_short_name', 'integer'),
            ('route_long_name', 'text'),
            ('route_type', 'integer'),
            ('route_url', 'text'),
            ('route_color', 'text'),
            ('route_text_color', 'text')
        ],
        'shapes': [
            ('shape_id', 'text'),
            ('shape_pt_lat', 'real'),
            ('shape_pt_lon', 'real'),
            ('shape_pt_sequence', 'text')
        ],
        'stop_times': [
            ('trip_id', 'text'),
            ('arrival_time', 'interval'),
            ('departure_time', 'interval'),
            ('stop_id', 'integer'),
            ('stop_sequence', 'integer')
        ],
        'stops': [
            ('stop_id', 'integer'),
            ('stop_code', 'integer'),
            ('stop_name', 'text'),
            ('stop_lat', 'real'), 
            ('stop_lon', 'real'),
            ('stop_url', 'text'),
            ('wheelchair_boarding', 'integer')
        ],
        'trips': [
            ('route_id', 'integer'),
            ('service_id', 'text'),
            ('trip_id', 'text'), 
            ('trip_headsign', 'text'), 
            ('wheelchair_accessible', 'text')
        ]
    },


    ###############################################################################
    ###############################################################################
    ###############################################################################

    'mbta': {
        'agency': [
            ('agency_url', 'text'), 
            ('agency_name', 'text'),
            ('agency_timezone', 'text'), 
            ('agency_id', 'text'),
            ('agency_lang', 'text'),
            ('agency_phone', 'text')
        ],
        'calendar': [
            ('service_id', 'text'),
            ('monday', 'integer'),
            ('tuesday', 'integer'),
            ('wednesday', 'integer'),
            ('thursday', 'integer'),
            ('friday', 'integer'),
            ('saturday', 'integer'),
            ('sunday', 'integer'),
            ('start_date', 'integer'),
            ('end_date', 'integer')
        ],
        'calendar_dates': [
            ('service_id', 'text'),
            ('date', 'integer'),
            ('exception_type', 'integer')
        ],
        'fare_attributes': [
            ('payment_method', 'text'), 
            ('price', 'real'),
            ('currency_type', 'text'), 
            ('fare_id', 'text'),
            ('transfer_duration', 'integer'),
            ('transfers', 'text')
        ],
        'fare_rules': [
            ('fare_id', 'text'), 
            ('route_id', 'integer'),
            ('contains_id', 'text'),
            ('destination_id', 'text'),
            ('origin_id', 'text')
        ],
        'feed_info': [
            ('feed_publisher_name', 'text'),
            ('feed_publisher_url', 'text'),
            ('feed_lang', 'text'),
            ('feed_start_date', 'integer'),
            ('feed_end_date', 'integer'),
            ('feed_version', 'text')
        ],
        'frequencies': [
            ('trip_id', 'text'),
            ('start_time', 'interval'),
            ('end_time', 'text'),
            ('headway_secs', 'integer')
        ],
        'routes': [
            ('route_id', 'text'),
            ('agency_id', 'text'),
            ('route_short_name', 'text'),
            ('route_long_name', 'text'),
            ('route_desc', 'text'),
            ('route_type', 'integer'),
            ('route_url', 'text'),
            ('route_color', 'text'),
            ('route_text_color', 'text')
        ],
        'shapes': [
            ('shape_id', 'text'),
            ('shape_pt_lat', 'real'),
            ('shape_pt_lon', 'real'),
            ('shape_pt_sequence', 'text'),
            ('shape_dist_traveled', 'text')
        ],
        'stop_times': [
            ('trip_id', 'text'),
            ('arrival_time', 'interval'),
            ('departure_time', 'interval'),
            ('stop_id', 'text'),
            ('stop_sequence', 'integer'),
            ('stop_headsign', 'text'),
            ('pickup_type', 'integer'),
            ('drop_off_type', 'integer')
        ],
        'stops': [
            ('stop_id', 'text'),
            ('stop_code', 'integer'),
            ('stop_name', 'text'),
            ('stop_desc', 'text'),
            ('stop_lat', 'real'), 
            ('stop_lon', 'real'),
            ('zone_id', 'integer'),
            ('stop_url', 'text'),
            ('location_type', 'integer'),
            ('parent_station', 'text')
        ],
        'transfers': [
            ('from_stop_id', 'integer'),
            ('to_stop_id', 'integer'),
            ('transfer_type', 'integer'),
            ('min_transfer_time', 'integer')
        ],
        'trips': [
            ('route_id', 'integer'),
            ('service_id', 'text'),
            ('trip_id', 'text'), 
            ('trip_headsign', 'text'), 
            ('trip_short_name', 'text'),
            ('direction_id', 'integer'),
            ('block_id', 'text'),
            ('shape_id', 'integer')
        ]
    }


    ###############################################################################
    ###############################################################################
    ###############################################################################

}