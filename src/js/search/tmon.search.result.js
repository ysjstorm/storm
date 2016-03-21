var searchResult = function () {
    this.init.apply(this, arguments);
}

searchResult.prototype = {
    init: function (htOptions) {
        $.extend(this, htOptions);

        this.oModel = new searchResultModel();

        this.cacheElement();
        this.initView(htOptions);
    },

    cacheElement: function () {
        this.welWin = $(window);
    },

    initView: function (htOptions) {
        /**
         * 검색창 : 최초 검색어 뷰
         * 파라미터 URL 의 /search/result?keyword = {initkeyword}
         */
        $('.search_bar').find('input').val(this.oModel.keyword);

        /**
         * 검색창 : 최초 연관검색어 뷰
         */
        this.oSearchLocalStorage = new searchLocalStorage({
            KEY: "recentSearchKeyword",
            MAX_COUNT: 15
        });

        this.htAppQuery = {
            sAppQueryN: htOptions.sAppQueryN,
            sAppQueryQ: htOptions.sAppQueryQ,
            sAppQueryForRedirect: htOptions.sAppQueryForRedirect
        };

        this.oDoSearch = new doSearch({
            oSearchLocalStorage: this.oSearchLocalStorage,
            htAppQuery: this.htAppQuery
        });

        this.htCommon = {
            htModule: {
                oSearch: this.oDoSearch,
                oLocalStorage: this.oSearchLocalStorage
            },
            htValue: {
                sCurrentPage: htOptions.sCurrentPage,
                htViewName: htOptions.htViewName
            },
            htAppQuery: {
                sAppQueryN: htOptions.sAppQueryN,
                sAppQueryQ: htOptions.sAppQueryQ,
                sAppQueryForRedirect: htOptions.sAppQueryForRedirect
            },
            sExecutionEnviroment: htOptions.sExecutionEnviroment,
            bIsIos: htOptions.bIsIos
        };

        this.oSearchHotel = new searchResultHotel({htAppQuery: this.htAppQuery});
        this.oSearchFilterDetail = new searchFilterDetail(this);
        this.oSearchFilter = new searchResultFilter(this);
        this.oSearchBanner = new searchResultBanner(this);
        this.oSearchInput = new searchResultInput(this);

        this.reloadInputView();
        this.reloadFilterDetailView();
        this.reloadFilterRankView();

        this.oRecentSearchKeywordLayer = new recentSearchKeywordLayer({
            htCommon: this.htCommon,
            oAssociatedKeyword: this.oAssociatedKeyword
        });

        this.oSearchAutoCompleteLayer = new searchAutoCompleteLayer({
            htCommon: this.htCommon,
            oRecentSearchKeywordLayer: this.oRecentSearchKeywordLayer,
            sSearchQuery: this.sSearchQuery
        });

        this.oAssociatedKeyword = new associatedKeyword({
            htCommon: this.htCommon,
            oSearchAutoCompleteLayer: this.oSearchAutoCompleteLayer,
            oRecentSearchKeywordLayer: this.oRecentSearchKeywordLayer
        });

        this.oSearchBar = new searchBar({
            htCommon: this.htCommon,
            oSearchAutoCompleteLayer: this.oSearchAutoCompleteLayer,
            oRecentSearchKeywordLayer: this.oRecentSearchKeywordLayer,
            oAssociatedKeyword: this.oAssociatedKeyword
        });

        if (this.htCommon.bIsIos) {
            this.forceViewScroll();
        }
    },

    reloadInputView: function () {
        this.oSearchInput.initView();
        this.oSearchBanner.initView();
    },

    reloadFilterRankView: function () {
        this.oSearchFilter.initView();
    },

    reloadFilterDetailView: function () {
        this.oSearchFilterDetail.initView();
    },

    reloadAllView: function () {
        this.oModel.reload();
        this.oSearchInput.initView();
        this.oSearchFilter.initView();
        this.oSearchFilterDetail.initView();
        this.oSearchBanner.initView();
    },
    /**
     * Ios App Webview에 fixed된 헤더 비정상 render 이슈 대응 강제 1px 스크롤
     */
    forceViewScroll: function () {
        this.welWin.scrollTop(1);
    }
}
