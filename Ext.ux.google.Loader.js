/*
 * Ext.ux.google.Loader
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

/**
 * @class Ext.ux.google.Loader
 * @singleton
 * <p>This class loads Google AJAX API (currently supports "maps" and "search" apis). It first
 * checks if the <b>google.loader</b> is available. If not, it will dynamically generates a
 * script tag to load google.loader with a given api key. Then, it calls <b>goole.load()</b>
 * to load specific api, e.g. "maps" and "search".</p>
 * <p>If callback is supplied, it will be called when api is ready to use with given scope and arguments</p>
 * <p>Since Google AJAX API loading is asynchronous process (and takes good amount of time depending on environment),
 * object/method which uses this class needs to make sure to implement an event which notifies the readiness of api
 * and an alternative process while the api is not available</p>
 * @author Yuki Naotori
 * @version 0.1
 */
Ext.ux.google.Loader = function(){
  // loading status for more than one type of apis
  var loading = {};

  // check if given api is supported api 
  var checkApi = function(api){
    return (typeof api === 'string' && api in Ext.ux.google.Loader.API) ? true : false;
  };

  // check if google.loader is available, i.e. script tag for google api is present
  var isLoadable = function(){
    return (window.google && window.google.loader) ? true : false;
  };

  // check if given api is loaded
  var isLoaded = function(api){
    if(checkApi(api)){
      return (window.google && window.google[api]) ? true : false;  
    }else{
      return false;
    }
  };

  // check if given api is being loaded 
  var isLoading = function(api){
    return loading[api] ? true : false;  
  };

  // load Google AJAX API specified by cfg using google.load() method
  var load = function(cfg){
    // cfg must have "api" and "ver" and optinally "callback", "scope", "args"
    var api = cfg.api;
    if(checkApi(api)){
      try{
        // update loading status
        loading[api] = true;
        cfg = cfg || {};
        var ver = cfg.ver || Ext.ux.google.Loader.API[api].ver;
        google.load(api, ver, {
          callback: function(){
            loading[api] = false;
            if(google[api] && cfg.callback){
              cfg.callback.apply(cfg.scope || this, cfg.args || []);  
            }else{
              cfg.callback.apply(cfg.scope || this, [{
                error: Ext.ux.google.Loader.LOADFAILED
              }]);  
            }
          }
        });
      }catch(e){
        loading[api] = false;
        throw e;  
      }
    }else{
      throw Ext.ux.google.Loader.INVALIDAPI;
    }
  };

  // creates a script tag to load google.loader
  var loadScript = function(cfg){
    var cb = 'extuxgoogleCallback' + (new Date()).getTime();    

    // callback when google.loader is loaded
    window[cb] = load.createDelegate(null, [cfg]);
  
    var scr;
    scr = document.createElement("script");
    scr.setAttribute("type", "text/javascript");

    // cfg must have valid apiKey to load the goole.loader
    scr.setAttribute("src", "http://www.google.com/jsapi?key="+cfg.apiKey+"&callback="+cb); 
  
    document.getElementsByTagName("head")[0].appendChild(scr);
    return;
  };

  return {

    /**
     * Initializes Google AJAX API with specified api type and version
     * @method init
     * @param {Object} opt 
     * <ul>
     * <li><b>apiKey</b>: String<div class="sub-desc">required if script tag for api needs to be created</div></li>
     * <li><b>api</b>: String<div class="sub-desc">Api to load. Currently "maps" and "search" are supported</div></li>
     * <li><b>ver</b>: String<div class="sub-desc">Api version to load. If not given, default values (2 for maps, and 1 for search) will be used.</div></li>
     * <li><b>callback</b>: Function<div class="sub-desc">Callback function to be called when api is loaded and ready</div></li>
     * <li><b>scope</b>: Object<div class="sub-desc">Scope when callback function is called</div></li>
     * <li><b>args</b>: Array<div class="sub-desc">Array of arguments to pass to callback function</div></li>
     * </ul>
     */
    init: function(cfg){
      // If api is already loaded and available
      if(isLoaded(cfg.api)){
        if(cfg.callback){
          cfg.callback.apply(cfg.scope || this, cfg.args || []);
        }
        return;
      // If api is currently being loaded, wait and do the rest
      }else if(isLoading(cfg.api)){
        var task = {
          run: function(){
            if(!isLoading(cfg.api)){
              if(cfg.callback){
                cfg.callback.apply(cfg.scope || this, cfg.args || []);
              }
              Ext.TaskMgr.stop(task);
            }
          },
          interval: 10
        };
        Ext.TaskMgr.start(task);
        throw Ext.ux.google.Loader.LOADING;
      // If api is not loaded but loader is available
      }else if(isLoadable()){
        try{
          load(cfg);
          throw Ext.ux.google.Loader.LOADING;
        }catch(e){
          throw e;
        }
      // If both api and loader are not available, try to create a script tag with given Api key
      }else{
        if(cfg.apiKey){
          loadScript(cfg);  
          throw Ext.ux.google.Loader.LOADING;  
        }else{
          throw Ext.ux.google.Loader.UNAVAILABLE;
        }
      }
    },

   /**
    * Supprted API and default versions. Read only. <div class="mdetail-params"><ul>
    * <li>maps: api:'maps', ver:'2'</li>
    * <li>seaerch: api:'search', ver:'1'</li>
    * </ul></div>
    * @type Object
    * @property API
    */
    API: {
      maps: { api: 'maps', ver: '2' },
      search: { api: 'search', ver: '1' }
    },
  
   /**
    * Exception thrown when API is not available. Read only.
    * @type Object
    * @property UNAVAILABLE
    */
    UNAVAILABLE: {
      name: 'Unavialble',
      message: 'Google API is not available'
    },
  
   /**
    * Exception thrown when specified API is not supported. Read only.
    * @type Object
    * @property INVALIDAPI
    */
    INVALIDAPI: {
      name: 'InvalidApi',
      message: 'Invalid API name has been passed'
    },
  
   /**
    * Exception thrown when specified API version is not supported. Read only.
    * @type Object
    * @property INVALIDVERSION
    */
    INVALIDVERSION: {
      name: 'InvalidVersion',
      message: 'Invalid Version number has been passed'
    },
  
   /**
    * Exception thrown when API is being loaded. Read only.
    * @type Object
    * @property LOADING
    */
    LOADING: {
      name: 'ApiLoading',
      message: 'API is currently being loaded'
    },

   /**
    * Exception thrown when API loading failedi. Read only.
    * @type Object
    * @property LOADFAILED
    */
    LOADFAILED: {
      name: 'LoadFailed',
      message: 'API load failed'
    }
  };
}();



