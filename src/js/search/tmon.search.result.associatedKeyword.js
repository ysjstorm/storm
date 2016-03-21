/**
 * 연관 검색어
 */

var associatedKeyword = function(){
    this.init.apply(this, arguments);
};

associatedKeyword.prototype = {
    init : function(htOptions){
        this.oDoSearch = htOptions.htCommon.htModule.oSearch;
        this.oSearchLocalStorage = htOptions.htCommon.oSearchLocalStorage;
        this.oRecentSearchKeywordLayer = htOptions.oRecentSearchKeywordLayer;
        this.oSearchAutoCompleteLayer = htOptions.oSearchAutoCompleteLayer;
        this.sExecutionEnviroment = htOptions.htCommon.sExecutionEnviroment;
        this.EXPOSURE_MAX_COUNT = 10;
        this.oAjax = null;
        this.bIsAssociatedKeywordLayerOpen = false;
        this.sIosWebviewKeyboardClass = "virtual_keyboard_on";
        this.sIosWebviewAutoCompleteClass = "auto_complete_on";
        this.cacheElement();
        this.cachedTemplate();
        this.setEvent();
        this.getSearchKeyword();
    },

    cachedTemplate: function(){
        this.welAssociatedKeywordTemplate = Handlebars.compile(this.welTmplAssociatedKeyword.html());
    },

    cacheElement : function(){
        this.welBody = $("body");
        this.welHeader = $(".hdr");
        this.welSearchBar = $(".search_area");
        this.welTmplAssociatedKeyword = $("#_associatedKeywordTmpl");
    },

    setEvent : function(){
        this.welHeader.on("click", ".btn_toggle_assoc_keywords", $.proxy(this.toggleAssociatedKeyword, this));
        this.welHeader.on("click", ".list_keywords a", $.proxy(this.callSearch, this));
    },

    getSearchKeyword : function(){
        var _sKeyword = decodeURIComponent((TMON.util.gup("keyword") || ""));
        this.initView(_sKeyword);
    },

    initView : function(sKeyword){
        if(this.oAjax) {
            this.oAjax.abort();
        }

        this.oAjax = $.ajax({
            url: TMON.search.htAPI.associatedKeyword + encodeURI(sKeyword),
            type: 'GET',
            dataType: 'json',
            context: this,
            cache: true,
            success: $.proxy(this.renderTmpl, this),
            error: function (xhr) {
                this.welBody.addClass("noAssociatedKeyword");
            }
        })
    },

    renderTmpl : function(htRes){
        if($.isEmptyObject(htRes.data) || htRes.data.data.length === 0){
            this.welBody.addClass("noAssociatedKeyword");
            return;
        }else{
            this.welBody.addClass("associatedKeyword");
        }

        var _htRenderData = htRes;

        if(this.sExecutionEnviroment == "app"){
            _htRenderData["isApp"] = true;
        }

        _htRenderData.data.data.splice(this.EXPOSURE_MAX_COUNT, _htRenderData.data.data.length);
        this.welSearchBar.after(this.welAssociatedKeywordTemplate(_htRenderData));
    },

    toggleAssociatedKeyword : function(){
        if(this.bIsAssociatedKeywordLayerOpen === false){
            this.welHeader.find(".assoc_keywords").addClass("on");
            this.welBody.removeClass(this.sIosWebviewKeyboardClass);
            this.welBody.removeClass(this.sIosWebviewAutoCompleteClass);
            this.bIsAssociatedKeywordLayerOpen = true;
            this.oSearchAutoCompleteLayer.hideAutoCompleteSection();
            this.oRecentSearchKeywordLayer.hideRecentSearchKeywordLayerSection();
        }else{
            this.welHeader.find(".assoc_keywords").removeClass("on");
            this.bIsAssociatedKeywordLayerOpen = false;
        }
    },

    callSearch : function(e){
        e.preventDefault();
        var _target = $(e.currentTarget),
            _htQueryOpt = {
                sKeyword : _target.parent().attr("data-keyword")
            };

        this.oDoSearch.searchStart(_htQueryOpt);
    },

    showAssociatedKeyword : function(){
        this.welHeader.find(".assoc_keywords").addClass("on");
        this.bIsAssociatedKeywordLayerOpen = true;
    },

    hideAssociatedKeyword : function(){
        this.welHeader.find(".assoc_keywords").removeClass("on");
        this.bIsAssociatedKeywordLayerOpen = false;
    }
};
