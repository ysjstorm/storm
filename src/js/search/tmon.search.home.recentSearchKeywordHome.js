/**
 * 최근 검색어 - 홈
 */

var recentSearchKeywordHome = function(){
    this.init.apply(this, arguments);
};

recentSearchKeywordHome.prototype = {
    init : function(htOptions){
        this.RECENT_KEYWORD_HOME_MAX_COUNT = 5;
        this.oDoSearch = htOptions.htCommon.htModule.oSearch;
        this.oSearchLocalStorage = htOptions.htCommon.htModule.oLocalStorage;
        this.sExecutionEnviroment = htOptions.htCommon.sExecutionEnviroment;
        this.nRecentSearchKeywordLength = null;
        this.viewStatus = {
            hasKeyword : "hasKeyword",
            noKeyword : "noKeyword"
        };
        this.cacheElement();
        this.setEvent();
        this.initView("home");
    },

    cacheElement : function(){
        this.welTmplRecentSearchKeywordHome = $("#_recentSearchKeywordHomeTmpl");
        this.welTmplNoRecentSearchKeywordHome = $("#_noRecentSearchKeywordHomeTmpl");
        this.welRecentSearchKeywordHomeSection = $("#_recentSearchKeyword");
    },

    setEvent : function(){
        this.welRecentSearchKeywordHomeSection.on("click", ".search_latest_lst .del", $.proxy(this.removeKeyword, this));
        this.welRecentSearchKeywordHomeSection.on("click", ".btn_search_clear", $.proxy(this.removeAllKeywords, this));
        this.welRecentSearchKeywordHomeSection.on("click", ".search_latest_lst li a", $.proxy(this.callSearch, this));
    },

    /**
     * 화면 초기화
     */
    initView : function(sReferrer){
        if(this.oSearchLocalStorage.checkHasKeyword()){
            this.renderTmpl(this.viewStatus.hasKeyword);
        } else {
            if(sReferrer){
                return;
            }
            this.renderTmpl(this.viewStatus.noKeyword);
        }
    },

    /**
     * 템플릿 렌더링
     * @param sViewStatus -> 화면 상태값 (this.viewStatus 객체 확인)
     */
    renderTmpl : function(sViewStatus){
        var _raw_temp = null,
            _template = null,
            _htRenderData = {};

        switch(sViewStatus){
            case this.viewStatus.noKeyword :
                _raw_temp = this.welTmplNoRecentSearchKeywordHome.html();
                _template = Handlebars.compile(_raw_temp);
                break;
            case this.viewStatus.hasKeyword :
                _raw_temp = this.welTmplRecentSearchKeywordHome.html();
                _template = Handlebars.compile(_raw_temp);
                break;
        }

        _htRenderData = this.oSearchLocalStorage.getTheItem();
        _htRenderData["sExecutionEnviroment"] = this.sExecutionEnviroment;

        this.welRecentSearchKeywordHomeSection.html(_template(_htRenderData));
        this.showRecentSearchKeywordHomeSection();
        this.nRecentSearchKeywordLength = this.welRecentSearchKeywordHomeSection.find(".search_latest_lst li").length;
    },

    removeKeyword : function(e){
        var _target = $(e.currentTarget),
            _htData = {
                sKeyword : _target.parent().attr("data-keyword"),
                sCategoryName : _target.parent().attr("data-category-name") || ""
            };

        this.oSearchLocalStorage.removeTheItem(_htData);
        _target.parent().slideUp(200);
        this.nRecentSearchKeywordLength--;
        if(this.nRecentSearchKeywordLength <= 0){
            this.showNoRecentSearchKeywordHome();
        }
    },

    removeAllKeywords : function(){
        this.oSearchLocalStorage.removeAllItems();
        this.showNoRecentSearchKeywordHome();
    },

    /**
     * 검색 홈에서 최근검색어 없음 노출 로직, 로컬스토리지 확인하지 않고 전체 삭제시 최근검색어 없음 UI 개별 제공.
     * * 검색어 삭제시 화면 초기화 로직을 타면 최초 유입시 검색어 없을 화면(테마, 키워드 플리킹UI)으로 가고 검색어 없음 텍스트 노출되지 않기때문에 개별 렌더링
     */
    showNoRecentSearchKeywordHome : function(){
        _raw_temp = this.welTmplNoRecentSearchKeywordHome.html();
        _template = Handlebars.compile(_raw_temp);
        this.welRecentSearchKeywordHomeSection.html(_template(this.oSearchLocalStorage.getTheItem()));
        this.showRecentSearchKeywordHomeSection();
        this.nRecentSearchKeywordLength = this.welRecentSearchKeywordHomeSection.find(".search_latest_lst li").length;
    },

    callSearch : function(e){
        var _target = $(e.currentTarget),
            _htQueryOpt = {
                sKeyword : _target.parent().attr("data-keyword"),
                sCategoryName : _target.parent().attr("data-category-name"),
                sCategorySrl : _target.parent().attr("data-category-srl"),
                sUserViewTitle : _target.parent().attr("data-user-view-title")
            };

        this.oDoSearch.searchStart(_htQueryOpt);
    },

    showRecentSearchKeywordHomeSection : function(){
        this.welRecentSearchKeywordHomeSection.show();
    },

    hideRecentSearchKeywordHomeSection : function(){
        this.welRecentSearchKeywordHomeSection.hide();
    }
};
