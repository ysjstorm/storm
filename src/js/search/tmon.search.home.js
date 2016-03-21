/**
 * 검색 홈 Main
 * 신규모듈 추가 시 검색실행, 최근검색어 저장위해 searchLocalStorage, doSearch 는 각 모듈에 꼭 로드 되어야합니다.
 */

var searchHome = function(htOptions){
    this.init(htOptions);
};

searchHome.prototype = {
    init : function(htOptions){
        $.extend(this, htOptions);
        // 앱쿼리
        this.htAppQuery = {
            sAppQueryN : htOptions.sAppQueryN,
            sAppQueryQ : htOptions.sAppQueryQ,
            sAppQueryForRedirect : htOptions.sAppQueryForRedirect
        };

        // 로컬스토리지 (검색공통 Fn Necessary Module)
        this.oSearchLocalStorage = new searchLocalStorage({KEY : "recentSearchKeyword", MAX_COUNT : 15});

        // 검색실행 (검색공통 Fn Necessary Module)
        this.oDoSearch = new doSearch({
            oSearchLocalStorage : this.oSearchLocalStorage,
            htAppQuery : this.htAppQuery
        });

        // 공통(모듈/데이터)객체 (Necessary Module 참조 포함)
        this.htCommon = {
            htModule : {
                oSearch : this.oDoSearch,
                oLocalStorage : this.oSearchLocalStorage
            },
            htValue : {
                sCurrentPage : htOptions.sCurrentPage,
                htViewName : htOptions.htViewName
            },
            sExecutionEnviroment : htOptions.sExecutionEnviroment,
            bIsIos : htOptions.bIsIos
        };

        // 테마키워드 (검색홈 UI Module)
        this.oThemeAndKeyword = new themeAndKeyword({htCommon : this.htCommon});

        // 최근검색어 (검색홈 UI Module)
        this.oRecentSearchKeywordHome = new recentSearchKeywordHome({htCommon : this.htCommon});

        // 최근검색어 레이어 (검색공통 UI Module)
        this.oRecentSearchKeywordLayer = new recentSearchKeywordLayer({
            htCommon : this.htCommon,
            oThemeAndKeyword : this.oThemeAndKeyword,
            oRecentSearchKeywordHome : this.oRecentSearchKeywordHome,
            oAssociatedKeyword : this.oAssociatedKeyword
        });

        // 겅색 자동완성 레이어 (검색공통 UI Module)
        this.oSearchAutoCompleteLayer = new searchAutoCompleteLayer({
            htCommon : this.htCommon,
            oRecentSearchKeywordLayer : this.oRecentSearchKeywordLayer,
            sSearchQuery : this.sSearchQuery
        });

        // 검색헤더 (검색공통 UI)
        this.oSearchBar = new searchBar({
            htCommon : this.htCommon,
            oSearchAutoCompleteLayer : this.oSearchAutoCompleteLayer,
            oRecentSearchKeywordLayer : this.oRecentSearchKeywordLayer,
            oRecentSearchKeywordHome : this.oRecentSearchKeywordHome,
            oThemeAndKeyword : this.oThemeAndKeyword
        });
    }
}
