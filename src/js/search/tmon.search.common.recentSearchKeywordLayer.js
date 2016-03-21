/**
 * 최근 검색어 - 레이어
 */

var recentSearchKeywordLayer = function(){
    this.init.apply(this, arguments);
};

recentSearchKeywordLayer.prototype = {
    /**
     * 최근 검색어 생성자 초기화
     * @param {object} htOptions
     */
    init : function(htOptions){
        this.oDoSearch = htOptions.htCommon.htModule.oSearch;
        this.oSearchLocalStorage = htOptions.htCommon.htModule.oLocalStorage;
        this.sExecutionEnviroment = htOptions.htCommon.sExecutionEnviroment;
        this.sCurrentPage = htOptions.htCommon.htValue.sCurrentPage;
        this.htViewName = htOptions.htCommon.htValue.htViewName;
        this.oThemeAndKeyword = htOptions.oThemeAndKeyword;
        this.oRecentSearchKeywordHome = htOptions.oRecentSearchKeywordHome;
        this.oAssociatedKeyword = htOptions.oAssociatedKeyword;

        this.nRecentSearchKeywordLength = null;
        this.bIsRecnetSearchKeywordLayerOpen = false;
        this.sIosWebviewKeyboardClass = "virtual_keyboard_on";
        this.sIosWebviewAutoCompleteClass = "auto_complete_on";
        this.viewStatus = {
            hasKeyword : "hasKeyword",
            noKeyword : "noKeyword"
        };
        this.cacheElement();
        this.setEvent();
    },

    /**
     * 엘리먼트 캐시
     */
    cacheElement : function(){
        this.welBody = $("body");
        this.welTmplRecentSearchKeywordLayer = $("#_recentSearchKeywordTmplLayerTmpl");
        this.welTmplNoRecentSearchKeywordLayer = $("#_noRecentSearchKeywordTmplLayerTmpl");
        this.welRecentSearchKeywordLayerSection = $("#_recentSearchKeywordLayer");
    },

    /**
     * 이벤트 바인딩
     */
    setEvent : function(){
        this.welRecentSearchKeywordLayerSection.on("click", ".search_latest_lst .del", $.proxy(this.removeKeyword, this));
        this.welRecentSearchKeywordLayerSection.on("click", ".btn_search_clear", $.proxy(this.removeAllKeywords, this));
        this.welRecentSearchKeywordLayerSection.on("click", ".clse", $.proxy(this.closeRecentSearchKeywordLayer, this));
        this.welRecentSearchKeywordLayerSection.on("click", ".search_latest_lst li a", $.proxy(this.callSearch, this));
    },

    /**
     * UI 초기화
     */
    initView : function(){
        if(this.oSearchLocalStorage.checkHasKeyword()){
            this.renderTmpl(this.viewStatus.hasKeyword);
        } else {
            this.renderTmpl(this.viewStatus.noKeyword);
        }
    },

    /**
     * 최근 검색어 여부에 따른 랜더링 분기
     * @param sViewStatus -> 화면 상태값 (this.viewStatus 객체 확인)
     */
    renderTmpl : function(sViewStatus){
        var _raw_temp = null,
            _template = null,
            _htRenderData = {};

        switch(sViewStatus){
            case this.viewStatus.noKeyword :
                _raw_temp = this.welTmplNoRecentSearchKeywordLayer.html();
                _template = Handlebars.compile(_raw_temp);
                break;
            case this.viewStatus.hasKeyword :
                _raw_temp = this.welTmplRecentSearchKeywordLayer.html();
                _template = Handlebars.compile(_raw_temp);
                break;
        }

        _htRenderData = this.oSearchLocalStorage.getTheItem();
        _htRenderData["sExecutionEnviroment"] = this.sExecutionEnviroment;

        this.welRecentSearchKeywordLayerSection.html(_template(_htRenderData));
        this.showRecentSearchKeywordLayerSection();
        this.nRecentSearchKeywordLength = this.welRecentSearchKeywordLayerSection.find(".search_latest_lst li").length;
    },

    /**
     * 로컬스토리지 모듈 메소드 호출하여 최근 검색어 제거 및 조건에 따른 UI 변경
     * @param e
     */
    removeKeyword : function(e){
        var _target = $(e.currentTarget),
            _htData = {
                sKeyword : _target.parent().attr("data-keyword"),
                sCategoryName : _target.parent().attr("data-category-name")
            };

        this.oSearchLocalStorage.removeTheItem(_htData);
        _target.parent().slideUp(200);
        this.nRecentSearchKeywordLength--;
        if(this.nRecentSearchKeywordLength <= 0){
            this.initView();
        }
    },

    /**
     * 로컬스토리지 모듈 메소드 호출하여 최근 검색어 전체 삭제 및 UI 업데이트
     */
    removeAllKeywords : function(){
        this.oSearchLocalStorage.removeAllItems();
        this.renderTmpl(this.viewStatus.noKeyword);
    },

    /**
     * 검색모듈 검색 메소드 호출
     */
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

    /**
     * 최근 검색어 레이어 닫기 및 UI 업데이트
     */
    closeRecentSearchKeywordLayer : function(){
        this.welBody.removeClass(this.sIosWebviewKeyboardClass);
        this.welBody.removeClass(this.sIosWebviewAutoCompleteClass);
        switch(this.sCurrentPage){
            case this.htViewName.home :
                this.oRecentSearchKeywordHome.initView("noKeyword");
                this.oThemeAndKeyword.callThemeAndKeyword();
                break;
            case this.htViewName.result :
                break;
        }

        this.hideRecentSearchKeywordLayerSection();
    },

    /**
     * 최근 검색어 레이어 노출
     */
    showRecentSearchKeywordLayerSection : function(){
        this.welRecentSearchKeywordLayerSection.show();
    },

    /**
     * 최근 검색어 레이어 숨김
     */
    hideRecentSearchKeywordLayerSection : function(){
        this.welRecentSearchKeywordLayerSection.hide();
    }
};
