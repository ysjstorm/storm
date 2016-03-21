/**
 * 검색결과 페이지 호출
 */

var doSearch = function(){
    this.init.apply(this, arguments);
};

doSearch.prototype = {
    // 검색어 관련 안내메시지
    htInfoMessage : {
        // 검색필드에 키워드 미입력 상태에서 검색시 안내문구
        noSearchKeyword : "검색어를 확인해 주세요"
    },

    // 쿼리스트링 키
    htQueryString : {
        sKeyword : "keyword=",
        sCategoryName : "categoryName=",
        sCategorySrl : "catSrl=",
        sUserViewTitle : "uvCatCode=",
        sSearchQuery : "searchType="
    },

    /**
     * 생성자 초기화
     * @param {object} htOptions
     */
    init : function(htOptions){
        this.oSearchLocalStorage = htOptions.oSearchLocalStorage;
        this.sAppQueryN = htOptions.htAppQuery.sAppQueryN;
        this.sAppQueryQ = htOptions.htAppQuery.sAppQueryQ;
        this.cacheElement()
    },

    /**
     * 엘리먼트 캐시
     */
    cacheElement : function(){
        this.oWindow = window;
    },

    /**
     * 검색사용시 호출되는 인터페이스
     * @param {Object} htQueryOpt
     */
    searchStart : function(htQueryOpt){
        if($.trim(htQueryOpt.sKeyword) === ""){
            this.oWindow.alert(this.htInfoMessage.noSearchKeyword);
            return;
        }

        var _sUrl = null,
            _htData = {
                sKeyword : htQueryOpt.sKeyword,
                sCategoryName : htQueryOpt.sCategoryName || "",
                sCategorySrl : htQueryOpt.sCategorySrl || "",
                sUserViewTitle : htQueryOpt.sUserViewTitle || "",
                sSearchQuery : htQueryOpt.sSearchQuery || ""
            };

        _sUrl = "http://" + this.oWindow.location.host + TMON.search.oMain.htViewName.result;
        _sUrl += "?" + this.htQueryString.sKeyword + encodeURIComponent(_htData.sKeyword);
        if(_htData.sCategoryName){
            _sUrl += "&" + this.htQueryString.sCategoryName + encodeURIComponent(_htData.sCategoryName);
        }
        if(_htData.sCategorySrl){
            _sUrl += "&" + this.htQueryString.sCategorySrl + encodeURIComponent(_htData.sCategorySrl);
        }
        if(_htData.sUserViewTitle){
            _sUrl += "&" + this.htQueryString.sUserViewTitle + encodeURIComponent(_htData.sUserViewTitle);
        }
        if(_htData.sSearchQuery){
            _sUrl += "&" + this.htQueryString.sSearchQuery + encodeURIComponent(_htData.sSearchQuery);
        }
        _sUrl += this.sAppQueryN;

        this.oSearchLocalStorage.setTheItem(this.oSearchLocalStorage.setItemFrom.addKeyword, _htData);
        this.oWindow.location.href = _sUrl;

    }
};
