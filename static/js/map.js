var map = L.map("map", {
                      zoom: 11,
                      center: [45.55, -73.7],
                      attributionControl: false
                    })
            .on('dblclick', function(e) {
                map.setView(e.latlng, map.getZoom() + 1)});
var defaultLayer = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

// var baseLayers = {
//     'OpenStreetMap Default': defaultLayer,
//     'Thunderforest OpenCycleMap': L.tileLayer.provider('Thunderforest.OpenCycleMap'),
//     'Thunderforest Transport': L.tileLayer.provider('Thunderforest.Transport'),
//     'Thunderforest Landscape': L.tileLayer.provider('Thunderforest.Landscape'),
//     'Stamen Toner': L.tileLayer.provider('Stamen.Toner'),
//     'Stamen Watercolor': L.tileLayer.provider('Stamen.Watercolor'),
//     'Esri WorldImagery': L.tileLayer.provider('Esri.WorldImagery'),
//     'Esri OceanBasemap': L.tileLayer.provider('Esri.OceanBasemap'),
// };

// var overlayLayers = {
//     'OpenSeaMap': L.tileLayer.provider('OpenSeaMap'),
//     'OpenWeatherMap Clouds': L.tileLayer.provider('OpenWeatherMap.Clouds'),
//     'OpenWeatherMap CloudsClassic': L.tileLayer.provider('OpenWeatherMap.CloudsClassic'),
//     'OpenWeatherMap Precipitation': L.tileLayer.provider('OpenWeatherMap.Precipitation'),
//     'OpenWeatherMap Rain': L.tileLayer.provider('OpenWeatherMap.Rain'),
//     'OpenWeatherMap Pressure': L.tileLayer.provider('OpenWeatherMap.Pressure'),
//     'OpenWeatherMap PressureContour': L.tileLayer.provider('OpenWeatherMap.PressureContour'),
//     'OpenWeatherMap Wind': L.tileLayer.provider('OpenWeatherMap.Wind'),
//     'OpenWeatherMap Temperature': L.tileLayer.provider('OpenWeatherMap.Temperature'),
//     'OpenWeatherMap Snow': L.tileLayer.provider('OpenWeatherMap.Snow')
// };

// var layerControl = L.control.layers(baseLayers, overlayLayers, {collapsed: true}).addTo(map);
L.control.fullscreen().addTo(map);

// // STM bus routes and animation variables
var enabled_routes = {'features': [], 'type': "FeatureCollection"};
var enabled_routes_nums = [];
var playback = null;
var geojsons = new Array();
var layers = new Array();
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

function delRoutes(route_num) {
    var updated_routes = {'features': [], 'type': "FeatureCollection"};
    map.removeLayer(layers[route_num]);
    enabled_routes.features.map(function(d, i) {
        if (d.properties.route_id != route_num) {
            updated_routes.features.push(d);
        }
    });
    enabled_routes = updated_routes;
    playback.setData(enabled_routes.features);
}

// style mtl_layers paths
function getStyle() {
    return {
        color: '#666',
        opacity: 0.5,
        fillColor: '#ddd',
        fillOpacity: 0.4,
        weight: 1.5
    };
}

// get unique route nums from array list to maintain enabled routes buttons
var uniqueRoutes = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
}

// Autosizing of available routes toolbar
$(window).on('resize', function(){
    width = $(".panel").width();
    num_buttons = Math.floor(width / 50) - 2;
    $('#active-routes').empty();
    var groups = [['<div class="btn-group" data-toggle="buttons" id="route-grp">']];
    $.each(active_routes, function(index, route) {
        if ((index + 1) % num_buttons == 0) {
            var subgroup = groups.pop();
            subgroup = subgroup + '<label class="btn btn-primary">' + '<input type="checkbox" class="bus-routes" id="' + route + '">' + route + '</label>';
            subgroup = subgroup + '</div>';
            groups.push(subgroup);
            groups.push('<div class="btn-group" data-toggle="buttons" id="route-grp">');
            // $('#active-routes').append('<br /><br /><div class="btn-group" data-toggle="buttons" id="route-grp-' + route + ' + ">');
        } else {
            var subgroup = groups.pop();
            subgroup = subgroup + '<label class="btn btn-primary">' + '<input type="checkbox" class="bus-routes" id="' + route + '">' + route + '</label>';
            groups.push(subgroup);
        }
    });
    console.log(uniqueRoutes(enabled_routes_nums));
    $.each(groups, function(index, g) {
        $('#active-routes').append(g); 
    });
    // add/remove routes on click
    $('.bus-routes').change(function(e) {
        if (this.checked) {
            addRoutes(this.id);
        } else {
            delRoutes(this.id);
        }
    });
});
// apply to both initial load and window resize
$(document).ready(function() {
    $(window).trigger('resize');
});

