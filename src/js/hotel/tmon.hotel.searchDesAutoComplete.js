var hotelSearchDesAC = function(oSearch, oLocalStorage, htHashData){
    this.oSearch = oSearch;
    this.oLocalStorage = oLocalStorage;
    this.htHashData = htHashData;

    this.init();
};

hotelSearchDesAC.prototype = {
    oSearch: null,
    oAjax: null,
    welACItems: null,
    isSelectedHotel:false,
    isSelectedAirport:false,
    isDirectSearch:true,

    htFlag: {
        bIsAutoCompleteLayerShown: false,
        nItemSelectIndex: -1,
        nShownItemCount: 0
    },

    htResultDisplayInfo : { // 검색 결과 표시 할때 사용
        region: {count: 5, templateName: "destinationRegion", welContainer : $(".ly_auto_destination_search .region ul")},
        landmark: {count: 4, templateName: "destinationLandmark", welContainer : $(".ly_auto_destination_search .landmark ul")},
        airport: {count: 2, templateName: "destinationAirport", welContainer : $(".ly_auto_destination_search .airport ul.station_list")},
        station: {count: 2, templateName: "destinationStation", welContainer : $(".ly_auto_destination_search .station ul.station_list")},
        hotel: {count: 4, templateName: "destinationHotel", welContainer : $(".ly_auto_destination_search .hotel ul")}
    },

    htSelectedData : { // 목적지 검색 결과 데이터
        keyword: "",
        type: "unknown",
        word: "",
        wordKr: "",
        id: "",
        regionId : ""
    },

    init: function() {
        this.cacheElement();
        this.setEvent();
        this.setTemplate();
        this.setInitKeyword();
    },

    cacheElement: function () {
        // 목적지검색 필드
        this.welSearchDestinationWrap = $('.search_section_wrap');
        this.welFieldSrchDestination = $('#field_search_destination');
        this.welBtnResetSrchKeyword = $('.btn_reset_txt');
        this.welLayerDestinationAutoSrchList = $('.ly_auto_destination_search'); // 자동완성 검색 결과 레이어
        this.welACLayerCategory = this.welLayerDestinationAutoSrchList.find(".category_section"); // 자동 완성의 각 카테고리 엘리먼트들

        this.welRecentKeyword = this.welLayerDestinationAutoSrchList.find(".recent_keyword"); // 최근검색어 wrap
        this.welRecentKeywordContainer = this.welRecentKeyword.find(".list"); // 최근검색어 리스트 컨테이너

        this.welBtnSrchDestination = $('#btn_ean_search');
        this.welBody = $("body");
    },

    setEvent: function () {
        // 목적지 자동완성
        this.welBtnResetSrchKeyword.on('click', $.proxy(this.resetDestinationSrchField, this));
        this.welFieldSrchDestination.on('keyup', $.proxy(this.onKeyUp, this));
        this.welFieldSrchDestination.on("click", $.proxy(this.onClickInput, this));
        this.welSearchDestinationWrap.on('click', '.list li a', $.proxy(this.onClickItem, this));
        this.welBody.on('click', $.proxy(this.onBodyClick, this));
        $(window).scroll($.proxy(this.onScroll, this));
    },

    setInitKeyword : function(){
        // 해쉬 값이 있으면 해쉬값을 우선으로 지정한다.
        if(this.htHashData){
            this.htSelectedData.keyword = this.htHashData.keyword;
            this.htSelectedData.wordKr = this.htHashData.wordKr;
            this.htSelectedData.id = this.htHashData.id;
            this.htSelectedData.regionId = this.htHashData.regionId;
            this.htSelectedData.type = this.htHashData.type;
        }else{
            this.htSelectedData.keyword = decodeURI(TMON.util.gup("keyword"));
            this.htSelectedData.wordKr = decodeURI(TMON.util.gup("fullKeyword"));
            this.htSelectedData.id = decodeURI(TMON.util.gup("searchId"));
            this.htSelectedData.regionId = TMON.util.gup("regionId") || "";
            this.htSelectedData.type = decodeURI(TMON.util.gup("searchType")) || "unknown";
        }
    },

    /**
     * 텍스트 박스에 글 입력, 스크롤 후에 아무대나 클릭하면 blur 되면서 화면이 해당 텍스트 박스로 스크롤 되면서 다른곳이 클릭되는 버그 수정
     */
    onScroll : function(){
        this.welFieldSrchDestination.blur();
    },

    /**
     * [목적지 검색어 초기화]
     */
    resetDestinationSrchField: function(e) {
        this.welFieldSrchDestination.val("");
        this.clearDestinationList();
    },

    onBodyClick: function() {
        if(this.htFlag.bIsAutoCompleteLayerShown){
            this.selectAutoCompletionItem();
        }
    },

    onFieldSrchHotelClick: function(e) {
        this.onBodyClick();
        e.target.focus();
    },

    onKeyUp: function (e) {
        var sKeyword = this.welFieldSrchDestination.val();

        if (!sKeyword) {
            this.clearDestinationList();
            return;
        }

        if( TMON.bIsIos || TMON.bIsAndroid ) {
            this.getDestinationSearchKeyword(sKeyword);
            this.showSementicSearchKeyword();
            return;
        }

        if (e.keyCode == 38) { // Arrow Up
            this.setPrevItem();
        } else if (e.keyCode == 40) { // Arrow Down
            this.setNextItem();
        } else if (e.keyCode == 13) { // Enter
            if (this.htFlag.bIsAutoCompleteLayerShown) {
                this.selectAutoCompletionItem();
            } else {    // 목적지 얻기 전 엔터 칠 경우 (자동완성 출력 전)
                this.htSelectedData.keyword = this.welFieldSrchDestination.val();
                this.htSelectedData.type = "unknown";
            }
        } else if (e.keyCode > 40 || e.keyCode == 8) { // 8:Backspace
            this.getDestinationSearchKeyword(sKeyword);
            this.showSementicSearchKeyword();
        }
    },

    onClickInput : function(){
        var sKeyword = this.welFieldSrchDestination.val();
        if(sKeyword){
            this.getDestinationSearchKeyword(sKeyword);
        }
        return false;
    },

    setNextItem: function () {
        if (this.htFlag.nShownItemCount == 0 || !this.htFlag.bIsAutoCompleteLayerShown){
            return false;
        }

        this.welACItems.eq(this.htFlag.nItemSelectIndex).removeClass("on").css({background: ""});
        this.htFlag.nItemSelectIndex = this.htFlag.nItemSelectIndex + 1 == this.htFlag.nShownItemCount ? 0 : this.htFlag.nItemSelectIndex + 1;
        this.welACItems.eq(this.htFlag.nItemSelectIndex).addClass("on");
    },

    setPrevItem: function () {
        if (this.htFlag.nShownItemCount == 0 || !this.htFlag.bIsAutoCompleteLayerShown){
            return false;
        }

        this.welACItems.eq(this.htFlag.nItemSelectIndex).removeClass("on").css({background: ""});
        this.htFlag.nItemSelectIndex = this.htFlag.nItemSelectIndex - 1 < 0 ? this.htFlag.nShownItemCount - 1 : this.htFlag.nItemSelectIndex - 1;
        this.welACItems.eq(this.htFlag.nItemSelectIndex).addClass("on");
    },

    selectAutoCompletionItem : function() {
        if (!this.htFlag.bIsAutoCompleteLayerShown){
            return false;
        }

        if (this.htFlag.nItemSelectIndex == -1 && this.htFlag.nShownItemCount > 0){
            this.welACItems.eq(0).find("a").trigger("click");
        }else{
            this.welACItems.eq(this.htFlag.nItemSelectIndex).find("a").trigger("click");
        }
    },

    /**
     * [목적지 자동완성 목록 클릭시 목적지 필드값 추출]
     */
    onClickItem: function(e) {
        var wel = $(e.currentTarget);
        var sVal = $.trim(wel.text());

        this.isSelectedHotel = wel.attr('data-type') == "hotel";
        this.isSelectedAirport = wel.attr('data-type') == "airport";

        this.htSelectedData.keyword = wel.attr('data-keyword');
        this.htSelectedData.wordKr = sVal;
        this.htSelectedData.word = wel.attr('data-word');
        this.htSelectedData.id = wel.attr('data-id');
        this.htSelectedData.regionId = wel.attr('data-regionId');
        this.htSelectedData.type = wel.attr('data-type');

        this.setDestinationSearchValue(sVal);
        this.clearDestinationList();
        this.welBtnSrchDestination.focus();
        this.isDirectSearch = false;
        gaSendEventForApp("Lodging", "click", "autocomplete");
        return false;
    },

    /**
     * 선택된 목적지 data를 가져온다.
     */
    getSelectedDestinationData : function(){
        return this.htSelectedData;
    },

    /**
     * [목적지 필드값 자동완성 목록 선택시와 선택하지 않았을 경우 기본값으로 셋팅]
     */
    setDestinationSearchValue: function(sVal) {
        var sDefaultAutoKeyword = this.welLayerDestinationAutoSrchList.find('.category_section:first ul > li:first a .result_item').text(),
            sVal = sVal || sDefaultAutoKeyword;

        this.welFieldSrchDestination.val(sVal);
    },

    /**
     * [목적지 자동완성 템플릿 클리어]
     */
    clearDestinationList: function () {
        this.htFlag.nItemSelectIndex = -1;
        this.htFlag.nShownItemCount = 0;
        $(".ly_auto_destination_search .region .list").html("");
        $(".ly_auto_destination_search .landmark .list").html("");
        $(".ly_auto_destination_search .airport .list").html("");
        $(".ly_auto_destination_search .hotel .list").html("");
        this.welLayerDestinationAutoSrchList.removeClass('on');
        this.htFlag.bIsAutoCompleteLayerShown = false;
    },

    /**
     * [목적지 자동완성 키워드 분기]
     */
    getDestinationSearchKeyword: function (sKeyword) {
        var MINIMUM_KEYWORD_BYTE = 2;
        var nKeywordByte = this.getByte(sKeyword);

        // 한글 1글자이상, 영문 2글자이상 입력시 검색 되어야한다.
        if(nKeywordByte >= MINIMUM_KEYWORD_BYTE) {
            this.getAutocomplete(sKeyword);
        }else{
            this.clearDestinationList();
        }
    },

    /**
     * 단어의 바이트값을 계산
     * @param sWord
     * @returns {number}
     */
    getByte : function(sWord){
        var nByte = 0;

        for (var i = 0; i < sWord.length; i++) {
            var key = sWord.charAt(i);
            if (escape(key).length > 4) {
                nByte += 2;
            } else {
                nByte += 1;
            }
        }

        return nByte;
    },

    /**
     * [목적지 자동완성 API ajax call]
     * @param  {[String]} sKeyword [자동완성 검색 키워드]
     */
    getAutocomplete : function (sKeyword) {
        if (this.oAjax) {
            this.oAjax.abort();
            this.clearDestinationList();
        }

        var data = {type: 'A'};

        this.oAjax = $.ajax({
            url: TMON.hotel.htAPI.autoComplete + encodeURI(sKeyword),
            type: 'GET',
            dataType: 'json',
            data: data,
            context: this,
            success: $.proxy(this.cbAutoComplete, this),
            error: function (xhr) {
                // TODO xhr.status
            }
        });
    },

    cbAutoComplete : function (res) {
        this.clearDestinationList();
        this.oAjax = null;

        if (!res || res.data === undefined || res.data.total === 0) {
            return;
        }

        this.render(res.data);
    },

    render : function(htData) {
        /*
         1. 각 타입별로 출력수 비교
         2-1. 최대출력수 넘으면 자름
         2-2. 안 넘으면 여유 출력수 계수
         3. 여유 출력수 있는 경우 분배
         4. 출력
         */
        var oProcessedData = {};    // data wrap은 제거시키고 저장하기로 함.
        var nAddedCount = 0;
        var nMaxAddCount = 0;

        // 일단 각 자리에 최대 개수만큼 넣어준다.
        for(var sTypeName in this.htResultDisplayInfo) {
            nMaxAddCount += this.htResultDisplayInfo[sTypeName].count;

            if(htData[sTypeName] === undefined) {
                continue;
            }

            oProcessedData[sTypeName] = htData[sTypeName].splice(0, this.htResultDisplayInfo[sTypeName].count);
            nAddedCount += oProcessedData[sTypeName].length;
        }

        var nLeftSlotCount = nMaxAddCount - nAddedCount; // 남은 자리의 개수

        // 남은 자리 개수만큼 중요도 순 우선으로 먼져 채워 넣는다.
        for(var sTypeName in this.htResultDisplayInfo) {
            if (htData[sTypeName] === undefined) {
                continue;
            }

            // 남은 자리가 있을 경우에만 더 채워 넣는다.
            if(nLeftSlotCount > 0){
                var aData = htData[sTypeName].splice(0, nLeftSlotCount);
                oProcessedData[sTypeName] = oProcessedData[sTypeName].concat(aData);
                nLeftSlotCount -= aData.length;
            }

            // HTML로 만들어 넣어준다.
            var wel = $.tmpl(this.htResultDisplayInfo[sTypeName].templateName, {aData : oProcessedData[sTypeName]});
            wel.appendTo(this.htResultDisplayInfo[sTypeName].welContainer);
        }

        // 비어있는 카테고리의 경우 숨겨준다.
        this.welACLayerCategory.show();
        for(var i= 0, max=this.welACLayerCategory.length; i<max; i++){
            var wel = this.welACLayerCategory.eq(i);
            if(wel.find("li").length == 0){
                wel.hide();
            }
        }

        this.welLayerDestinationAutoSrchList.addClass('on');
        this.htFlag.bIsAutoCompleteLayerShown = true;

        this.welACItems = this.welLayerDestinationAutoSrchList.find("ul li");
        this.htFlag.nShownItemCount = this.welACItems.length;
    },

    LevenshteinDistance: function(s, t) {
        if (s === t) { return; }
        if (s.length == 0) { return t.length; }
        if (t.length == 0) { return s.length; }

        var v0 = new Array(t.length+1);
        var v1 = new Array(t.length+2);

        for (var i= 0; i<v0.length; i++) { v0[i] = i;}

        for (i=0; i<s.length; i++) {
            v1[0] = i+1;

            for (var j= 0; j< t.length; j++) {
                var cost = (s[i] == t[j]) ? 0 : 1;
                v1[j+1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
            }

            for (j=0; j<v0.length; j++) { v0[j] = v1[j];}
        }

        return v1[t.length];
    },

    getSimilarKeywords: function(sKeyword) {
        var aFoundKeyword = [];
        var sEscapedKeyword = sKeyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        var regex = new RegExp(sEscapedKeyword, "gi");
        var htRecentKeywords = this.oLocalStorage.getAllItems();

        if(!htRecentKeywords){
            return [];
        }

        var aRecentKeyword = htRecentKeywords.recentKeyword.slice(0);

        for (var i=0; i<aRecentKeyword.length; i++) {
            var aMatch = [];
            while ((match = regex.exec(aRecentKeyword[i].wordKr)) != null) {
                aMatch.push(match.index);
            }

            if (aMatch.length == 0){
                continue;
            }

            aFoundKeyword.push({
                raw: aRecentKeyword[i],
                distance: this.LevenshteinDistance(sKeyword, aRecentKeyword[i].wordKr),
                loci: aMatch
            });
        }

        return aFoundKeyword.sort(function(a,b) {
            return a.distance == b.distance ? b.loci.length - a.loci.length : a.distance - b.distance;
        });
    },

    showSementicSearchKeyword: function(){
        var aSemeticWords = this.getSimilarKeywords(this.welFieldSrchDestination.val()),
            sHtmlRecentSearchKeywordAutoLayer = "",
            SHOW_RECENT_SEARCH_KEYWORD_LENGTH = 2;

        if(aSemeticWords.length === 0){
            this.welRecentKeyword.hide();
            return;
        }

        aSemeticWords.splice(SHOW_RECENT_SEARCH_KEYWORD_LENGTH, aSemeticWords.length);

        for(var i = 0, max = aSemeticWords.length; i < max; i++) {
            sHtmlRecentSearchKeywordAutoLayer += $.tmpl("recentSearchKeywordAutoLayer", aSemeticWords[i].raw).outerHTML();
        }

        this.welRecentKeywordContainer.html(sHtmlRecentSearchKeywordAutoLayer);
        this.welRecentKeyword.show();
    },


    /**
     * [사용될 html 템플릿 fragment]
     */
    setTemplate: function () {
        // 자동완성 최근검색
        $.template(
            "recentSearchKeywordAutoLayer",
            '<li>' +
            '<a href="#" data-keyword="${keyword}" data-wordKr="${wordKr}" data-word="{{html word}}" data-id="${id}" data-regionId="${regionId}" data-type="${type}">' +
            '<span class="result_item">' +
            '{{html wordKr}}'+
            '</span>' +
            '</a>' +
            '</li>'
        );


        // 목적지 자동완성 목록
        // - 도시/지역
        $.template(
            "destinationRegion",
            '{{each aData}}' +
            '<li>' +
            '<a href="#" data-keyword="${keyword}" data-wordKr="${wordKr}" data-word="{{html word}}" data-id="${id}" data-regionId="${regionId}" data-type="${type}">' +
            '<span class="result_item">' +
            '{{html wordKr}}' +
            '</span>' +
            '</a>' +
            '</li>' +
            '{{/each}}'
        );
        // - 명소(랜드마크)
        $.template(
            "destinationLandmark",
            '{{each aData}}' +
            '<li>' +
            '<a href="#" data-keyword="${keyword}" data-wordKr="${wordKr}" data-word="{{html word}}" data-id="${id}" data-regionId="${regionId}" data-type="${type}">' +
            '<span class="result_item">' +
            '{{html wordKr}}' +
            '</span>' +
            '</a>' +
            '</li>' +
            '{{/each}}'
        );
        // - 공항
        $.template(
            "destinationAirport",
            '{{each aData}}' +
            '<li>' +
            '<a href="#" data-keyword="${keyword}" data-wordKr="${wordKr}" data-word="{{html word}}" data-id="${id}" data-regionId="${regionId}" data-type="${type}">' +
            '<span class="result_item">' +
            '{{html wordKr}}' +
            '</span>' +
            '</a>' +
            '</li>' +
            '{{/each}}'
        );
        // - 역
        $.template(
            "destinationStation",
            '{{each aData}}' +
            '<li>' +
            '<a href="#" data-keyword="${keyword}" data-wordKr="${wordKr}" data-word="{{html word}}" data-id="${id}" data-regionId="${regionId}" data-type="${type}">' +
            '<span class="result_item">' +
            '{{html wordKr}}' +
            '</span>' +
            '</a>' +
            '</li>' +
            '{{/each}}'
        );
        // - 호텔
        $.template(
            "destinationHotel",
            '{{each aData}}' +
            '<li>' +
            '<a href="#" data-keyword="${keyword}" data-wordKr="${wordKr}" data-word="{{html word}}" data-id="${id}" data-regionId="${regionId}" data-type="${type}">' +
            '<span class="result_item">' +
            '{{html wordKr}}' +
            '</span>' +
            '</a>' +
            '</li>' +
            '{{/each}}'
        );
    }
};
