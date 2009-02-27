/*
 * Ext.ux.google.search.Reader
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
 * @class Ext.ux.google.search.Reader
 * @extends Ext.data.JsonReader
 * <p>This class extends {@link Ext.data.JsonReader} and reads data passed from {@link Ext.ux.google.search.Proxy}
 * and create an Array of {@link Ext.data.Records}.</p>
 * <p> Private method "getJsonAccessor" is overridden to accept "undefined" property which frequently happens in
 * results from Google Search API</p>
 * @author Yuki Naotori
 * @version 0.1
 */
Ext.ux.google.search.Reader = Ext.extend(Ext.data.JsonReader, {
    /**
     * @cfg {String} id
     * @hide
     */

    /**
     * @cfg {String} root
     * @hide
     */

    /**
     * @cfg {String} successProperty
     * @hide
     */

    /**
     * @cfg {String} totalProperty
     * @hide
     */

    /**
     * @cfg Object recordTypes
     * Field mapping definitions for searchers. You can define your own mappings for each searchers and give them as a config
     * option. If not given, reader will use its default mappings:
     * <pre><code>
     * recordTypes: {
     *    web: [
     *      { name: 'cacheUrl' },
     *      { name: 'title', mapping: 'titleNoFormatting' },
     *      { name: 'content' },
     *      { name: 'url', mapping: 'unescapedUrl' }
     *    ],
     *    local: [
     *      { name: 'accuracy', type: 'int' },
     *      { name: 'title', mapping: 'titleNoFormatting' },
     *      { name: 'content' },
     *      { name: 'country' },
     *      { name: 'region' },
     *      { name: 'city' },
     *      { name: 'streetAddress' },
     *      { name: 'phone', mapping: 'phoneNumbers[0].number' },
     *      { name: 'lat', type: 'float' },
     *      { name: 'lng', type: 'float' },
     *      { name: 'staticMapUrl' },
     *      { name: 'url' }
     *    ],
     *    blog: [
     *      { name: 'author' },
     *      { name: 'title', mapping: 'titleNoFormatting' },
     *      { name: 'content' },
     *      { name: 'blog', mapping: 'blogUrl' },
     *      { name: 'url', mapping: 'postUrl' },
     *      { name: 'date', mapping: 'publishedDate', type: 'date' }
     *    ],
     *    news: [
     *      { name: 'publisher' },
     *      { name: 'title', mapping: 'titleNoFormatting' },
     *      { name: 'content' },
     *      { name: 'language' },
     *      { name: 'location' },
     *      { name: 'clusterUrl' },
     *      { name: 'image', mapping: 'image.url', defaultValue: '' },
     *      { name: 'url', mapping: 'unescapedUrl' },
     *      { name: 'date', mapping: 'publishedDate', type: 'date' }
     *    ],
     *    book: [
     *      { name: 'authors' },
     *      { name: 'title', mapping: 'titleNoFormatting' },
     *      { name: 'blog', mapping: 'blogUrl' },
     *      { name: 'url', mapping: 'unescapedUrl' },
     *      { name: 'image', mapping: 'tb.url' },
     *      { name: 'id', mapping: 'bookId' },
     *      { name: 'pageCount', type: 'int' },
     *      { name: 'year', mapping: 'publishedYear', type: 'int' }
     *    ],
     *    image: [
     *      { name: 'title', mapping: 'titleNoFormatting' },
     *      { name: 'content' },
     *      { name: 'url', mapping: 'unescapedUrl' },
     *      { name: 'originalUrl', mapping: 'originalContextUrl' },
     *      { name: 'tbUrl' },
     *      { name: 'tbHeight', type: 'int' },
     *      { name: 'tbWidth', type: 'int' },
     *      { name: 'height', type: 'int' },
     *      { name: 'width', type: 'int' },
     *      { name: 'id', mapping: 'imageId' }
     *    ],
     *    video: [
     *      { name: 'duration', type: 'int' },
     *      { name: 'publisher' },
     *      { name: 'rating', type: 'float' },
     *      { name: 'type', mappgin: 'videoType' },
     *      { name: 'title', mapping: 'titleNoFormatting' },
     *      { name: 'content' },
     *      { name: 'playUrl', mapping: 'playUrl' },
     *      { name: 'url', mapping: 'postUrl' },
     *      { name: 'tbUrl' },
     *      { name: 'tbHeight', type: 'int' },
     *      { name: 'tbWidth', type: 'int' },
     *      { name: 'date', mapping: 'published', type: 'date' }
     *    ]
     *},
     * </code></pre>
     */      

    recordTypes: {
        web: [
          { name: 'cacheUrl' },
          { name: 'title', mapping: 'titleNoFormatting' },
          { name: 'content' },
          { name: 'url', mapping: 'unescapedUrl' }
        ],
        local: [
          { name: 'accuracy', type: 'int' },
          { name: 'title', mapping: 'titleNoFormatting' },
          { name: 'content' },
          { name: 'country' },
          { name: 'region' },
          { name: 'city' },
          { name: 'streetAddress' },
          { name: 'phone', mapping: 'phoneNumbers[0].number' },
          { name: 'lat', type: 'float' },
          { name: 'lng', type: 'float' },
          { name: 'staticMapUrl' },
          { name: 'url' }
        ],
        blog: [
          { name: 'author' },
          { name: 'title', mapping: 'titleNoFormatting' },
          { name: 'content' },
          { name: 'blog', mapping: 'blogUrl' },
          { name: 'url', mapping: 'postUrl' },
          { name: 'date', mapping: 'publishedDate', type: 'date' }
        ],
        news: [
          { name: 'publisher' },
          { name: 'title', mapping: 'titleNoFormatting' },
          { name: 'content' },
          { name: 'language' },
          { name: 'location' },
          { name: 'clusterUrl' },
          { name: 'image', mapping: 'image.url', defaultValue: '' },
          { name: 'url', mapping: 'unescapedUrl' },
          { name: 'date', mapping: 'publishedDate', type: 'date' }
        ],
        book: [
          { name: 'authors' },
          { name: 'title', mapping: 'titleNoFormatting' },
          { name: 'blog', mapping: 'blogUrl' },
          { name: 'url', mapping: 'unescapedUrl' },
          { name: 'image', mapping: 'tb.url' },
          { name: 'id', mapping: 'bookId' },
          { name: 'pageCount', type: 'int' },
          { name: 'year', mapping: 'publishedYear', type: 'int' }
        ],
        image: [
          { name: 'title', mapping: 'titleNoFormatting' },
          { name: 'content' },
          { name: 'url', mapping: 'unescapedUrl' },
          { name: 'originalUrl', mapping: 'originalContextUrl' },
          { name: 'tbUrl' },
          { name: 'tbHeight', type: 'int' },
          { name: 'tbWidth', type: 'int' },
          { name: 'height', type: 'int' },
          { name: 'width', type: 'int' },
          { name: 'id', mapping: 'imageId' }
        ],
        video: [
          { name: 'duration', type: 'int' },
          { name: 'publisher' },
          { name: 'rating', type: 'float' },
          { name: 'type', mappgin: 'videoType' },
          { name: 'title', mapping: 'titleNoFormatting' },
          { name: 'content' },
          { name: 'playUrl', mapping: 'playUrl' },
          { name: 'url', mapping: 'postUrl' },
          { name: 'tbUrl' },
          { name: 'tbHeight', type: 'int' },
          { name: 'tbWidth', type: 'int' },
          { name: 'date', mapping: 'published', type: 'date' }
        ]
    },

    /**
     * Create a new Ext.ux.google.search.Reader
     * @method Reader
     * @param {Object} config Config options
     */
    constructor: function(c){
      Ext.apply(this, c);
      Ext.ux.google.search.Reader.superclass.constructor.call(this, 
        {totalProperty: 'total', root: 'data'},
        this.getFields('web')
      );
    },

    /**
     * This method is only used by a DataProxy which has retrieved data from a remote server.
     * @param {Object} response An object which contains the search result in JSON format, and a searcher used to retrieve this data
     * @return {Object} data A data block which is used by an Ext.data.Store object as
     * a cache of Ext.data.Records.
     */
    read: function(o){
      if(o.searcher && o.searcher in this.recordTypes){
        o.metaData = o.metaData || {};
        o.metaData.fields = this.getFields(o.searcher);
        o.metaData.totalProperty = o.metaData.totalProperty || this.meta.totalProperty; 
        o.metaData.root = o.metaData.root || this.meta.root; 
      }
        
      return this.readRecords(o);
    },

    // Override to catch "undefined" property
    // http://extjs.com/forum/showthread.php?t=37696
    getJsonAccessor: function(){
        var re = /[\[\.]/;
        return function(expr) {
            try {
                return(re.test(expr))
                    ? new Function("obj", "try{ return obj." + expr + "} catch(e) { return undefined }")
                    : function(obj){
                        return obj[expr];
                    };
            } catch(e){}
            return Ext.emptyFn;
        };
    }(),

    // private
    getFields: function(s){
      if(typeof s === 'string' && s in this.recordTypes){
        return this.recordTypes[s];  
      }else{
        return null;
      }
    }
});
