/*
 * Ext.ux.google.search.Proxy
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
Ext.namespace('Ext.ux.google.search');

/**
 * @class Ext.ux.google.search.Proxy
 * @extends Ext.data.DataProxy
 * <p>This class extends {@link Ext.data.DataProxy} and retrieves data via Google Search API,
 * supporting its 6 types of search (web, local, news, blog, image, and video). This proxy can
 * be most easily used in cojunction with {@link Ext.ux.google.search.Reader} and {@Ext.ux.google.search.Store},
 * but it can be also integrated with existing Readers and Stores for more flexibility.</p>
 * <p>This class utilizes (but not necessarily needs){@link Ext.ux.google.Loader}
 * to create a script tag to dynamically include and load Google Search API.
 * User only needs to specify his API key in config options.</p>
 * <p>If Google Saerch API is dynamically loaded, make sure to check {@link #isReady isReady()} method
 * or "searchapiinitialized" event before start interacting with proxy</p>
 * @author Yuki Naotori
 * @version 0.1
 */
Ext.ux.google.search.Proxy = Ext.extend(Ext.data.DataProxy, function(){
  // private vars and methods
  
  /*
   * a flag to check if the Google Search API is ready
   */
  var  _searchapiinitialized = false;

  /*
   * called after Google Search API is loaded
   * initializes API constants and methods, and fires "searchapiinitialized" event
   */
  var initSearchApi = function(opt){
    opt = opt || {};
    if(opt instanceof Array) opt = opt[0]; 

    /*
     * wrapper for Google Search API constants
     */
    Ext.ux.google.search.Proxy.prototype._resultsize = {
      small: {
        str: google.search.Search.SMALL_RESULTSET,
        num: google.search.Search.SMALL_RESULTS
      },
      large: {
        str: google.search.Search.LARGE_RESULTSET,
        num: google.search.Search.LARGE_RESULTS
      }
    },

    cfg = this.searchConfig;

    this.searcher = {};

    // Search result size default to 'small'
    if(cfg.size in Ext.ux.google.search.Proxy.prototype._resultsize){
      this.size = Ext.ux.google.search.Proxy.prototype._resultsize[cfg.size].str;  
    }else{
      this.size = Ext.ux.google.search.Proxy.prototype._resultsize['small'].str;  
    }

    _searchapiinitialized = true;
    this.fireEvent('searchapiinitialized', this);

    // Searcher creation
    this.addSearcher(cfg.searcher);
    if(cfg.active && this.searcher[cfg.active]){
      this.setActiveSearcher(cfg.active);  
    }

    if(opt.callback){
      opt.callback.call(opt.scope || this);
    }
  };

  /*
   * Send search query to API and set the callback.
   * If no query is specified, it will try to search for the specified page.
   */
  var doSearch = function(o){
    var params = o.params;
    var query = params.query;

    var request = o.request || {};

    var searcher = this.getActiveSearcher();

    // If query is present, then make new search
    if(query || (searcher.results && searcher.results.length == 0)){
      if(params.searcher && typeof params.searcher == 'string' && this.searcher[params.searcher]){
        this.setActiveSearcher(params.searcher);
        searcher = this.getActiveSearcher();
      }

      searcher.setSearchCompleteCallback(o.scope || this, o.callback, [o]);
      searcher.execute(query);
    // If no query string is passed, then go to specified page
    }else{
      searcher.setSearchCompleteCallback(o.scope || this, o.callback, [o]);
      searcher.gotoPage(parseInt(params.page));
    }
  };

  return {
    ver: '0.1',

    /**
     * @cfg String apiKey
     * API Key to use Google Search API. Required if dynamically including and loading the api.
     */
    apiKey: null,

    /**
     * @cfg Object searchConfig
     * Config options to initialize the searcher.
     * <div class="mdetail-params"><ul>
     * <li><b>searcher</b>: Array/Object<div class="sub-desc">list of searchers to activate for this proxy (searchers can be
     * aslo added or removed afterwards). Supported searchers are:<ul>
     * <li><b>web</b><div class="sub-desc">searches web for a given query</div></li>
     * <li><b>local</b><div class="sub-desc">searches locations/facilities for a given query (and optionally location)</div></li>
     * <li><b>blog</b><div class="sub-desc">searches blogs for a given query</div></li>
     * <li><b>news</b><div class="sub-desc">searches news for a given query</div></li>
     * <li><b>image</b><div class="sub-desc">searches images for a given query</div></li>
     * <li><b>video</b><div class="sub-desc">searches videos for a given query</div></li>
     * </ul>If no searcher is specified, 'web' searcher will be activated as default.</div>
     * </li>
     * <li><b>size</b>: string<div class="sub-desc">sets the size of the search result set("large" or "small", default to "small".)</div></li>
     * <li><b>active</b>: int<div class="sub-desc">sets the active searcher if more than one searchers are activated. If not specified, the last searcher in the "searcher" property will become active searcher initially</div></li>
     * </ul></div>
     */      
    searchConfig: {
      searhcer: ['web'],
      size: 'large',
      active: 'web'
    },

    /**
     * Create a new Ext.ux.google.search.Proxy
     * @method Proxy
     * @param {Object} config Config options
     */
    constructor: function(c){
      Ext.ux.google.search.Proxy.superclass.constructor.call(this);
      Ext.apply(this, c || {});

      if(this.searchConfig){
        Ext.applyIf(this.searchConfig, Ext.ux.google.search.Proxy.prototype.searchConfig);
        Ext.applyIf(this.searchConfig.searcher, Ext.ux.google.search.Proxy.prototype.searchConfig.searcher);
      }

      this.addEvents(
        /**
         * @event searchapiinitialized Fires when Google Search API is loaded and ready to use
         * @param {Ext.ux.google.search.Proxy} this
         */
        'searchapiinitialized',

        /**
         * @event searcheradded Fires when new searcher is added
         * @param {string} name added searcher
         */
        'searcheradded',

        /**
         * @event searcherremoved Fires when a searcher is removed
         * @param {string} name removed searcher
         */
        'searcherremoved',

        /**
         * @event searcherchanged Fires when active searcher changed
         * @param {string} name active searcher
         */
        'searcherchanged',

        /**
         * @event searcherchanged Fires when specified searcher was not available from API
         * @param {Object} e Exception object
         */
        'searcherexception',

        /**
         * @event loadexception Fires if an exception occurs in the Proxy during data loading.  This event can be fired for one of two reasons:
         * <ul><li><b>The search result has no result.</b>  This means there was no result for a given query or some error
         * at Search API caused no result. In this case, this event will be raised and the fourth parameter (read error) will be null.</li>
         * <li><b>The load succeeded but the reader could not read the response.</b>  This means the server returned
         * data, but the configured Reader threw an error while reading the data.  In this case, this event will be 
         * raised and the caught error will be passed along as the fourth parameter of this event.</li></ul>
         * Note that this event is also relayed through {@link Ext.data.Store}, so you can listen for it directly
         * on any Store instance.
         * @param {Object} this
         * @param {Object} options The loading options that were specified (see {@link #load} for details)
         * @param {Object} response The response object containing the search result if any
         * @param {Error} e The JavaScript Error object caught if the configured Reader could not read the data.
         */
        'loadexception'
      );

      this.initSearchApi();
    },

    // private
    initSearchApi: function(opt){
      opt = opt || {};

      try{
        Ext.ux.google.Loader.init(Ext.applyIf(this, {
          api: 'search',
          ver: '1',
          callback: initSearchApi,
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

    /**
     * Load data via configured searcher, read the data object into
     * a block of Ext.data.Records using the passed {@link Ext.data.DataReader} implementation, and
     * process that block using the passed callback.
     * @param {Object} params An object containing properties which are to be used in search process. Supported properties are:
     * <div class="mdetail-params"><ul>
     * <li><b>query</b>: string<div class="sub-desc">Query string for search (if not specified, active searcher's search results will be checked with 'page' property)</div></li>
     * <li><b>searcher</b>: string<div class="sub-desc">Searcher to be used for this search (if not specified, active searcher will be used)</div></li>
     * <li><b>page</b>: int<div class="sub-desc">Page number to load from previously conducted search result</div></li>
     * @param {Ext.data.DataReader} reader The Reader object which converts the data
     * object into a block of Ext.data.Records.
     * @param {Function} callback The function into which to pass the block of Ext.data.Records.
     * The function must be passed <ul>
     * <li>The Record block object</li>
     * <li>The "arg" argument from the load function</li>
     * <li>A boolean success indicator</li>
     * </ul>
     * @param {Object} scope The scope in which to call the callback
     * @param {Object} arg An optional argument which is passed to the callback as its second parameter.
     */
    load : function(params, reader, callback, scope, arg){
      // If no query is given in params (or if active searcher has no search results), abort
      if((!params.query || typeof params.query !== 'string') && !this.getActiveSearcher().results) return;

      // defere until api is ready
      if(!_searchapiinitialized){
        this.on('searchapiinitialized', function(){
          this.load(params, reader, callback, scope, arg);
        }, this);
        return;        
      }

      if(this.fireEvent("beforeload", this, params) !== false){
        var  o = {
          params : params,
          request : {
            scope: scope,
            callback: callback,
            arg: arg
          },
          reader: reader,
          callback : this.loadResponse,
          scope: this
        };

        // set query string to active searcher and execute search process
        doSearch.call(this, o);
      }else{
      //    callback.call(scope||this, null, arg, false);
      }
    },

    // private
    // This method will become a callback in searchers "setSearchCompleteCallback"
    loadResponse: function(o){
      if(!_searchapiinitialized) return;

      var srch = this.getActiveSearcher();
  
      if(srch.results && srch.results.length > 0){
        var pages = (srch.cursor && srch.cursor.pages) ? srch.cursor.pages.length : 1;
  
        var total = totalSize(this.size, pages);
  
        // Reader must be able to read from the following data format
        var response = {
          total: total,
          data: srch.results,
          searcher: this.active
        };
  
        try{
          var result = o.reader.read(response);
          this.fireEvent('load', this, o, o.request.arg);
        }catch(e){
          // if reader fails to read response, fire loadexception with error, call callback with failure status with null result
          this.fireEvent('loadexception', this, o, srch, e);
          return o.request.callback.call(o.request.scope || this, null, o.request.arg, false);
        }
      }else{
        // if no results were found, fire loadexception without error, call callback with success status with null result
        this.fireEvent('loadexception',this,o,srch);
        return o.request.callback.call(o.request.scope || this, null, o.request.arg, true);
      }
  
      o.request.callback.call(o.request.scope || this, result, o.request.arg, true);
  
      function totalSize(size, pages){
        var ret = 0;
        var sizes = Ext.ux.google.search.Proxy.prototype._resultsize;
        if(size == sizes.small.str){
          ret = sizes.small.num;  
        }else if(size == sizes.large.str){
          ret = sizes.large.num;  
        }

        return ret * pages;
      }
    },

    /**
     * Change active searcher
     * @method setActiveSearcher
     * @param {string} active New active searcher
     * @return {google.search.Searhcer} searcher active searcher (false when specified searcher is not available)
     */
    setActiveSearcher: function(active){
      if(!_searchapiinitialized) return;

      if(typeof active !== 'string') return;
  
      if(this.searcher[active]){
        this.active = active;
        this.fireEvent('searcherchanged',this.active);
        return this.searcher[active];
      }else{
        return false;
      }
    },
  
    /**
     * Return active searcher
     * @method getActiveSearcher
     * @param {bool} name if true, return value will be active searcher's name
     * @return {google.search.Searhcer/string} searcher active searcher
     */
    getActiveSearcher: function(name){
      if(!_searchapiinitialized) return null;

      if(name===true){
        return this.active;
      }else{
        return this.searcher[this.active];
      }
    },
  
    /**
     * Change search result set size
     * @method setResultSetSize
     * @param {string} size "large"(8 results per set) or "small" (4 results per set)
     */
    setResultSetSize: function(size){
      if(!_searchapiinitialized) return;

      this.size = size == 'large' ?  
                  Ext.ux.google.search.Proxy.prototype._resultsize.large.str :
                  Ext.ux.google.search.Proxy.prototype._resultsize.small.str ;
    },
  
    /**
     * Return search result set size
     * @method getResultSetSize
     * @param {bool} num if true, return value will be the number of results per set
     * @return {string/int} size search result set size
     */
    getResultSetSize: function(num){
      if(!_searchapiinitialized) return 0;

      if(num===true){
        return this.getResultSetSize() == 'large' ?
            Ext.ux.google.search.Proxy.prototype._resultsize.large.num :
            Ext.ux.google.search.Proxy.prototype._resultsize.small.num ;
      }
  
      return this.size === Ext.ux.google.search.Proxy.prototype._resultsize.large.str ? 'large' : 'small'; 
    },
  
    /**
     * Adds new searcher(s) to this proxy. Fires "searcheradded" event.
     * @method addSearcher
     * @param {Array/object/string} s Array of searcher names, or single string, or an object with searcher names on its properties
     */
    addSearcher: function(s){
      if(!_searchapiinitialized) return;

      if(typeof s == 'object'){
        try{
          if(s instanceof Array){
            for(var i in s){
              this.addSearcher(s[i]);
            }
          }else{
            for(var i in s){
              if(s[i]){ 
                this.addSearcher(i); 
              }
            }
          }
          return true;
        }catch(e){
          throw e;
          return;
        }
      }
  
      if(this.searcher[s]) return true; 
  
      try{
        switch(s){
          case 'web':
            this.searcher.web = new google.search.WebSearch(); break;
          case 'local':
            this.searcher.local = new google.search.LocalSearch(); break;
          case 'image':
            this.searcher.image = new google.search.ImageSearch(); break;
          case 'video':
            this.searcher.video = new google.search.VideoSearch(); break;
          case 'news':
            this.searcher.news = new google.search.NewsSearch(); break;
          case 'blog':
            this.searcher.blog = new google.search.BlogSearch(); break;
          case 'book':
            this.searcher.book = new google.search.BookSearch(); break;
          default:
            return false;
        }
      }catch(e){
        this.fireEvent('searcherexception',e);
        throw Ext.ux.google.search.Proxy.prototype.UNAVAILABLE; 
        return;
      }
  
      this.searcher[s].setNoHtmlGeneration();
      this.searcher[s].setResultSetSize(this.size);
      this.setActiveSearcher(s);
  
      this.fireEvent('searcheradded',s);
      return true;
    },
  
    /**
     * Remove searcher(s) from this proxy. Fires "searcherremoved" event.
     * @method removeSearcher
     * @param {Array/object/string} s Array of searcher names, or single string, or an object with searcher names on its properties
     */
    removeSearcher: function(s){
      if(!_searchapiinitialized) return;

      if(typeof s == 'object'){
        if(s instanceof Array){
          for(var i in s){
            this.removeSearcher(s[i]);
          }
        }else{
          for(var i in s){
            if(s[i]){ this.removeSearcher(i); }
          }
          return true;
        }
      }

      // Web searcher cannot be removed
      if(s != 'web' && this.searcher[s]){
        if(s == this.active){
          this.setActiveSearcher('web');
        }
  
        delete this.searcher[s];
        this.fireEvent('searcherremoved',s);
        return true
      }else{
        return false;
      }
    },
  
    /**
     * Returns the status of api availability
     * @method isReady
     * @return {bool} status 
     */
    isReady: function(){
      return _searchapiinitialized;
    },

   /**
    * Exception thrown when searcher was not available. Read only.
    * @type Object
    * @property UNAVAILABLE
    */
    UNAVAILABLE: {
      name: 'Unavialble',
      message: 'Specified API is not available'
    }
  };
}());
