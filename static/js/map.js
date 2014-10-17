// style route tracks paths
function getStyle() {
    return {
        color: '#666',
        opacity: 0.5,
        fillColor: '#ddd',
        fillOpacity: 0.4,
        weight: 1.5
    };
}

// try to add cached route (previously clicked), otherwise
// load geojson from server via AJAX call 
function addRoutes(route_num) {
    var selected;
    enabled_routes_nums.push(route_num);
    if (layers[route_num]) {
        route_layer = layers[route_num];
        selected = geojsons[route_num].features;
        selected.map(function(d) {
            enabled_routes.features.push(d);    
        });
        map.addLayer(route_layer);
        playback.addData(selected);
    } else {
        $.getJSON($SCRIPT_ROOT + route_num, function(json_data) {
            var route_layer = L.geoJson(json_data, { style: getStyle });
            geojsons[route_num] = json_data;
            layers[route_num] = route_layer;
            map.addLayer(route_layer);
            selected = json_data.features;
            selected.map(function(d) {
                enabled_routes.features.push(d);    
            });
            var playback_options = {
                tracksLayer: false,
                dateControl: true,
                sliderControl: true,
                playControl: true,
                speed: 150000,
                tickLen: 1000,                
                marker: function(){
                    return {
                        icon: L.AwesomeMarkers.icon({
                            prefix: 'fa',
                            icon: 'bus', 
                            markerColor: 'blue'
                        }) 
            };
        }                  
            };
            if (playback === null) {
                playback = new L.Playback(map, selected, null, playback_options);
            } else {
                playback.addData(selected);
            }
        });
    }
}

// create new feature based using all routes not matching unclicked route
// and set as new leaflet-playback data
function delRoutes(route_num) {
    var updated_routes = {'features': [], 'type': "FeatureCollection"};
    var updated_routes_nums = [];
    map.removeLayer(layers[route_num]);
    enabled_routes.features.map(function(d, i) {
        route_id = "route" + d.properties.route_id;
        console.log([i, route_id, route_num]);
        if (route_id != route_num) {
            updated_routes.features.push(d);
            updated_routes_nums.push(route_id);
        }
    });
    enabled_routes = updated_routes;
    enabled_routes_nums = updated_routes_nums;
    playback.setData(enabled_routes.features);
}

// get unique route nums from array list to maintain enabled routes buttons
var uniqueRoutes = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
}

// globals
var enabled_routes = {'features': [], 'type': "FeatureCollection"};
var enabled_routes_nums = []; // <-- merged into enabled routes object?
var playback = null;
var geojsons = new Array();
var layers = new Array();
// Load leaflet map centered on Montreal w/ double-click to zoom
var map = L.map("map", {
                      zoom: 11,
                      center: [45.55, -73.7],
                      attributionControl: false,
                      tap: false
                    })
            .on('dblclick', function(e) {
                map.setView(e.latlng, map.getZoom() + 1)});
map.scrollWheelZoom.disable();
var defaultLayer = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

// Autosizing of available routes toolbar on browser resize
$(window).on('resize', function(){
    // Calculate the number of buttons (50px) per row off div width
    width = $(".panel").width();
    num_buttons = Math.floor(width / 50) - 2;
    // Create an array of new elements to replace old rows
    var groups = [['<div class="btn-group route-grp" data-toggle="buttons">']];
    $.each(active_routes, function(index, route) {
        if ((index + 1) % num_buttons == 0) {
            var subgroup = groups.pop();
            subgroup = subgroup + '<label class="btn btn-primary" id="route' + route + '_lbl">' 
                     + '<input type="checkbox" class="bus-routes" id="route' 
                     + route + '">' + route 
                     + '</label></div>';
            groups.push(subgroup, '<div class="btn-group route-grp" data-toggle="buttons">');
        } else {
            var subgroup = groups.pop();
            subgroup = subgroup + '<label class="btn btn-primary" id="route' + route + '_lbl">' 
                     + '<input type="checkbox" class="bus-routes" id="route' 
                     + route + '">' + route + '</label>';
            groups.push(subgroup);
        }
    });

    // Clear route table and add new arrangement of rows
    $('#active-routes').empty();
    var divs = groups.join([separator = '']);
    $('#active-routes').append(divs);

    // Add jquery binding to add/remove routes from table on click
    $('.bus-routes').change(function(e) {
        if (this.checked) {
            addRoutes(this.id);
        } else {
            delRoutes(this.id);
        }
    });

    // re-enable old selections to new divs:
    // add 'active' class to outer <label>; check inner <input>
    $.each(enabled_routes_nums, function(e, route) {
        var div = $('#' + route);
        var div_lbl = $('#' + route + '_lbl');
        div.prop('checked', true);
        div_lbl.addClass('active');
    });

});


// apply to both initial load and window resize
$(document).ready(function() {
    $(window).trigger('resize');
});

