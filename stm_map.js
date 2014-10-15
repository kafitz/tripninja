var map = {
  /*
   * SETTINGS
   */
  settings: {
    map : 'map-OSM',
    application : 'main-search-box',
    screenType : (Modernizr.touch) ? 'touchend' : 'mousedown',
    markers : {
      location : '/sites/all/modules/custom/stm_app/js/markers',
      origin : {
        height : 83,
        width : 54,
        offsetY : -83
      },
      destination : {
        height : 83,
        width : 54,
        offsetY : -83
      },
      walk : {
        height:26,
        width:26
      },
      bixi : {
            width : 26,
            height : 26
      },
      Bus : {
            width : 26,
            height : 26
      },
      Train : {
        width : 26,
        height : 26
      },
      metroVert : {
        width : 26,
        height : 26
      },
      metroBleu : {
        width : 26,
        height : 26
      },
      metroOrange : {
        width : 26,
        height : 26
      },
      metroJaune : {
        width : 26,
        height : 26
      },
      metroMany : {
        width : 30,
        height : 30
      },
      stop : {
        width : 22,
        height : 22
      },
      stopEnds : {
        width : 26,
        height : 26
      },
      bixi : {
        width : 30,
        height : 41
      },
      default : {
          file : 'flag.png',
          width : 41,
          height : 53,
        offsetY : -53
      }
    },
    polygons : {
      default : {
        strokeColor: '#636466', 
        strokeOpacity: 0.3,
        strokeWidth: 2,
        fillColor : '#fff',
        fillOpacity : 0
      }
    }
  },

  /*
   * METHODS
   */
  init : function() {

    var that = this;

    // Load OpenLayers API
    jQuery.cachedScript = function(url, options) {
      options = jQuery.extend(options || {}, {
        dataType: "script",
        cache: true,
        url: url
      });
      return jQuery.ajax(options);
    };
     
    jQuery.cachedScript("/sites/all/modules/custom/stm_app/js/OpenLayers.js")
      .fail(function(script, textStatus) {
        console.log('No map');
      })
      .done(function(script, textStatus) {

        // LineLayer and Styles
        lines = new OpenLayers.Layer.Vector("LineLayer", {
          styleMap : new OpenLayers.StyleMap({
            'default' : new OpenLayers.Style({
              strokeColor: '#009ddf', 
              strokeWidth: 3,
              strokeOpacity : 1
            }, {
              // RULES
              rules : [

                /* Zoom 1 */
                new OpenLayers.Rule({
                  minScaleDenominator: 120000,
                  symbolizer: {
                    strokeWidth : 3
                  }
                }),

                /* Zoom 2-3 */
                new OpenLayers.Rule({
                  minScaleDenominator: 50000,
                  maxScaleDenominator: 120000,
                  symbolizer: {
                    strokeWidth : 3
                  }
                }),

                /* Zoom 4+ */
                new OpenLayers.Rule({
                  maxScaleDenominator: 50000,
                  symbolizer: {
                    strokeWidth : 3
                  }
                }),

                // Type : Walk
                new OpenLayers.Rule({
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "type",
                    value : 'walk'
                  }),
                  symbolizer: {
                    strokeColor : '#6d6d6d',
                    strokeDashstyle : '5,8'
                  }
                }),

                // Type : Train
                new OpenLayers.Rule({
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "type",
                    value : 'Train'
                  }),
                  symbolizer: {
                    strokeColor : '#515151',
                    strokeWidth : 2
                  }
                }),

                // Type : Train
                new OpenLayers.Rule({
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "type",
                    value : 'Train'
                  }),
                  symbolizer: {
                    strokeColor : '#515151',
                    strokeWidth : 2
                  }
                }),

                // Secondary Line
                new OpenLayers.Rule({
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "type",
                    value : 'secondary'
                  }),
                  symbolizer: {
                    strokeOpacity : 0.3
                  }
                }),

                // Hidden
                new OpenLayers.Rule({
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "hidden",
                    value : 'true'
                  }),
                  symbolizer: {
                    strokeOpacity : 0
                  }
                }),

                // Temporary
                new OpenLayers.Rule({
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "temporary",
                    value : 'true'
                  }),
                  symbolizer: {
                    strokeOpacity : 0.5
                  }
                }),
              ]
            })
          })
        });

        // MetroLayer and StyleMap
        metro = new OpenLayers.Layer.Vector("MetroLayer", {
          styleMap : new OpenLayers.StyleMap({
            'default' : new OpenLayers.Style({
              strokeColor : "${color}",
              strokeOpacity : 0.75,
              strokeLinecap : "round",
              strokeWidth : 6
            }, {
              rules : [
                /* DEFAULT */

                /* Zoom 1-3 */
                new OpenLayers.Rule({
                  minScaleDenominator: 50000,
                  symbolizer: {}
                }),

                /* Zoom 4+ */
                new OpenLayers.Rule({
                  maxScaleDenominator: 50000,
                  symbolizer: {
                    strokeWidth : 12,
                    strokeOpacity : 0.55
                  }
                }),

                /* RESULT */

                /* Out of scope, Zoom 1-3 */
                new OpenLayers.Rule({
                  minScaleDenominator: 50000,
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "outofscope",
                    value : true
                  }),
                  symbolizer: {
                    strokeOpacity : 0.3
                  }
                }),

                /* Out of scope, Zoom 4+ */
                new OpenLayers.Rule({
                  maxScaleDenominator: 50000,
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "outofscope",
                    value : true
                  }),
                  symbolizer: {
                    strokeOpacity : 0.1
                  }
                }),

                /* Selected, Zoom 1-3 */
                new OpenLayers.Rule({
                  minScaleDenominator: 50000,
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "select",
                    value : true
                  }),
                  symbolizer: {
                    strokeOpacity : 0.75
                  }
                }),

                /* Selected, Zoom 4+ */
                new OpenLayers.Rule({
                  maxScaleDenominator: 50000,
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "select",
                    value : true
                  }),
                  symbolizer: {
                    strokeOpacity : 0.55
                  }
                }),

                /* Highlighted */
                /*new OpenLayers.Rule({
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "highlight",
                    value : true
                  }),
                  symbolizer: {
                    strokeOpacity : 0.5
                  }
                }),

                /* Selected *\/
                new OpenLayers.Rule({
                  filter : new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "select",
                    value : true
                  }),
                  symbolizer: {
                    strokeOpacity : 0.1
                  }
                }),*/
              ]
            })
          })
        });

        that.lang = Drupal.settings.pathPrefix || 'fr';
        that.lang = that.lang.match('en') ? 'en' : 'fr';

          that.map = new OpenLayers.Map({
          div : that.settings.map,
          theme : null,
          layers : [
            //new OpenLayers.Layer.OSM("MapLayer"),
            new OpenLayers.Layer.TileCache("STMMap",
              Drupal.settings.stm_app.mapserver, // TODO : multiple domain names.
              "maps", { 
                attribution : that.lang == 'en' ? '&copy; OpenStreetMap contributors' : '&copy; les contributeurs d’OpenStreetMap',
                name: 'stm',
                matrixSet: 'g',
                format: 'image/png',
                style: 'default',
                gutter:0,
                buffer:0,
                isBaseLayer:true,
                transitionEffect:'resize',
                units:"m",
                maxExtent: new OpenLayers.Bounds(-20037508.342789, -20037508.342789, 20037508.342789, 20037508.342789),
                projection: new OpenLayers.Projection("EPSG:900913"),
                sphericalMercator: true,
                resolutions : [76.43702828517624, 38.21851414258813, 19.10925707129406, 9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395],
                serverResolutions:[156543.03392804099712520838,78271.51696402048401068896,39135.75848201022745342925,19567.87924100512100267224,9783.93962050256050133612,4891.96981025128025066806,2445.98490512564012533403,1222.99245256282006266702,611.49622628141003133351,305.74811314070478829308,152.87405657035250783338,76.43702828517623970583,38.21851414258812695834,19.10925707129405992646,9.55462853564703173959,4.77731426782351586979,2.38865713391175793490,1.19432856695587897633,0.59716428347793950593],
                zoomOffset : 11
              }
            ),
            metro,
            lines, 
            new OpenLayers.Layer.Vector("PolygonLayer", {units:"m"}), 
            new OpenLayers.Layer.Markers("MarkerLayer")
          ],
          controls : [
            new OpenLayers.Control.Navigation({
              dragPanOptions: {
                enableKinetic: true
              },
              zoomWheelEnabled : false,
              handleRightClicks : true
            }),
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.DrawFeature(metro, OpenLayers.Handler.Path),
            new OpenLayers.Control.DrawFeature(lines, OpenLayers.Handler.Path)
          ],
          restrictedExtent : [
            -8252744.6255926,
            5674150.1148498, 
            -8153244.2981822,
            5737253.2285429
          ]
        });

        that.map.div.className += ' zoom-' + that.map.getZoom();
        that.map.events.register('zoomend', that.map, function (e) {
          var zoom = this.getZoom();

          this.div.className = this.div.className.replace(/(\s|^)zoom\-([0-9]*)(\s|$)/g, ' ');
          this.div.className += ' zoom-' + zoom;
        });  
    
        // Zoom Control
        zoom = new OpenLayers.Control.Zoom({displayClass:'stm-zoom'});
        that.map.addControl(zoom);
        zoom.zoomInLink.className  += ' stm-zoomin';
        zoom.zoomInLink.title       = jQuery.t('zoom_in');
        zoom.zoomOutLink.className += ' stm-zoomout';
        zoom.zoomOutLink.title      = jQuery.t('zoom_out');

          that.proj = new OpenLayers.Projection("EPSG:4326");  

        // Set default center point
        that.setCenter(-73.66848183266822, 45.52201302732286, 12);

        // Draw Metro lines
        that.drawMetro();
        that.zoomToBounds(that.getLayer("MarkerLayer").getDataExtent());

        // Watch for container height change
        that.map.height = that.map.div.clientHeight;  

        window.setInterval(function() {
          if (that.map.height != that.map.div.clientHeight) {
            that.map.updateSize();
            that.map.height = that.map.div.clientHeight;
          }
        }, 200);

    });

  },

  // map.setCenter("-73.573601", "45.499322", 8);
  setCenter : function (lon, lat, zoom) {
    var lonlat;
    if (typeof lon == 'object') {
      lonlat = lon;
      zoom = lat;
    } else {
      lonlat = new OpenLayers.LonLat(lon, lat).transform(
        this.proj, this.map.getProjectionObject()
      );
    }

    zoom = zoom - 11;
    zoom = zoom < 1 ? 1 : zoom;

    var boxRightBound = document.getElementById(this.settings.application).getBoundingClientRect().right;
    var mapRightBound = document.getElementById(this.settings.map).getBoundingClientRect().right;

    this.map.setCenter(lonlat, zoom);  
    this.map.moveByPx(-1 * (boxRightBound / 2));
  },

  zoomToBounds : function(bounds) {
    return this.map.zoomToExtent(bounds);
  },

  // map.addMarker("-73.573601", "45.499322", 'local', '<p>TEST</p>');
  addMarker : function(lon, lat, type, popupHTML, hover, indelible) {
    var that = this, typeClass;

    // Find the MarkerLayer
    var markers = this.getLayer("MarkerLayer");
    // Set default marker
    var marker = this.settings.markers.default;

    // Change marker
    if (typeof type == 'object')
      marker = type;

    // Change by marker type
    else if (typeof type == 'string') {
      marker = this.settings.markers[type] || this.settings.markers.default;
      typeClass = ' marker-type-' + type.toLowerCase();
    }

    marker.file = marker.file || this.settings.markers.default.file;

    // Set lon and lat
    var lonlat = new OpenLayers.LonLat(lon, lat);
    lonlat.transform(this.proj, this.map.getProjectionObject());

    var feature = new OpenLayers.Feature(markers, lonlat);

    // Create Popup
    if (popupHTML) {
        feature.popupClass = OpenLayers.Class(OpenLayers.Popup.Anchored, {
        autoSize : true,
        displayClass : 'stm-marker-popup ' + typeClass,
        contentDisplayClass : 'content',
        keepInMap : false,
        calculateRelativePosition : function () {
          return 'tr';
        }
      });
      feature.closeBox = true;
        feature.data.popupContentHTML = popupHTML;
        feature.data.overflow = "visible";
    }

    // Create Marker
    var size = new OpenLayers.Size(marker.width, marker.height);
    feature.data.size = size;

    var offset = new OpenLayers.Pixel(marker.offsetX || -(size.w/2), marker.offsetY || -(size.h/2));
    feature.data.offset = offset;

    // Set the icon
    feature.data.icon = new OpenLayers.Icon(this.settings.markers.location+'/'+marker.file, size, offset);

    feature.data.maxResolution = marker.maxResolution;

    marker = feature.createMarker();
    marker.icon.imageDiv.className += ' stm-marker ' + typeClass;

    if (popupHTML) {
      var currentPopup;
      marker.icon.imageDiv.className += ' has-popup';

      // click event
      if (hover != 'only') {

        marker.events.register(map.settings.screenType, feature, function (evt) {

          if (this.popup == null) {
            this.popup = this.createPopup(this.closeBox);
            that.map.addPopup(this.popup);
          }

          for (var a = 0; a < this.popup.map.popups.length; a++) {
            this.popup.map.popups[a].hide();
          }

          if (this.popup.visible()) {
            this.popup.show();
          } else {
            this.popup.toggle();
          }

          this.popup.size.h += 30;
          this.popup.setSize(this.popup.size);
          this.popup.panIntoView();
          this.popup.size.h -= 30;
          this.popup.setSize(this.popup.size);

          this.popup.div.className = this.popup.div.className.replace(/(\s|^)hovered(\s|$)/g, ' ');
          currentPopup = this.popup;
          OpenLayers.Event.stop(evt);

          this.popup.adjust();
          this.popup.panIntoView();
        });
      }

      // hover event
      if (hover) {
        marker.events.register("mouseover", feature, function (evt) {
          if (currentPopup && this.popup.div.id == currentPopup.div.id) {
            if (this.popup.visible())
              return false;
            currentPopup = null;
          }
          if (this.popup == null) {
            this.popup = this.createPopup(this.closeBox);
            that.map.addPopup(this.popup);
          }

          this.popup.div.className += ' hovered';
          OpenLayers.Event.stop(evt);

          // Do some serious, messy, adjustment
          this.popup.show();
          this.popup.adjust();
          this.popup.hide();
          this.popup.show();
          this.popup.adjust();
        });

        marker.events.register("mouseout", feature, function (evt) {
          if (currentPopup && this.popup.div.id == currentPopup.div.id && this.popup.visible()) return false;
          this.popup.hide();
          this.popup.div.className = this.popup.div.className.replace(/(\s|^)hovered(\s|$)/g, ' ');
          OpenLayers.Event.stop(evt);
        });
      }

      popup = feature.createPopup(feature.closeBox);
      that.map.addPopup(popup);
      popup.adjust = function(w, h) {
        var w = w || this.div.getBoundingClientRect().width;
        var h = h || this.div.getBoundingClientRect().height;
        this.setSize(new OpenLayers.Size(w, h));
        this.updateRelativePosition();
      }
      popup.hide();
      popup.closeDiv.setAttribute('style', '');
      popup.groupDiv.setAttribute('style', '');
      popup.contentDiv.setAttribute('style', '');
    }

    // Listen for destroy event.
    this.map.events.register("destroy", this.map , function(e){ 
      if (e.el && typeof e.el == 'object' && feature.bind && e.el.isEqualNode(feature.bind) || e.all === true && feature.bind && !indelible) {
        feature.destroy();
      }
    });

      markers.addMarker(marker);

    /* Custom methods */
    feature.zoomTo = function(zoomLevel) {
      that.setCenter(this.lonlat, zoomLevel);  
    };

    return feature;
  },

  bind : function(el, obj) {
    if (typeof el == 'string')
      el = document.querySelector(el);

    if (!el.isEqualNode) return false;

    obj.bind = el;
    return true;
  },

  destroy : function(el) {
    if (el == 'all') {
      this.map.events.triggerEvent('destroy', {all:true});
      return true;
    }

    if (typeof el == 'string')
      el = document.querySelector(el);

    this.map.events.triggerEvent('destroy', {el:el});

    // TODO : Iterate through children and destroy.
  },

  // map.drawLine([{lon: "-73.573601", lat: "45.499322"},{lon: "-73.575445", lat: "45.500221"}]);
  drawLine : function(points, type, temporary) {
    // Must be a minimum of two points
    if (points.length < 2) return false;

    var lonlats = new Array();
    for(i=0;i<points.length;i++) {
      lonlats[lonlats.length+1] = new OpenLayers.Geometry.Point(points[i].lon, points[i].lat).transform(this.proj, this.map.getProjectionObject());
    }

    var line = new OpenLayers.Geometry.LineString(lonlats);

    var feature = new OpenLayers.Feature.Vector(line, {type : type, temporary : temporary && temporary != 'hidden' ? "true" : null, hidden : temporary == 'hidden' ? "true" : null});

    this.getLayer("LineLayer").addFeatures([feature]);

    // Listen for destroy event.
    this.map.events.register("destroy", this.map , function(e){ 
      if (e.el && typeof e.el == 'object' && feature.bind && e.el.isEqualNode(feature.bind) || e.all === true && feature.bind) {
        feature.destroy();
      }
    });

    return feature;
  },

  drawMetroLine : function(points, line) {
    // Must be a minimum of two points
    if (points.length < 2) return false;

    var lonlats = new Array();
    for(i=0;i<points.length;i++) {
      lonlats[lonlats.length+1] = new OpenLayers.Geometry.Point(points[i].lon, points[i].lat).transform(this.proj, this.map.getProjectionObject());
    }

    var color = '#008E4F';
    switch(line) {
      case '2':
      color = '#F08123'; // orange
      break;
      case '4':
      color = '#FFE400';
      break;
      case '5':
      color = '#0083CA'; // bleue
      break;
    }

    var under = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(lonlats), {
      color : '#F1EEEB',
      highlight : true,
      select : false
    });

    var main = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(lonlats), {
      color : color,
      highlight : false,
      select : false
    });

    this.getLayer("MetroLayer").addFeatures([under, main]);

    main.stations = points;

    return [main, {}];
  },

  drawMetro : function() {
    var lines = Drupal.settings.stm_app.metro_stations_geo || {}, that = this;

    // Draw lines
    for (var line in lines) {
      var type, last = {};
      switch(line) {
        case '1':
        type = 'metroVert';
        break;
        case '2':
        type = 'metroOrange';
        break;
        case '4':
        type = 'metroJaune';
        break;
        case '5':
        type = 'metroBleu';
        break;
      }

      // Add stations
      for (var station in lines[line]) {
        var marker;

        if (lines[line][station].hidden) {
          marker = this.addMarker(lines[line][station].lon, lines[line][station].lat);
          marker.marker.display(false);
        } else {
          var html = '<div class="title">';
          html += '<div class="stop-name station-metro"><strong>' + lines[line][station].name.replace('Station ', '') + '</strong></div>';
          html += '<span class="icon metro"></span>';

          for (var coor in lines[line][station].lines) {
            html += '<span class="icon line-circle line-' + lines[line][station].lines[coor] + '"></span>';
          }

          html += '</div>';

          marker = this.addMarker(lines[line][station].lon, lines[line][station].lat, lines[line][station].lines.length > 1 ? 'metroMany' : type, html, true);
        }

        if (station == 0 || station == lines[line].length-1) {
          marker.marker.icon.imageDiv.className += ' marker-type-metroterminus';
        }

        // Store station name
        marker.metroName = lines[line][station].name;

        this.map.events.register("selectMetro", marker, function(e) {

          // Marker
          if (e.metroName == this.metroName || e.metroNames.indexOf(this.metroName) != '-1') {
            if (e.highlight) {
              this.marker.icon.imageDiv.className = this.marker.icon.imageDiv.className.replace(/(\s|^)highlight(\s|$)/g, ' ');
              this.marker.icon.imageDiv.className += ' highlight';

              if (e.metroNames && e.metroNames.indexOf(this.metroName) == 0) {
                this.marker.icon.imageDiv.className = this.marker.icon.imageDiv.className.replace(/(\s|^)hfirst(\s|$)/g, ' ');
                this.marker.icon.imageDiv.className += ' hfirst';
              } else if (e.metroNames && e.metroNames.indexOf(this.metroName) == e.metroNames.length-1) {
                this.marker.icon.imageDiv.className = this.marker.icon.imageDiv.className.replace(/(\s|^)hlast(\s|$)/g, ' ');
                this.marker.icon.imageDiv.className += ' hlast';
              }
            } else {
              this.marker.icon.imageDiv.className = this.marker.icon.imageDiv.className.replace(/(\s|^)selected(\s|$)/g, ' ');
              this.marker.icon.imageDiv.className += ' selected';

              if (e.metroNames && e.metroNames.indexOf(this.metroName) == 0) {
                this.marker.icon.imageDiv.className = this.marker.icon.imageDiv.className.replace(/(\s|^)sfirst(\s|$)/g, ' ');
                this.marker.icon.imageDiv.className += ' sfirst';
              } else if (e.metroNames && e.metroNames.indexOf(this.metroName) == e.metroNames.length-1) {
                this.marker.icon.imageDiv.className = this.marker.icon.imageDiv.className.replace(/(\s|^)slast(\s|$)/g, ' ');
                this.marker.icon.imageDiv.className += ' slast';
              }
            }

            // Zoom to marker, only one selected
            if (e.metroNames.length == 1) {
              that.setCenter(this.marker.lonlat, 15);
              this.marker.events.triggerEvent(map.settings.screenType);
            }
          }

          // Lines
          if (e.metroNames && e.metroNames.length > 1 && this.lines[0].stations) {
            var has_lines = true;
            for (var key in this.lines[0].stations) {
              if (e.metroNames.indexOf(this.lines[0].stations[key].name) == '-1')
                has_lines = false;
            }

            // Highlight the lines
            if (has_lines) {
              this.lines[0].attributes.select = true;
            }

            if (!has_lines) {
              this.lines[0].attributes.outofscope = true;
            }
          }

          // No lines
          if (!e.metroNames || e.metroNames.length < 1)
            this.lines[0].attributes.outofscope = true;

          // Register deselection event.
          this.layer.map.events.register("deselectMetro", this, function(e) {
            // Reset the lines
            //this.lines[0].attributes.highlight = false;
            this.lines[0].attributes.select = false;
            this.lines[0].attributes.outofscope = false;

            this.marker.icon.imageDiv.className = this.marker.icon.imageDiv.className.replace(/(\s|^)highlight|selected|hfirst|hlast|sfirst|slast(\s|$)/g, ' ');

            // Unregister the event, we don't need it anymore : Perf problem if activated
            // this.layer.map.events.unregister("deselectMetro", this);

            // Make sure the popup is closed.
            if (this.popup)
              this.popup.hide();
          });
        });

        if (last) {
          var coords = [last];
          coords.push(lines[line][station]);
          marker.lines = this.drawMetroLine(coords, line);
        }
        last = lines[line][station];
      }
    }
  },

  selectMetroLine : function(line_number, highlight) {
    var lines = Drupal.settings.stm_app.metro_stations_geo || {};
    if (line_number) {
      var stations = lines[line_number];
    } else {
      for (var line_number in Drupal.settings.stm_app.metro_stations_geo)
        this.selectMetroLine(line_number);
      return ;
    }

    this.selectMetro(line_number, stations[0].name, stations[stations.length-1].name, highlight);
    this.zoomToBounds(this.getLayer("MarkerLayer").getDataExtent());
  },

  selectMetroStation : function(station_name, highlight) {
    var highlight = highlight ? true : false;
    station_name = station_name.replace('Station','').trim();

    this.map.events.triggerEvent("selectMetro", {metroNames : [station_name], highlight : highlight});
    // Redraw the layer to apply the styles
    this.map.getLayersByName("MetroLayer")[0].redraw();
  },

  selectMetro : function (line_number, from, to, highlight) {
    var lines = Drupal.settings.stm_app.metro_stations_geo || {};
    var stations = lines[line_number];
    var highlight = highlight ? true : false;

    from = from.replace('Station','').trim();
    to = to.replace('Station','').trim();
    
    // Find from and to
    for (var key in stations) {
      if (stations[key].name == from) from = parseInt(key);
      if (stations[key].name == to) to = parseInt(key);
    }

    // Check if 'to' is actually before 'from'
    first = to > from ? from : to;
    last = to > from ? to : from;

    // Splice
    stations = stations.slice(first, last+1);

    // Trigger select event on stations
    var names = [];
    for (var key in stations) names.push(stations[key].name);

    this.map.events.triggerEvent("selectMetro", {metroNames : names, highlight : highlight});
    // Redraw the layer to apply the styles
    this.map.getLayersByName("MetroLayer")[0].redraw();
  },

  deselectMetro : function(all) {
    // Deselect all
    if (all) {
      this.map.events.triggerEvent("selectMetro", {metroNames:''});
    } else {
      this.map.events.triggerEvent("deselectMetro");
    }

    // Redraw the layer to apply the styles
    this.map.getLayersByName("MetroLayer")[0].redraw();
  },

  drawPolygon : function(origin, radius, sides, rotate) {
    if (typeof origin != 'object') return false;

    // Find the PolygonLayer
    var polygons = this.map.getLayersByName("PolygonLayer")[0];

    var style = this.settings.polygons.default;

    var feature = new OpenLayers.Feature.Vector(OpenLayers.Geometry.Polygon.createRegularPolygon(
      new OpenLayers.Geometry.Point(origin.lon, origin.lat).transform(this.proj, this.map.getProjectionObject()),
      radius,
      sides,
      rotate
    ), null, style);

    // Listen for destroy event.
    this.map.events.register("destroy", this.map , function(e){ 
      if (e.el && typeof e.el == 'object' && feature.bind && e.el.isEqualNode(feature.bind) || e.all === true && feature.bind) {
        feature.destroy();
      }
    });

    polygons.addFeatures([feature]);
    return feature;
  },
  // map.drawCircle({lon: "-73.573601", lat: "45.499322"}, 100);
  drawCircle : function(origin, radius) {
    return this.drawPolygon(origin, radius/Math.cos(50*(Math.PI/180)), 40, 0);
  },

  clearPolygons : function() {
    if (this.map.getLayersByName("PolygonLayer")[0]) this.map.getLayersByName("PolygonLayer")[0].destroy();
  },

  getLayer : function (name) {
    return this.map.getLayersByName(name)[0];
  }
};

jQuery(document).ready(function() { map.init(); });;
/*
 Requires: stm/map.js, stm/api.js, jQuery
 */

(function($) {
  $.fn.extend({
    ajaxIt : function(xhr) {
      // If this element has an xhr already attached, abort it
      if (this.data('xhr')) this.data().xhr.abort();

      // attach this new one
      if (xhr) this.data().xhr = xhr;
    },

    drawStopMarker : function(item) {
      var that = this, 
        cxt = this.parents('.sub-search-box').find('.all-pane').attr('id').split('-')[1] == 'plan' ? 'plan' : 'horaires',
        per_page = 3;

      item.stop_lon = item.stop_lon || item.lon;
      item.stop_lat = item.stop_lat || item.lat;
      item.stop_code = item.stop_code || item.identifier;
      item.stop_name = item.stop_name || item.description;

      // Title
      var html = '<div class="title"><span class="stop-name">' + item.stop_name + '</span> <span class="stop-code">(' + item.stop_code + ')</span></div>';

      // List of lines
      html += '<div class="is-hovered line-list-icon"></div>';
      html += '<ul class="is-hovered line-list">';
      $.each(item.line, function(index, line) {
        line.public_identifier = item.line[index].public_identifier = line.public_identifier ||line.line_public_id;
        line.direction = item.line[index].direction = line.direction || line.line_direction;
        line.direction_name = item.line[index].direction_name = line.direction_name || line.line_direction_name;
        line.description = item.line[index].description = line.description || line.line_description;
        line.category = item.line[index].category = line.category;// || methods.getCurrentSearch().category;

        html += '<li>' + line.public_identifier + '&nbsp;' + line.direction_name.toUpperCase();
        if (index != item.line.length - 1) html += ' - ';
        html += '</li>';
      });
      html += '</ul>';

      // Line schedules & pagination
      html += '<div class="lines page-1">';

      var total = Math.ceil(item.line.length / per_page);
      $.each(item.line, function(index, line) {

        html += '<div class="line line-' + line.public_identifier + line.direction.toUpperCase().substr(0,1) + ' page-' + Math.ceil((index+1) / per_page) + '"';
          if (Math.ceil((index+1) / per_page) > 1) html += ' style="display:none"';
          html += '>';
        html += '<div class="name"><div class="icon bus-type-' + line.category + '"></div>Bus <strong>' + line.public_identifier + '</strong> ' + line.description + ' dir. ' + line.direction_name.toUpperCase() + '</div>';
        html += '<ul class="date-list loading"></ul>';
        // if we are on metro, we show bus tab
        if( !that.hasClass('metro-plan') ) {
          html += '<a class="more" data-href="/' + (cxt ? cxt : 'horaires') + '/line/'+line.public_identifier+line.direction.substr(0,1)+'/stop/'+item.stop_code+'">' + $.t('schedule') + '</a>';
        }
        html += '</div>';
      });
      html += '</div>';

      // Pagination
      if (item.line.length > per_page) {
        html += '<div class="pagination">';
        html += '<a class="prev disabled">&lt;</a>';
        html += '<div class="pages"><span class="current">1</span> / <span class="total">' + total + '</span></div>';
        html += '<a class="next">&gt;</a>';
        html += '</div>';
      }

      // Add marker, bind to address-search
      var marker = map.addMarker(item.stop_lon, item.stop_lat, item.ends ? 'stopEnds' : 'stop', html, true);

      // Add stopcode class and data attribute
      $(marker.marker.icon.imageDiv).addClass('stm-stopcode-'+item.stop_code);
      marker.data.item = item;

      // Get marker to listen for select event.
      map.getLayer("MarkerLayer").events.register("selectStop", marker, function (e) {
        
        if (this.popup) {
          this.popup.hide();
          $('#address-line .search, #next-passages, #address-line-plan .search, #next-passages-plan, #bus-list-plan').removeClass('disabled');
          $(this.popup.div).addClass('stm-popup-stop').removeClass('stm-form-selected');
          if (this.data.item.stop_code == e.item.stop_code || e.item.type == "Lines") {
            $(this.popup.div).addClass('stm-form-selected');
            this.marker.events.triggerEvent(map.settings.screenType, {item:e.item,line:e.line});
            map.setCenter(this.data.item.stop_lon, this.data.item.stop_lat, 17);
          }
        }
      });

      // Listen for popup open event. Load schedules.
      marker.marker.events.register(map.settings.screenType, {marker: marker, item: item}, this.loadPopupSchedule);

      // "More" click
      $.each(item.line, function(index, line) {
        $(marker.popup.div).find('.more:eq(' + index + ')').data({line:line, stopcode:item.stop_code, stopName:item.stop_name});
      });

      // Click events

      $(marker.popup.div).on('click', '.more', function() {
        var href = $(this).attr('data-href');
        var data = $(this).data();

        that.parents('.sub-search-box').find('.search-pane').hide();
        that.parents('.sub-search-box').find('.all-pane').data(data);
        that.parents('.sub-search-box').find('.all-pane').data('methods').init();
      }).on('click', '.pagination .prev', function() {
        var prev_page = parseInt( $(marker.popup.div).find('.current').text() ) - 1;
        $(this).showPaginationPage( marker, prev_page );
      }).on('click', '.pagination .next', function() {
        var next_page = parseInt( $(marker.popup.div).find('.current').text() ) + 1;
        $(this).showPaginationPage( marker, next_page );
      });

      // Adjust popup size
      marker.popup.adjust();

      map.bind(this.get(0), marker);
      return marker;
    },

    showPaginationPage : function(marker, number) {

      var $item = $(marker.popup.div);
      var current = parseInt($item.find('.current').text());
      var total = parseInt($item.find('.total').text());
      var lines = $item.find('.lines');

      if (number <= 0 || number > total || lines.find('.page-' + number).size() <= 0) return ;

      lines.removeClass('page-' + current).addClass('page-' + number);
      lines.find('.page-' + current).hide();
      lines.find('.page-' + number).show();

      $item.find('.prev').removeClass('disabled');
      $item.find('.next').removeClass('disabled');

      if (number == 1)     $item.find('.prev').addClass('disabled');
      if (number == total) $item.find('.next').addClass('disabled');

      $item.find('.current').html(number);

      marker.popup.adjust();
    },

    loadPopupSchedule : function(e) {
      var that  = this,
          popup = $(this.marker.popup.contentDiv),
          accessible  = parseInt($.cookie('accessible'));

      // Are we loading a popup within the form's search criteria? If not, "disable" the fields
      if ($(this.marker.popup.div).hasClass('stm-form-selected')) {
        $('#address-line .search, #next-passages, #address-line-plan .search, #next-passages-plan, #bus-list-plan').removeClass('disabled');
      } else {
        $('#address-line .search.searched, #next-passages:visible, #address-line-plan .search.searched, #next-passages-plan:visible, #bus-list-plan.searched').addClass('disabled'); 
        $('#al-1-plan, #al-1').blur();
      }

      // Is this stop outside of the line searched as well??
      // Check if bound to #next-passages-plan-pane
      // If not, and not .stm-form-selected, disable bus title

      if ($(this.marker.bind).attr('id') != 'next-passages-plan-pane' && $('#next-passages-plan-pane').data('stop_code') != this.item.stop_code) {
        $('#next-passages-plan-pane h2').addClass('disabled');
      } else {
        $('#next-passages-plan-pane h2').removeClass('disabled');
      }

      // Abort any AJAX queries associated with this popup
      if (popup.data().xhr && popup.data().xhr.length > 0) {
        for(i=0;i<popup.data().xhr.length;i++) {
          popup.data().xhr[i].abort();
        }
      }
      popup.data().xhr = [];

      // Adjust popup size
      this.marker.popup.adjust();

      $.each(this.item.line, function(index, line) {
        line.public_identifier = line.public_identifier || line.line_public_id;
        line.direction = line.direction || line.line_direction;

        var line_id = line.public_identifier+line.direction.toUpperCase().substr(0,1);
        var div = popup.find('.line-'+line_id);

        div.removeClass('current-line');

        if ( e.line ) {
          if ( e.line == line_id ) {
            div.addClass('current-line');
            var show_page = div.prop('class').match(/page-([0-9]+)/)[1];
            $(that.marker.popup.div).showPaginationPage( that.marker, show_page );
          }
        }

        div.find('.date-list').addClass('loading');
        div.find('.date-list').empty();

        div.removeClass('only-accessible');
        if (accessible) div.addClass('only-accessible');

        // Fetch data for each line
        var xhr = stm.getLineStopTime(that.item.stop_code, line_id, new Date(), 5, (accessible ? 1 : 0), function(data, status, jqXHR) {
          div.find('.date-list').removeClass('loading');
          map.ui.dateList(data.result, div.find('.date-list'));

          // Adjust popup size
          that.marker.popup.adjust();
          that.marker.popup.panIntoView();

        });
      });
    }
  });
})(jQuery);

var map = map || {};
map.ui = {
  dateList : function(items, ul) {
    if (items.status && items.status.level == 'Error') {
      //jQuery('<li>').addClass('error').html(items.status.message).appendTo(ul);
      return;
    }

    var notes = 0;
    ul.empty();
    jQuery.each(items, function(index, item) {
      item.time = item.time.substr(0,2)+'h'+item.time.substr(2,4);
      var li = jQuery('<li>').html(item.time).appendTo(ul);
      // Is the stop cancelled
      if (item.is_cancelled) li.addClass('is-cancelled');

      notes += item.note.length;
    });

    return notes;
  },

  parseItem : function(item, type) {
    item = item || {};
    item.type = type;

    switch(type) {
      case 'LinesStops': // AutocompletePosition
        item.label = item.public_identifier+' '+item.description;
        item.group = 'directions';
        jQuery.each(item.directions, function(k, v) {
          item.directions[k].label = '<span class="direction">' + item.public_identifier + ' ' + v.direction_name.toUpperCase() + '</span>, <span class="stop-name">' + stm.str('Arrêt', 'Stop') + ' ' + v.stop_name + '</span> <span class="distance">(' + v.distance.toString().split('.')[0] + 'm)</span>';
          item.directions[k].value = item.public_identifier + ' ' + item.description + ' ' + v.direction_name.toUpperCase();
          item.directions[k].public_identifier = item.public_identifier;
        });
      break;
      case 'AutocompleteLines':
      case 'Lines':
      case 'ExceptionalLines':
        item.direction_name = item.direction_name.toUpperCase() || '';
        item.value = item.public_identifier+' '+item.description+' '+item.direction_name;
        item.label = item.public_identifier+' '+item.description+' dir. '+item.direction_name;
      break;
      case 'Stops': //AutocompleteLines
        item.value = item.label = item.description+' ('+item.identifier+')';
      break;
      default:
        item.value = item.label = item.description;
      break;
    }
    return item;
  }
};;
