/**
 * 검색 메인
 * @param htOptions
 */
var searchMain = function(htOptions){
    this.init(htOptions);
};

searchMain.prototype = {
    init : function(htOptions){
        $.extend(this, htOptions);
        this.htInitParam = {
            sCurrentPage : this.sCurrentPage,
            htViewName : this.htViewName,
            sSearchQuery : this.sSearchQuery,
            sAppQueryN : htOptions.htConnectEnvironment.sAppQueryN,
            sAppQueryQ : htOptions.htConnectEnvironment.sAppQueryQ,
            sAppQueryForRedirect : htOptions.htConnectEnvironment.sAppQueryForRedirect,
            sExecutionEnviroment : htOptions.htConnectEnvironment.sExecutionEnviroment,
            bIsIos : TMON.bIsIos
        }
        this.initPage();
        this.cacheElement();
        this.setEvent();
        this.setUAForCSS();
    },

    initPage : function(){
        switch(this.sCurrentPage){
            case this.htViewName.home : // 검색 홈
                this.oSearchHome = new searchHome(this.htInitParam);
                break;
            case this.htViewName.result :
                // 딜리스트 페이지
                this.oSearchResult = new searchResult(this.htInitParam);
                break;
            default :
                this.oSearchHome = new searchHome(this.htInitParam);
                break;
        }
    },

    cacheElement : function(){
        this.welHtml = $("body");
    },

    setEvent : function(){
        // add tl area code listener
        //$('._tlClick').on('click', function(e){ log_click(this, 'click'); });
    },

    setUAForCSS : function(){
        this.welHtml.attr("data-userAgent", navigator.userAgent);
    },

    // app에서 호출하는 영역
    callSearchKeywordKeypad : function(){
        if(this.htInitParam.sCurrentPage === this.htInitParam.htViewName.home){
            this.oSearchHome.oSearchBar.drawRecentSearchLayer();
            this.oSearchHome.oSearchBar.welFieldSearch.focus();
        }

        if(this.htInitParam.sCurrentPage === this.htInitParam.htViewName.result){
            this.oSearchResult.oSearchBar.drawRecentSearchLayer();
            this.oSearchResult.oSearchBar.welFieldSearch.focus();
        }

        TMON.app.callApp('webview', 'showKeyboard');
    }
};
