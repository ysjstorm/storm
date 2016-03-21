/**
 * 검색바
 */

var searchBar = function(){
    this.init.apply(this, arguments);
};

searchBar.prototype = {
    init : function(htOptions){
        this.oDoSearch = htOptions.htCommon.htModule.oSearch;
        this.oSearchLocalStorage = htOptions.htCommon.htModule.oLocalStorage;
        this.sCurrentPage = htOptions.htCommon.htValue.sCurrentPage;
        this.htViewName = htOptions.htCommon.htValue.htViewName;
        this.oSearchAutoCompleteLayer = htOptions.oSearchAutoCompleteLayer;
        this.oRecentSearchKeywordLayer = htOptions.oRecentSearchKeywordLayer;
        this.oRecentSearchKeywordHome = htOptions.oRecentSearchKeywordHome;
        this.oThemeAndKeyword = htOptions.oThemeAndKeyword;
        this.oAssociatedKeyword = htOptions.oAssociatedKeyword;
        this.sCurrentKeyword = "";
        this.sOldKeyword = "";
        this.sTimer = "";
        this.sIosWebviewKeyboardClass = "virtual_keyboard_on";
        this.sIosWebviewAutoCompleteClass = "auto_complete_on";
        this.sIosWebViewDetailFilterClass = "shown_keyboard";
        this.cacheElement();
        this.setEvent();
        this.initView();
    },

    cacheElement : function(){
        this.welBody = $("body");
        this.welSearchBar = $(".search_area");
        this.welFieldSearch = $(".search_area .search_bar .inp");
        this.welBtnSearchFieldClear = $(".search_area .search_bar .del");
        this.welBtnDoSearch = $(".search .search_bar .go");
        this.welBtnGoPrevView = $(".search .prv");
        this.welAssociationKeyword = $(".assoc_keywords");
        this.welSearchAutoCompleteSection = $('#_searchAutoComplete');
    },

    setEvent : function(){
        this.welFieldSearch.on("keyup", $.proxy(this.activeSearchBar, this));
        this.welFieldSearch.on("click", $.proxy(this.drawRecentSearchLayer, this));
        this.welBtnSearchFieldClear.on("click", $.proxy(this.clearSearchField, this));
        this.welBtnDoSearch.on("click", $.proxy(this.callSearch, this));
        this.welBtnGoPrevView.on("click", $.proxy(this.backToThePrevView, this));
    },

    // app에서 호출하는 영역
    callSearchKeywordKeypad : function(){
        this.drawRecentSearchLayer();
        this.welFieldSearch.focus();
        TMON.app.callApp('webview', 'showKeyboard');
    },

    /**
     * 검색홈, 결과페이지 로드시 UI 초기화
     */
    initView : function(){
        if(TMON.util.gup("from") === "home"){
            this.drawRecentSearchLayer();
            this.welFieldSearch.focus();
        }
        this.toggleBoldText();
        if(location.pathname === "/search/result"){
            TMON.app.callApp('webview', 'hideKeyboard');
        }
    },

    /**
     * 검색 필드의 검색어 있을경우 bold 처리
     */
    toggleBoldText : function(){
        var sCurrentKeyword = $.trim(this.welFieldSearch.val());

        if(sCurrentKeyword === "" || sCurrentKeyword.length === 0) {
            this.welFieldSearch.removeClass("on");
        }else{
            this.welFieldSearch.addClass("on");
        }
    },

    /**
     * 검색필드 활성화(검색어 입력)시 UI 처리(자동완성 레이어) 및 엔터시 검색실행
     * @param {object} e
     */
    activeSearchBar : function(e){
        this.toggleBoldText();
        this.toggleClearSearchFieldBtn();
        this.drawAutoCompleteLayer();
        // keyCode 13 : 엔터
        if(e !== undefined && e.keyCode === 13){
            this.callSearch();
        }
    },

    /**
     * 이전 히스토리로 이동
     */
    backToThePrevView : function(){
        history.back();
        setTimeout(function(){
            $(document).trigger("resetAllView");
        },200);

        return false;
    },

    /**
     * 검색필트 지우기 및 UI 처리(자동완성 및 검색결과 경우 연관검색어 레이어)
     */
    clearSearchField : function(){
        this.welFieldSearch.val("");
        this.welFieldSearch.focus();
        this.welSearchBar.removeClass("on");
        this.drawAutoCompleteLayer();
        if(this.sCurrentPage === this.htViewName.result){
            this.oAssociatedKeyword.hideAssociatedKeyword();
        }
    },

    /**
     * 자동완성 레이어 생성 및 관련 UI 처리(최근검색어, 연관검색어, 자동완성 레이어 처리
     */
    drawAutoCompleteLayer : function(){
        /**
         * callAutoCompleteKeyword 자동완성 트레픽 부하 줄이기 위해 API호출에 setTimeout 처리
         */
        clearTimeout(this.sTimer);
        this.sTimer = setTimeout($.proxy(function(){
            this.sCurrentKeyword = $.trim(this.welFieldSearch.val());

            if(this.sCurrentKeyword === "" || this.sCurrentKeyword.length === 0){
                this.oRecentSearchKeywordLayer.initView();
                this.oSearchAutoCompleteLayer.hideAutoCompleteSection();
            }else{
                this.sOldKeyword = this.sCurrentKeyword;
                this.oSearchAutoCompleteLayer.callAutoCompleteKeyword(this.sCurrentKeyword);
            }
        }, this),200);
    },

    /**
     * 최근 검색어 레이어 검색홈, 결과페이 분기하여 처리 및 UI 처리(최근검색어 홈, 테마키워드, 연관검색어)
     * @param e
     */
    drawRecentSearchLayer : function(e) {
        // Ios경우 position:fixed 속성 사용불가하여 관련 처리해주는 클래스 추가
        if (!this.welBody.hasClass(this.sIosWebviewKeyboardClass)) {
            this.welBody.addClass(this.sIosWebviewKeyboardClass);
        }
        if (!this.welBody.hasClass(this.sIosWebViewDetailFilterClass)){
            this.welBody.addClass(this.sIosWebViewDetailFilterClass);
        }

        if(this.oSearchAutoCompleteLayer.bIsAutoCompleteLayerOpen){
            return;
        }

        switch(this.sCurrentPage){
            case this.htViewName.home :
                if(this.welFieldSearch.val() !== ""){
                    this.activeSearchBar(e);
                }else{
                    this.oRecentSearchKeywordHome.hideRecentSearchKeywordHomeSection();
                    this.oThemeAndKeyword.hideThemeAndKeywordSection();
                }
                break;
            case this.htViewName.result :
                if(this.welFieldSearch.val() !== ""){
                    TMON.search.oMain.oSearchResult.oAssociatedKeyword.hideAssociatedKeyword();
                    this.activeSearchBar(e);
                }else{
                    this.oAssociatedKeyword.hideAssociatedKeyword();
                }
                break;
            default :
                break;
        }

        if(this.welFieldSearch.val() === ""){
            this.oRecentSearchKeywordLayer.initView();
        }
    },

    /**
     * 검색필드에서 검색어 제거 버튼 토클
     */
    toggleClearSearchFieldBtn : function(){
        this.sCurrentKeyword = this.welFieldSearch.val();
        if(this.sCurrentKeyword === ""){
            this.welSearchBar.removeClass("on");
        }else{
            this.welSearchBar.addClass("on");
        }
    },

    /**
     * 검색모듈 검색 메소드 호출
     */
    callSearch : function(){
        var htQueryOpt = {
                sKeyword : this.welFieldSearch.val()
            },
            oRegExp = /[^ㄱ-ㅎ]/,
            sConsonantKeyword = null;


        if(!oRegExp.test(htQueryOpt.sKeyword)){
            // 초성만 입력되었을 경우 처리
            sConsonantKeyword = this.welSearchAutoCompleteSection.find("._acList").eq(0).find(".keyword").text();

            if(sConsonantKeyword !== ""){
                htQueryOpt.sKeyword = sConsonantKeyword;
            }
        }

        this.oDoSearch.searchStart(htQueryOpt);
    }
};
