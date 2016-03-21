var hotelFindAutoComplete = function(EANApiData){
    this.init(EANApiData);
};

hotelFindAutoComplete.prototype = {
    oAjax : null,
    nItemSelectIndex : -1,
    nTotalItemCount : 0,
    welACItems : null,

    init: function(EANApiData){
        this.EANApiData = EANApiData;
        this.cacheElement();
        this.setEvent();
        this.setTemplate();
    },

    cacheElement: function(){
        // 호텔찾기
        this.welHotelSearchWrap = $('#hotel_name_search');
        this.welFieldSrchHotel = this.welHotelSearchWrap.find('.input-uio .txt');
        this.welLayerHotelAutoSrchList = this.welHotelSearchWrap.find('.ly_auto_hotel_search');
        this.welListContainer = this.welLayerHotelAutoSrchList.find('.list');
        this.welBtnMoveHotel = $('.move-btn');
        this.welHotelBtnBox = $("#hotelSearchResult");
        this.welDetailFilterField = $("fieldset.concealable");
    },

    setEvent: function(){
        this.welHotelSearchWrap.find(".clean-btn").on('click', $.proxy(this.resetHotelSrchField, this));
        this.welHotelSearchWrap.find(".cancel-btn").on('click', $.proxy(this.resetHotelSrchField, this));
        this.welFieldSrchHotel.on('keyup', $.proxy(this.onKeyUp, this));
        this.welFieldSrchHotel.on("click", $.proxy(this.onClickInput, this));
        this.welLayerHotelAutoSrchList.on('click', '.list li a', $.proxy(this.selectHotelList, this));
        $("body").click($.proxy(this.onClickBody, this));
    },


    onClickBody : function(e){
        this.welLayerHotelAutoSrchList.removeClass('on');
    },

    onClickInput : function(){
        var sKeyword = this.welFieldSrchHotel.val();
        if(sKeyword){
            this.getHotelSearchKeyword(sKeyword);
        }
        return false;
    },

    onKeyUp : function(e){
        var sKeyword = this.welFieldSrchHotel.val();

        if (!sKeyword){
            this.clearHotelList();
            return;
        }
        if( TMON.bIsIos || TMON.bIsAndroid ) {
            this.getHotelSearchKeyword(sKeyword);
        }else {
            if (e.keyCode == 38) { // Arrow Up
                this.setPrevItem();
            } else if (e.keyCode == 40) { // Arrow Down
                this.setNextItem();
            } else if (e.keyCode == 13) { // Enter
                this.selectACItem();
            } else if (e.keyCode > 40 || e.keyCode == 8) { // 8:Backspace
                this.getHotelSearchKeyword(sKeyword);
            }
        }
    },

    setNextItem : function(){
        if(this.nTotalItemCount == 0 || !this.welLayerHotelAutoSrchList.hasClass("on")){
            return false;
        }

        this.welACItems.eq(this.nItemSelectIndex).removeClass("on").css({background : ""});
        this.nItemSelectIndex = this.nItemSelectIndex + 1 == this.nTotalItemCount ? 0 : this.nItemSelectIndex + 1;
        this.welACItems.eq(this.nItemSelectIndex).addClass("on");
    },

    setPrevItem : function(){
        if(this.nTotalItemCount == 0 || !this.welLayerHotelAutoSrchList.hasClass("on")){
            return false;
        }

        this.welACItems.eq(this.nItemSelectIndex).removeClass("on");
        this.nItemSelectIndex = this.nItemSelectIndex - 1 < 0 ? this.nTotalItemCount - 1 : this.nItemSelectIndex - 1;
        this.welACItems.eq(this.nItemSelectIndex).addClass("on");
    },

    selectACItem : function(){
        if(this.nItemSelectIndex == -1 || !this.welLayerHotelAutoSrchList.hasClass("on")){
            return false;
        }

        this.welACItems.eq(this.nItemSelectIndex).find("a").trigger("click");
    },

    setTemplate: function(){
        // 호텔찾기 자동완성 목록
        $.template(
            "findHotel",
            '<li class="list-item">' +
            '<a href="#" data-wordKr="${wordKr}" data-word="${word}" data-id="${id}" data-type="${type}">' +
            '<span class="result_item">' +
            '{{html wordKr}}' +
            '</span>' +
            '</a>' +
            '</li>'
        );
    },

    /**
     * [호텔찾기 입력필드 값 초기화]
     */
    resetHotelSrchField: function() {
        this.welFieldSrchHotel.val("");
        this.clearHotelList();
        this.welHotelBtnBox.hide();
        this.welDetailFilterField.show();
    },

    /**
     * [호텔찾기 자동완성 한글, 기타언어 입력시 호출시점 분기]
     */
    getHotelSearchKeyword: function(sKeyword) {
        var MINIMUM_KEYWORD_BYTE = 2;
        var nKeywordByte = this.getByte(sKeyword);

        // 한글 1글자이상, 영문 2글자이상 입력시 검색 되어야한다.
        if(nKeywordByte >= MINIMUM_KEYWORD_BYTE) {
            this.callHotelKeywordAutoComplete(sKeyword);
        }else{
            this.clearHotelList();
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
     * [호텔찾기 자동완성 API ajax call]
     * @param  {[String]} sKeyword [자동완성 검색 키워드]
     */
    callHotelKeywordAutoComplete: function(sKeyword) {
        if(this.oAjax){
            this.oAjax.abort();
            this.clearHotelList();
        }

        var nRegionId = this.EANApiData.sSearchId;
        var htData = {
        		type: 'H',
        		regionId: nRegionId
    		};

        this.oAjax = $.ajax({
            url: TMON.hotel.htAPI.autoComplete + encodeURI(sKeyword),
            type: 'GET',
            dataType: 'json',
            data: htData,
            context: this,
            success: $.proxy(this.drawHotelSearchResult, this),
            error: function(xhr) {
                // TODO xhr.status
            }
        });

    },

    /**
     * [호텔찾기 자동완성 API 응답데이터로 호텔목록 그려줌]
     * @param  {[Object]} res [호텔목록 API 응답 객체]
     */
    drawHotelSearchResult: function(res) {
        this.clearHotelList();
        this.oAjax = null;

        if (res.data.total === 0){
            return;
        }

        var htData = res.data,
            MAX_HOTEL_LIST_COUNT = 8,
            sHtmlHotel = "",
            aHotel = htData.hotel,
            nHotelTotal = htData.total,
            aHotelList = htData.total;

        if (MAX_HOTEL_LIST_COUNT < nHotelTotal) {
            for (var i = 0, max = nHotelTotal; i < max; i++) {
                aHotel = aHotel.slice(0, MAX_HOTEL_LIST_COUNT);
                aHotelList = MAX_HOTEL_LIST_COUNT;
            }
        }

        for (var h = 0, max = aHotelList; h < max; h++) {
            sHtmlHotel += $.tmpl("findHotel", aHotel[h]).outerHTML();
        }

        this.welListContainer.html(sHtmlHotel);
        this.welLayerHotelAutoSrchList.addClass('on');

        this.welACItems = this.welLayerHotelAutoSrchList.find("ul li");
        this.nTotalItemCount = this.welACItems.length;
    },

    /**
     * [호텔찾기 자동완성 목록 클릭시 호텔 필드값 추출]
     */
    selectHotelList: function(e) {
        var hotel = $(e.currentTarget),
            sVal = hotel.text(),
            sUrl = TMON.hotel.htURL.detail;

        this.setHotelSrchVal(sVal);

        sUrl += "/"+hotel.attr('data-id');
        sUrl += '?arrivalDate='+TMON.util.gup('arrivalDate');
        sUrl += '&departureDate='+TMON.util.gup('departureDate');
        sUrl += '&customerSessionId='+this.EANApiData.sCustomerSessionId;
        sUrl += '&roomGroupList=2';
        sUrl += '&title='+this.welFieldSrchHotel.val();
        sUrl += TMON.hotel.oHotelMain.sAppN;

        this.clearHotelList();
        this.welHotelBtnBox.show();
        this.welDetailFilterField.hide(); // 호텔명이 선택되면 검색 조건을 숨긴다.
        this.welBtnMoveHotel.attr('href', sUrl);
        return false;
    },

    /**
     * [호텔찾기 자동완성 템플릿 클리어]
     */
    clearHotelList: function() {
        this.nItemSelectIndex = -1;
        this.nTotalItemCount = 0;
        this.welLayerHotelAutoSrchList.find('.list').html("");
        this.welLayerHotelAutoSrchList.removeClass('on');
    },

    /**
     * [호텔찾기 필드값 자동완성 목록 선택시와 선택하지 않았을 경우 기본값으로 셋팅]
     */
    setHotelSrchVal: function(val) {
        var sDefaultAutoKeyword = this.welLayerHotelAutoSrchList.find('li:first a .result_item').text(),
            val = val || sDefaultAutoKeyword;

        this.welFieldSrchHotel.val(val);
    }
};
