/*
 * Ext.ux.google.map.View
 *
 * Project Home: http://code.google.com/p/extuxgoogle/ 
 * API Documentation: http://extuxgoogle.googlecode.com/svn/trunk/docs/index.html 
 *
 * copyright   Copyright 2009 Yuki Naotori
 * license     GNU General Public License version 3
 *
 * The content of this file is an implementation of Ext JS version 2.
 * Thus this is subject to the Open Source License of Ext JS
 * http://extjs.com/license, and is licensed under GNU General Public
 * License version 3 http://www.gnu.org/copyleft/gpl.html
 */

Ext.namespace('Ext.ux');
Ext.namespace('Ext.ux.google');
Ext.namespace('Ext.ux.google.map');

/**
 * @class Ext.ux.google.map.View
 * @extends Ext.DataView
 * <p>This class extends {@link Ext.DataView} and displays maps/markers
 * stored in its store. Records in the store must have both "lat" and "lng"
 * to be mapped on the map.</p>
 * <p>This class utilizes (but not necessarily needs){@link Ext.ux.google.Loader}
 * to create a script tag to dynamically include and load Google Maps API.
 * User only needs to specify his API key in config options.</p>
 * <p>If Google Maps API is dynamically loaded, make sure to check {@link #isReady isReady()} method
 * or "mapapiinitialized" event before start interacting with map / markers</p>
 * @author Yuki Naotori
 * @version 0.1
 */
Ext.ux.google.map.View = Ext.extend(Ext.DataView, function(){
  // private vars and methods
  
  /*
   * a flag to check if the Google Maps API is ready
   */
  var _mapapiinitialized = false;

  /*
   * called after Google Maps API is loaded
   * initializes API constants and methods, and fires "mapapiinitialized" event
   */
  var initMapApi = function(opt){
    opt = opt || {};
    if(opt instanceof Array) opt = opt[0]; 
  
    /*
     * wrapper for Google Maps API methods
     */
    Ext.ux.google.map.View.prototype._G = {
      map: google.maps.Map2,  
      latlng: google.maps.LatLng,  
      marker: google.maps.Marker,  
      point: google.maps.Point,  
      event: google.maps.Event,  
      infowindowtab: google.maps.InfoWindowTab,  
      infowindowtabshtml: google.maps.InfoWindowTabsHtml,  
      clientgeocoder: google.maps.ClientGeocoder,
      scalecontrol: google.maps.ScaleControl,
      overviewcontrol: google.maps.OverviewControl
    };

    /*
     * wrapper for Google Maps API constants for map types
     */
    Ext.ux.google.map.View.prototype._maptypes = {
      normal: google.maps.NORMAL_MAP,
      satellite: google.maps.SATELLITE_MAP,
      hybrid: google.maps.HYBRID_MAP,
      physical: google.maps.PHYSICAL_MAP,
      moon_elevation: google.maps.MOON_ELEVATION_MAP,
      moon_visible: google.maps.MOON_VISIBLE_MAP,
      mars_elevation: google.maps.MARS_ELEVATION_MAP,
      mars_visible: google.maps.MARS_VISIBLE_MAP,
      mars_infrared: google.maps.MARS_INFRARED_MAP,
      sky_visible: google.maps.SKY_VISIBLE_MAP,
      satellite_3d: google.maps.SATELLITE_3D_MAP
      /*
      default: google.maps.DEFAULT_MAP_TYPES,
      moon: google.maps.MOON_MAP_TYPES,
      mars: google.maps.MARS_MAP_TYPES,
      sky: google.maps.SKY_MAP_TYPES
      */
    };

    /*
     * wrapper for Google Maps API controls 
     */
    Ext.ux.google.map.View.prototype._controls = {
      large: google.maps.LargeMapControl,
      small: google.maps.SmallMapControl,
      mini:  google.maps.SmallZoomControl
    };

    /*
     * wrapper for Google Maps API map type controls 
     */
    Ext.ux.google.map.View.prototype._maptypecontrols = {
      normal: google.maps.MapTypeControl,
      menu: google.maps.MenuMapTypeControl,
      hierarchical: google.maps.HierarchicalMapTypeControl
    };

    _mapapiinitialized = true;
    this.fireEvent('mapapiinitialized', this);

    if(opt.callback){
      opt.callback.call(opt.scope || this);
    }
  };

  /*
   * render a map and initialize it to given config options
   * fires "maprender" event
   */
  var renderMap = function(){
    var prot = Ext.ux.google.map.View.prototype;
    var G = prot._G;

    var opt = {};

    var cfg = this.mapConfig || {};

    // Map types (e.g "normal", "satellite", "hybrid" etc)
    if(cfg.maptypes){
      var m = cfg.maptypes;
    
      if(m.types){
        var mt =  [];
        if(m.types instanceof Array){
          for(var i=0; i<m.types.length; i++){
            if(m.types[i] in prot._maptypes){
              mt.push(prot._maptypes[m.types[i]]);
            }
          }
        }else if(m.types in prot._maptypes){
          mt.push(prot._maptypes[m.types]);
        }

        if(mt.length > 0) opt.mapTypes = mt;
      }
    }

    // Creates a map on "this.el.dom"
    var map = new G.map(this.el.dom, opt);

    if(cfg.maptypes){
      var m = cfg.maptypes;
    
      if(m.init && 
         m.init !== 'normal' && 
         m.init !== 'default' && 
         m.init !== 'moon' && 
         m.init !== 'mars' && 
         m.init !== 'sky' && 
         (m.types && m.init in m.types) && 
         m.init in prot._maptypes){
        map.setMapType(prot._maptypes[m.init]);  
      }
    }else{
      map.setMapType(map.getMapTypes()[0]);
    }

    // Continuous Zoom (default false)
    if(cfg.contZoom === true) map.enableContinuousZoom();

    // Mouse Wheel Zoom (default false)
    if(cfg.wheelZoom === true) map.enableScrollWheelZoom(); 

    // Doubleclick Zoom (default true)
    if(cfg.dblZoom === false) map.disableDoubleClickZoom(); 

    // Draggable map (default true)
    if(cfg.drag == false) map.disableDragging(); 

    // Google search bar (default false)
    if(cfg.googlebar === true) map.enableGoogleBar();

    // Map control widgets
    if(cfg.controls){
      var c = cfg.controls;

      // Scale control
      if(c.scale) map.addControl(new G.scalecontrol());
      
      // Overview control
      if(c.overview) map.addControl(new G.overviewcontrol());
      
      // Maptype control
      if(c.maptype && c.maptype in prot._maptypecontrols){
        map.addControl(new prot._maptypecontrols[c.maptype]());  
      }

      // Zoom-in/out & pan control
      if(c.control && c.control in prot._controls){
        map.addControl(new prot._controls[c.control]());  
      }
    }

    // GeoIP like ip -> lat/lng conversion
    if(cfg.geoip && google.loader.ClientLocation){
      cfg.lat = google.loader.ClientLocation.latitude;
      cfg.lng = google.loader.ClientLocation.longitude;
    }

    map.setCenter(new G.latlng(cfg.lat, cfg.lng),cfg.zoom);
    map.checkResize();

    this.map = map;

    this.fireEvent('maprender',this, this.map);
  };

  /*
   * Create markers from data in the store and renders them on the map
   * fires "markerrender" event
   */
  var renderMarkers = function(){
    if(!this.store) return;

    // defer until the map is renderred
    if(!this.map){
      this.on('render', function(t){
        t.renderMarkers();
      });
      return;
    };

    var store = this.store;
    this.clearMarkers();

    store.each(function(r){
      this.createMarker(r, this.getConfig(r.id));
    },this);

    this.fireEvent('markerrender',this,this.markers);
    return;
  };

  return {

    ver: '0.1',

    /**
     * @cfg String apiKey
     * API Key to use Google Maps API. Required if dynamically including and loading the api.
     */
    apiKey: null,

    /**
     * @cfg Object mapConfig
     * Config options to initialize the map.
     * <div class="mdetail-params"><ul>
     * <li><b>lat</b>: float<div class="sub-desc">latitude for the center of map (-90~90, default to 0)</div></li>
     * <li><b>lng</b>: float<div class="sub-desc">longitude for the center of map (-180~180, default to 0)</div></li>
     * <li><b>zoom</b>: int<div class="sub-desc">zoom level for the map (0~18, default to 0)</div></li>
     * <li><b>drag</b>: bool<div class="sub-desc">enable/disable draggable map (default to true)</div></li>
     * <li><b>contZoom</b>: bool<div class="sub-desc">enable/disable smooth zoom-in/out of map (default to true)</div></li>
     * <li><b>dblZoom</b>: bool<div class="sub-desc">enable/disable zoom-in/out of map by mouse double-clicking (default to true)</div></li>
     * <li><b>wheelZoom</b>: bool<div class="sub-desc">enable/disable zoom-in/out of map by mouse wheel (default to true)</div></li>
     * <li><b>googlebar</b>: bool<div class="sub-desc">show/hide "Google Bar" on the map (default to false)</div></li>
     * <li><b>geoip</b>: bool<div class="sub-desc">Try to estimate user's location from IP address, and set it to map's initial lat/lng (if not found, default lat/lng will be set insted)</div></li>
     * <li><b>controls</b>: Object<div class="sub-desc">specifies the controls to display on the map
     * <ul>
     * <li><b>scale</b>: bool<div class="sub-desc">displays a scale on the bottom of map (default to true)</div></li>
     * <li><b>control</b>: string/bool<div class="sub-desc">displays a zoom-in/out & pan control ("large" or "small", default to "small". false to hide contol)</div></li>
     * <li><b>overview</b>: bool<div class="sub-desc">displays a small map on the right bottom corner of map (default to false)</div></li>
     * <li><b>control</b>: string/bool<div class="sub-desc">displays a map type change control ("normal", "menu", or "hiearchical" default to "normal". false to hide contol)</div></li>
     * </ul></div>
     * </li>
     * <li><b>maptypes</b>: Object<div class="sub-desc">specifies the initial map type and supported map types 
     * <ul>
     * <li><b>init</b>: string<div class="sub-desc">default map type (default to "normal")</div></li>
     * <li><b>types</b>: array<div class="sub-desc">supported map types in this view (default to ["normal", "satellite", "hybrid"])</div></li>
     * </ul>
     * Available map types are: 
     * <ul>
     * <li>normal</li>
     * <li>satellite</li>
     * <li>hybrid</li>
     * <li>physical</li>
     * <li>moon_elevation</li>
     * <li>moon_visible</li>
     * <li>moon_infrared</li>
     * <li>mars_visible</li>
     * <li>mars_infrared</li>
     * <li>sky_visible</li>
     * <li>satellite_3d (requires Google Earth Plugin on supported browser)</li>
     * </ul></div>
     * </ul></div>
     */      

    mapConfig: {
      
      lat: 0,
  
      lng: 0,
  
      zoom: 0,
  
      drag: true,
  
      contZoom: true,
  
      dblZoom: true,
  
      wheelZoom: true,
  
      googlebar: false,
  
      geoip: false,
  
      controls: {
        scale: true,
        control: 'small',
        overview: false,
        maptype: 'normal'
      },
  
      maptypes: {
        init: 'normal',
        types: ['normal', 'satellite', 'hybrid']
      }

    },

    /**
     * Create a new Ext.ux.google.map.View
     * @method View
     * @param {Object} config Config options
     */
    constructor: function(){
      Ext.ux.google.map.View.superclass.constructor.apply(this, arguments);
      if(this.mapConfig){
        Ext.applyIf(this.mapConfig, Ext.ux.google.map.View.prototype.mapConfig);
        Ext.applyIf(this.mapConfig.controls, Ext.ux.google.map.View.prototype.mapConfig.controls);
        Ext.applyIf(this.mapConfig.maptypes, Ext.ux.google.map.View.prototype.mapConfig.maptypes);
      }
    },

    // private
    initComponent:  function(){
      Ext.ux.google.map.View.superclass.initComponent.call(this);

      this.addEvents(
        /**
         * @event mapapiinitialized Fires when Google Maps API is loaded and ready to use
         * @param {Ext.ux.google.map.View} this
         */
        'mapapiinitialized',

        /**
         * @event maprender Fires when a map is rendered
         * @param {Ext.ux.google.map.View} this
         * @param {google.maps.Map2} map Google Map object
         */
        'maprender',

        /**
         * @event markerclick Fires when a marker is clicked
         * @param {int} rec_id id of the record bound to clicked marker
         * @param {google.maps.Marker} marker Google Map marker object
         * @param {Array/String} content (optional) Content of InfoWindow (can be array of InfoWindowTabsHtml or html string)
         */
        'markerclick',

        /**
         * @event markerrender Fires when markers are rendered
         * @param {Ext.ux.google.map.View} this
         * @param {Array} markers Array of google.maps.Marker
         */
        'markerrender',

        /**
         * @event markerclear Fires when all markers are cleared from map
         * @param {Ext.ux.google.map.View} this
         */
        'markerclear',

        /**
         * @event mapmovestart Fires when map moving starts
         * @param {Ext.ux.google.map.View} this
         */
        'mapmovestart',

        /**
         * @event mapmove Fires when map is being moved
         * @param {Ext.ux.google.map.View} this
         */
        'mapmove',

        /**
         * @event mapmove Fires when map moving ends
         * @param {Ext.ux.google.map.View} this
         */
        'mapmoveend',

        /**
         * @event mapdragstart Fires when map dragging starts
         * @param {Ext.ux.google.map.View} this
         */
        'mapdragstart',

        /**
         * @event mapdrag Fires when map is being dragged
         * @param {Ext.ux.google.map.View} this
         */
        'mapdrag',

        /**
         * @event mapdragend Fires when map dragging ends
         * @param {Ext.ux.google.map.View} this
         */
        'mapdragend',

        /**
         * @event maptypechanged Fires when map type is changed
         * @param {Ext.ux.google.map.View} this
         */
        'maptypechanged',

        /**
         * @event mapzoomend Fires when zooming (in/out) of map ends
         * @param {Ext.ux.google.map.View} this
         * @param {Array} args <div class="sub-desc"><ul>
         * <li>args[0]:int old zoom level</li>
         * <li>args[1]:int new zoom level</li>
         * </ul></div>
         */
        'mapzoomend',

        /**
         * @event mapclick Fires when map is clicked
         * @param {Ext.ux.google.map.View} this
         * @param {Array} args <div class="sub-desc"><ul>
         * <li>args[0]:google.maps.Overlay overlay</li>
         * <li>args[1]:google.maps.LatLng lat/lng</li>
         * <li>args[2]:google.maps.LatLng overlay lat/lng</li>
         * </ul></div>
         */
        'mapclick',

        /**
         * @event mapdblclick Fires when map is double-clicked
         * @param {Ext.ux.google.map.View} this
         * @param {Array} args <div class="sub-desc"><ul>
         * <li>args[0]:google.maps.Overlay overlay</li>
         * <li>args[1]:google.maps.LatLng lat/lng</li>
         * </ul></div>
         */
        'mapdblclick',

        /**
         * @event mapcontextmenu Fires when map is right-clicked
         * @param {Ext.ux.google.map.View} this
         * @param {Array} args <div class="sub-desc"><ul>
         * <li>args[0]:google.maps.Point point</li>
         * <li>args[1]:HTMLElement src</li>
         * <li>args[2]:google.maps.Overlay overlay</li>
         * </ul></div>
         */
        'mapcontextmenu',

        /**
         * @event infowindowopen Fires when InfoWindow opens
         * @param {Ext.ux.google.map.View} this
         */
        'infowindowopen',

        /**
         * @event infowindowclose Fires when InfoWindow closes
         * @param {Ext.ux.google.map.View} this
         */
        'infowindowclose'
      );
    },

    // private
    initMapApi: function(opt){
      opt = opt || {};

      try{
        Ext.ux.google.Loader.init(Ext.applyIf(this, {
          api: 'maps',
          ver: '2',
          callback: initMapApi,
          scope: this,
          args: [opt]
        }));
      }catch(e){
        if(e.name === 'ApiLoading'){
          return;  
        }else{
          throw e;
        }
      }
    },

    // overridden method
    onRender: function(){
      Ext.ux.google.map.View.superclass.onRender.apply(this, arguments);

      // necessary to render map correctly
      this.el.applyStyles({
        width: '100%',
        height: '100%'
      })

      // markers will be boud to the records in store
      this.markers = new Ext.util.MixedCollection(false);
      this.markers.getKey = function(o){
         return o.rec_id;
      };

      try{
        // if API initialization succeeds, then render map and markers
        this.initMapApi({
          scope: this,
          callback: function(){
            renderMap.call(this);
            renderMarkers.call(this);
          }
        });  
      }catch(e){
        console.log(e);  
      }
    },

    // overriden method to dynamically bind Map related events when necessary
    addListener: function(eventName, handler, scope, options){
      var prot = Ext.ux.google.map.View.prototype;
      var G = prot._G;

      // supported map events (add event pairs if necessary)
      var events = {
        mapmovestart : 'movestart',
        mapmove : 'move',
        mapmoveend : 'moveend',
        mapdragstart : 'dragstart',
        mapdrag : 'drag',
        mapdragend : 'dragend',
        maptypechanged : 'maptypechanged',
        mapzoomend : 'zoomend',
        mapclick : 'click',
        mapdblclick : 'dblclick',
        mapcontextmenu : 'singlerightclick'
      };

      if(typeof eventName == 'object'){
          o = eventName;
          for(var e in o){
          if(this.filterOptRe.test(e)){
            continue;
            }
            if(typeof o[e] == "function"){
            this.addListener(e, o[e], o.scope,  o);
            }else{
            this.addListener(e, o[e].fn, o[e].scope, o[e]);
            }
          }
          return;
      }

      if(eventName in events && !this.map){
        // defer binding until the map is ready
        this.on('render', function(t){
          t.on(eventName, handler, scope, options);
        });
        return;
      }else if(eventName in events){
        var e = events[eventName];
        var me = this;

        // bind Map event to Ext custom event
        G.event.addListener(this.map, e, function(){
          // Custom event fires with an array of original arguments
          me.fireEvent(eventName, me, arguments);  
        });
      }

      Ext.ux.google.map.View.superclass.addListener.call(this, eventName, handler, scope, options);                          
    },


    /**
     * Clear all markers on the map
     * @method clearMarkers
     * @return {Ext.ux.google.map.View} this
     */
    clearMarkers: function(){
      if(!_mapapiinitialized) return;

      var prot = Ext.ux.google.map.View.prototype;
      var G = prot._G;

      if(this.markers){
        this.markers.each(function(item, idx, num){
          G.event.clearInstanceListeners(item);
          this.map.removeOverlay(item);
        },this);
      }

      this.markers.clear();
      this.fireEvent('markerclear',this);

      return this;
    },

    /**
     * Returns marker by record id
     * @method getMarkerById
     * @param {int} id Record id in store
     * @return {google.maps.Marker} marker
     */
     getMarkerById : function(id){
       return this.markers.key(id);
     },

    /**
     * Returns marker config by its id
     * @method getConfig
     * @param {int} id Record id in store
     * @return {Object} cfg 
     */
    getConfig: function(id){
      // To be rewritten
      return {
        tpl: this.tpl,
        draggable: true,
        bouncy: true
      };
    },

    /**
     * Create a marker and show it on the map
     * @method createMarker
     * @param {Ext.data.Record} rec A single record data for marker. Record must have valid lat/lng pair to create a marker.
     * @param {Object} cfg Config options for a marker
     * @return {google.maps.Marker} marker
     */
    createMarker: function(rec, cfg){
      if(!_mapapiinitialized) return;
      
      var prot = Ext.ux.google.map.View.prototype;
      var G = prot._G;

      if(rec instanceof Array || cfg instanceof Array) return false;

      // rec must be a Ext.data.Record instance and must have lat/lng
      var data = rec.data;
      if(!data || typeof data.lat !== 'number' || typeof data.lng !== 'number' || 
          data.lat > 90 || data.lat < -90 || data.lng > 180 || data.lng < -180) return false;

      var mrk_opt = Ext.apply(this.mrk_opt || {}, cfg || {});

      // cfg must be valid options for google.maps.Marker constructor
      var mrk = new G.marker(new G.latlng(data.lat, data.lng), mrk_opt);
      mrk.rec_id = rec.id;

      var me = this;

      if(cfg.infowindow === false){
        G.event.addListener(mrk, 'click', function(){
          me.fireEvent('markerclick', this.rec_id, this);
        });
      }else if(cfg.tpl && cfg.tpl instanceof Array){
        var tabs = [];
        for(var i=0; i<cfg.tpl.length; i++){
          var html = cfg.tpl[i].apply(data);
          var label = (cfg.tablabel && cfg.tablabel[i]) ? cfg.tablabel[i] : 'Tab ' + (i+1); 
          tabs.push(new GInfoWindowTab(label, html));  
        }
        G.event.addListener(mrk, 'click', function(){
          this.openInfoWindowTabsHtml(tabs);
          me.fireEvent('markerclick', this.rec_id, this, tabs);
        });
      }else{
        var tpl = cfg.tpl || this.tpl;
        var html = tpl.apply(data);
        G.event.addListener(mrk, 'click', function(){
          this.openInfoWindowHtml(html);
          me.fireEvent('markerclick', this.rec_id, this, html);
        });
      }

      this.markers.add(mrk);
      this.map.addOverlay(mrk);
      return mrk;
    },

    /**
     * Remove a marker from the map
     * @method removeMarker
     * @param {Ext.data.Record} rec A single record data for marker.
     * @return {bool} status return false when given rec is not found in the store
     */
    removeMarker: function(rec){
      if(!_mapapiinitialized) return;
      
      var prot = Ext.ux.google.map.View.prototype;
      var G = prot._G;

      var mrk = this.getMarkerById(rec.id || rec);
      if(!mrk) return false;

      G.event.clearInstanceListeners(mrk);
      this.map.removeOverlay(mrk);

      this.markers.removeKey(mrk.rec_id);

      return true;
    },

    /**
     * Update a marker for a given rec and cfg
     * @method updateMarker
     * @param {Ext.data.Record} rec A single record data for marker. Record must have valid lat/lng pair to update a marker.
     * @param {Object} cfg Config options for a marker
     * @return {google.maps.Maker/bool} marker/status return false when given rec is not found in the store
     */
    updateMarker: function(rec, cfg){
      if(this.removeMarker(rec)){
        return this.createMarker(rec, cfg);
      }
      return false;
    },

    /**
     * Set the center of map to the given lat/lng and optionally set the zoom level
     * @method setCenter
     * @param {float} latitude (-90~90)
     * @param {float} longitude (-180~180)
     * @param {int} zoom (0~18)
     * @return {Ext.ux.google.map.View/bool} this/status return false when given params were invalid
     */
    setCenter: function(lat,lng,zoom){
      if(!_mapapiinitialized) return;
      
      if(lat instanceof Object){
        var cfg = lat;
        return this.setCenter(cfg.lat, cfg.lng, cfg.zoom);    
      }

      if(typeof lat !== 'number' || typeof lng !== 'number' ||
        lat > 90 || lat < -90 || lng > 180 || lng < -180) return false;

      if(typeof zoom === 'number') this.setZoom(zoom);
      this.map.setCenter(new GLatLng(lat,lng));
      return this;
    },

    /**
     * Set the zoom level of map
     * @method setZoom
     * @param {int} zoom (0~18)
     * @return {Ext.ux.google.map.View/bool} this/status return false when given params were invalid
     */
    setZoom: function(zoom){
      if(!_mapapiinitialized) return;
      
      if(zoom && typeof zoom !== 'number') return false;
      else if(typeof zoom === 'number' && (zoom > 18 || zoom < 0)) return false;

      this.map.setZoom(zoom);
      return this;
    },

    /**
     * Returns an array of markers
     * @method getMarkers
     * @return {Array} markers
     */
    getMarkers: function(){
      return this.markers;          
    },

    /**
     * Returns map object (google.maps.Map2)
     * @method getMap
     * @return {google.maps.Map2} map
     */
    getMap: function(){
      if(!_mapapiinitialized) return;
      
      return this.map;          
    },

    /**
     * Returns current zoom level
     * @method getZoom
     * @return {int} zoom
     */
    getZoom: function(){
      if(!_mapapiinitialized) return;
      
      return this.map.getZoom();          
    },

    /**
     * Returns center latitude/longitude pair of current map
     * @method getCenter
     * @return {Object} center accessible by center.lat and center.lng
     */
    getCenter: function(){
      if(!_mapapiinitialized) return;
      
      var c = this.map.getCenter();
      return {
        lat: c.lat(),
        lng: c.lng()
      };
    },

    /**
     * Returns corner coordinates of current map
     * @method getBounds
     * @return {Object} corner accessible by corner.north, corner.east, corner.south, and corner.west
     */
    getBounds: function(){
      if(!_mapapiinitialized) return;
      
      var b = this.map.getBounds();
      var ne = b.getNorthEast();
      var sw = b.getSouthWest();

      return {
        north: ne.lat(), 
        east: ne.lng(), 
        south: sw.lat(), 
        west: sw.lng() 
      };
     },

    // overridden method
    refresh: function(){
      if(!_mapapiinitialized){
        // defere until the api is ready
        this.on('mapapiinitialized', function(){
          this.refresh();
        }, this);
        return;        
      }

      var records = this.store.getRange();
      if(records.length < 1){
        this.all.clear();
        return;
      }
      this.all.fill(Ext.query(this.itemSelector, this.el.dom));
      this.updateIndexes(0);
      renderMarkers.call(this);
    },

    // overridden method
    onAdd: function(ds, recs, idx){
      var l = recs.length;
      for(var i=0; i<l; i++){
        this.createMarker(recs[i], this.getConfig(recs[i].id));  
      }
     },

    // overridden method
    onRemove: function(ds, recs, idx){
      var l = recs.length;
      for(var i=0; i<l; i++){
        this.removeMarker(recs[i]);  
      }
     },

    // overridden method
    onUpdate: function(ds, recs){
      var l = recs.length;
      for(var i=0; i<l; i++){
        this.updateMarker(recs[i], this.getConfig(recs[i].id));  
      }
     },

    /**
     * Opens an infowindow for a specified marker with specified content
     * @method openInfoWindow
     * @param {google.maps.Marker} marker A marker to show infowindow
     * @param {Array/String} content An array of html strings or single string to display in infowindow
     * @param {Array} labels (optional) An array of labels for tabs in infowindow
     */
    openInfoWindow: function(mrk, html, labels){
      if(!_mapapiinitialized) return;
      
      var prot = Ext.ux.google.map.View.prototype;
      var G = prot._G;

      if(html && html instanceof Array){
        tabs = [];
        for(var i=0; i<html.length; i++){
          var label = (labels && labels[i]) ? labels[i] : 'Tab '+(i+1);
          tabs.push(new G.infowindowtabshtml(label, html[i]));
        }
        this.map.openInfoWindowTabsHtml(tabs);
      }else if(typeof html == 'string'){
        this.map.openInfoWindowHtml(html);  
      }else{
        G.event.trigger(mrk, 'click');
      }
    },

    /**
     * Returns the status of api availability
     * @method isReady
     * @return {bool} status 
     */
    isReady: function(){
      return _mapapiinitialized;
    }
  };
}());

Ext.ux.google.map.View.prototype.on = Ext.ux.google.map.View.prototype.addListener;

Ext.reg('gmapview',Ext.ux.google.map.View);
