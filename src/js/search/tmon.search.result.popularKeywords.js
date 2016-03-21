/**
 * 카테고리명 인기검색어
 */

var popularKeywords = function(){
    this.init.apply(this, arguments);
};

popularKeywords.prototype = {
    init : function(htOptions){
        this.oDoSearch = htOptions.htCommon.htModule.oSearch;
        this.oSearchLocalStorage = htOptions.htCommon.htModule.oLocalStorage;
        this.sExecutionEnviroment = htOptions.htCommon.sExecutionEnviroment;
        this.oAjax = null;
        this.cacheElement();
        this.setEvent();
        //this.callPopularKeywords("가전");
    },

    cacheElement : function(){
        this.welPopularKeywordsSection = $("#_popularKeyword");
        this.welTmplPopularKeywords = $("#_popularKeywordsTmpl");
    },

    setEvent : function(){
        this.welPopularKeywordsSection.on("click", ".pplst a", $.proxy(this.callSearch, this));
    },

    callPopularKeywords : function(sKeyword){
        if(sKeyword === undefined || sKeyword === "" || sKeyword === null){
            return;
        }

        if(this.oAjax) {
            this.oAjax.abort();
        }

        this.oAjax = $.ajax({
            url: TMON.search.htAPI.popularKeywords + encodeURI(sKeyword),
            type: 'GET',
            dataType: 'json',
            context: this,
            cache: true,
            success: $.proxy(this.renderTmpl, this),
            error: function (xhr) {
                if(xhr.status === 503){

                }
            }
        })
    },

    renderTmpl : function(htRes){
        if( $.isEmptyObject(htRes) || htRes.data.list.length === 0){
            return;
        }

        var _raw_temp = this.welTmplPopularKeywords.html(),
            _template = Handlebars.compile(_raw_temp),
            _htRenderData = htRes;

        _htRenderData["sExecutionEnviroment"] = this.sExecutionEnviroment;
        this.welPopularKeywordsSection.html(_template(_htRenderData));
        //this.showPopularKeywordsSection();
    },

    callSearch : function(e){
        e.preventDefault();
        var _target = $(e.currentTarget),
            _htQueryOpt = {
                sKeyword : _target.parent().attr("data-keyword")
            };

        this.oDoSearch.searchStart(_htQueryOpt);
    },

    showPopularKeywordsSection : function(){
        this.welPopularKeywordsSection.show();
    },

    hidePopularKeywordsSection : function(){
        this.welPopularKeywordsSection.hide();
    }
};
