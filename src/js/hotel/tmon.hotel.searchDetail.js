var hotelSearchDetail = function(){
    this.init.apply(this, arguments);
};

hotelSearchDetail.prototype = {
    htHotelData: {
        sDestinationKeyword: "", // keyword
        sSearchType: "", // type
        sSearchId: "", // id
        sChkIn: "", // checkin calendar val
        sChkOut: "", // checkout calendar val
        sGradeVal: "", // filter 호텔등급
        sRoomTypeVal: "", // filter 숙박유형
        sLandmark: "", // filter 랜드마크, 지역/명소 (현재 미사용)
        sCvfVal: "", // filter 편의시설 (현재 미사용)
        sCustomerSessionId: "", // EAN 딜 리스트 API 호출 후 얻어오는 값
        cacheLocation: "", // EAN 딜 리스트 API 호출 후 얻어오는 값
        cacheKey: "", // EAN 딜 리스트 API 호출 후 얻어오는 값
        sSort: "", // 딜 정렬, 2차 스프린트에서 검색 기획변경에 따라 정렬 UI 변경될 예정, 추가작업 필요
        minRate : 0,
        maxRate : 1000001,
        sProductType : null // EAN 항공권 패키지 구분 값
    },

    sEANSortValue : "",

    nLastItemTop: 0, // EAN 딜의 마지막 아이템의 top 위치, 스크롤시 다음 페이지 로딩 위해 사용
    nLastItemHeight: 0, // EAN 딜의 마지막 아이템의 Height값, 스크롤시 다음 페이지 로딩 위해 사용

    nLowPrice : 0,
    nHighPrice : 1000001, // 가격 필터 최대값, 100만원일경우 100만원 이상으로 검색되어야 한다. 그럴경우 1원을 더 붙여서 호출한다.

    init: function(sAppN, sAppQ, searchId) {
        this.aStartDate = TMON.util.gup('arrivalDate');
        this.aEndDate = TMON.util.gup('departureDate');
        this.nSearchId = Number(searchId);

        this.cacheElement();
        this.setTemplate();
        this.setEvent();
        this.setInitData();
        this.viewInit();
        this.initPriceRangeSlider();
        this.oHotelAutoComplete = new hotelFindAutoComplete(this.htHotelData);
    },

    /**
     * [DOM 캐시]
     */
    cacheElement: function() {
        // 공통
        this.welWin = $(window);

        // EAN딜
        this.welEANDealCount = $('.search_sort');

        this.welBtnWrap = $(".option-tab");
        this.welBtnShowDetailOption = $("#_btnDetailOption");
        this.welBtnShowSortLayer = $("#_btnSort");
        this.welDetailOptionLayer = $(".filter-options");
        this.welSortLayer = $(".sort-options");

        this.welListContainer = $("#_resultList");
        this.welFooter = $("footer");

        // 가격필터
        this.welPrice = $("#price");
        this.welPriceLow = $(".wrap_price_txt > span").eq(0);
        this.welPriceHigh = $(".wrap_price_txt > span").eq(1);

        // 호텔등급
        this.welFilterHotelGrade = $('#hotel_grade input.chk-btn');

        // 숙박유형
        this.welRoomType = $("#room_type");
        this.welListRoomType = this.welRoomType.find(".input-uio");
        this.welInputRoomType = this.welRoomType.find("input");

        // 호텔 딜리스트 정보, 정렬리스트
        this.welSortAsLowPrice = $('#_EanSortLowPrice');
        this.welSortAsHighPrice = $('#_EanSortHightPrice');
        this.welSortAsLowHotelGrade = $('#_EanSortLowGrade');
        this.welSortAsHighHotelGrade = $('#_EanSortHightGrade');
        this.welSortAsPopular = $('#_EanSortPopular');
        this.welSortAsCustomerGrade = $('#_EanSortCustomerGrade');

        // 티몬딜
        this.welTMONDealWrap = $('.tmon-deal-wrap');
        this.welTMONDealBannerTemplate = $("#tmonDealBanner");
    },

    setTemplate : function(){
        this.tplListLoading = Handlebars.compile($("#resultListLoading").html());
        this.tplListEmpty = Handlebars.compile($("#resultListNodata").html());
        this.tplListItem = Handlebars.compile($("#resultListTemplate").html());
    },

    /**
     * [이벤트 바인딩]
     */
    setEvent: function() {
        this.welBtnShowDetailOption.click($.proxy(this.showDeatilOptionLayer, this)); // 상세 조건 레이어
        this.welBtnShowSortLayer.click($.proxy(this.showSortLayer, this)); // 인기순 ... 레이어

        this.welDetailOptionLayer.find(".concealable .cancel-btn").click($.proxy(this.cancelDetailLayer, this)); // 취소
        this.welDetailOptionLayer.find(".confirm-btn").click($.proxy(this.confirmDetailLayer, this)); // 적용

        // Hotel Deal List sort
        this.welSortAsLowPrice.on('click', $.proxy(this.arrangeHotelList, this));
        this.welSortAsHighPrice.on('click', $.proxy(this.arrangeHotelList, this));
        this.welSortAsLowHotelGrade.on('click', $.proxy(this.arrangeHotelList, this));
        this.welSortAsHighHotelGrade.on('click', $.proxy(this.arrangeHotelList, this));
        this.welSortAsPopular.on('click', $.proxy(this.arrangeHotelList, this));
        this.welWin.on('scroll', $.proxy(this.chkScrollEnd, this));

        // GA 코드 추가
        $(".modify-btn").click(function(){gaSendEventForApp("Lodging", "search", "searchbutton");}); // "수정"버튼 클릭시 GA 코드 추가
        $("#hotel_grade").find("input").click(function(){gaSendEventForApp("Lodging", "click", "hotelrank");}); // "호텔등급" 옵션 클릭 GA 코드 추가
        $("#room_type").find("input").click(function(){gaSendEventForApp("Lodging", "click", "class");}); // "숙박유형" 옵션 클릭 GA 코드 추가
        $(".sort-options:first").find("input").click(function(){gaSendEventForApp("Lodging", "click", "sortean");}); // 정렬 클릭 GA코드 추가
        $(".tmon-deal-wrap").on("click", "#_btnMoreTmonList", function(){gaSendEventForApp("EANsearch", "click", "moretmon");}); // 더보기
        $(".tmon-deal-wrap").on("click", "#_tmonHotelImageSlider a", function(){gaSendEventForApp("EANsearch", "click", "tmondeal");}); // TMON 딜 클릭
        this.welListContainer.on("click", "a", function(){gaSendEventForApp("EANsearch", "click", "eandeal");}); // EAN 딜 클릭

        this.welFilterHotelGrade.on("click", $.proxy(this.toggleGradeStyle, this)); // 호텔등급 스타일 토글
        this.welListRoomType.on("click", ".chk", $.proxy(this.toggleRoomTypeStyle, this)); // 숙박유형 스타일 토글
    },

    setInitData : function(){
        if(decodeURIComponent(TMON.util.gup('keyword')) === "null"){
            this.htHotelData.sDestinationKeyword = $.trim($(".destination").text());
        }else{
            this.htHotelData.sDestinationKeyword = decodeURIComponent(TMON.util.gup('keyword'))
        }
        this.htHotelData.sDestinationValKr = decodeURIComponent(TMON.util.gup('destinationString'));
        this.htHotelData.sDestinationVal = decodeURIComponent(TMON.util.gup('fullKeyword'));
        this.htHotelData.sSearchType = TMON.util.gup('searchType') || "unknown";
        this.htHotelData.sSearchId = this.nSearchId;
        this.htHotelData.sChkIn = TMON.util.gup('arrivalDate');
        this.htHotelData.sChkOut = TMON.util.gup('departureDate');

        var htHashData = this.getDataFromHash(),
            // 파라미터가 없으면 util.gup이 null을 반환하므로 불린으로 분기
            bHasStarRating = TMON.util.gup("starRating") !== null,
            bHasPropertyCategory = TMON.util.gup("propertyCategory") !== null;

        if(htHashData){ // 해쉬 값을 먼저 설정
            this.htHotelData.sGradeVal = htHashData.starRating; // 호텔등급
            this.htHotelData.sRoomTypeVal = htHashData.propertyCategory; // 숙박유형
        }else{
            // 외부에서 호텔등급과 숙박형태 파라미터를 주어 접근시 해당 파라미터로 페이지 렌더링
            this.htHotelData.sGradeVal = bHasStarRating ? decodeURIComponent(TMON.util.gup("starRating")) : this.getFilterValues(this.welFilterHotelGrade);
            this.htHotelData.sRoomTypeVal = bHasPropertyCategory ? decodeURIComponent(TMON.util.gup("propertyCategory")) : ( this.getFilterValues(this.welInputRoomType) || "0" );
        }

        this.htHotelData.sRoomTypeVal && this.setInitCategory(this.htHotelData.sRoomTypeVal.split("|")); // 숙박유형 체크 되어있게
        this.htHotelData.sGradeVal && this.setInitStartrating(this.htHotelData.sGradeVal.split("|"));  // 호텔등급 체크 되어있게
    },

    /**
     * 호텔 등급 스타일 토글
     */
    toggleGradeStyle : function(e){
        var target = $(e.currentTarget);
        target.parents('.input-uio').toggleClass('on');
    },

    /**
     * 숙박유형 스타일 토글
     */
    toggleRoomTypeStyle : function(e){
        var target = $(e.currentTarget);
        target.parents('.input-uio').toggleClass('on');
    },

    /**
     * 최초 로딩시 해쉬에 있는 숙박유형 설정
     */
    setInitCategory : function(aPropertyCategory){
        for(var i= 0, max= aPropertyCategory.length; i<max ;i++){
            this.welInputRoomType.filter("[data-id=" + aPropertyCategory[i] + "]").prop("checked", true);
        }
    },

    /**
     * 최초 로딩시 해쉬에 있는 호텔등급 설정
     */
    setInitStartrating : function(aStartRating){
        for(var i= 0, max= aStartRating.length; i<max ;i++){
            this.welFilterHotelGrade.filter("[data-id=" + aStartRating[i] + "]").prop("checked", true);
        }
    },

    viewInit : function(){
        this.getLodgingTypeCount();
        this.getTMONDeal();
        this.getEANDeal(true);
        this.removeCookie();
    },

    /**
     * 가격 필터가 슬라이더로 바뀜
     */
    initPriceRangeSlider : function(){
        this.oPriceSlider = new hotelPriceRangeSlider({
            welWrap : $("#sliderWrap"),
            welLeftMarker : $("#sliderWrap .leftSlider"),
            welRightMarker : $("#sliderWrap .rightSlider"),
            welSlideBar : $("#sliderWrap .range"),
            nMin : 0,
            nMax : 1000000,
            nUnit : 100000,
            nGapOfLeftAndRightMarker : 100000,
            beforeRangeMove : $.proxy(function(sMarkerName){
                gaSendEventForApp("Lodging", "click", "pricerange");// "가격" 옵션 클릭 GA 코드 추가

                if(sMarkerName == "left"){
                    this.welPriceLow.addClass("change_color");
                    this.welPriceHigh.removeClass("change_color");
                }else{
                    this.welPriceLow.removeClass("change_color");
                    this.welPriceHigh.addClass("change_color");
                }
            }, this),
            onRangeMove : $.proxy(function(sMarkerName, nValue){
                if(sMarkerName == "left"){
                    this.welPriceLow.find("em").html(TMON.util.numberWithComma(nValue));
                    this.nLowPrice = nValue;
                }else{
                    this.welPriceHigh.find("em").html(TMON.util.numberWithComma(nValue));
                    this.nHighPrice = nValue == 1000000 ? nValue + 1 : nValue; // 100만원 이상일 경우 1을 더해서 보낸다.
                }
            }, this),
            afterRangeMove : $.proxy(function(sMarkerName, nValue){
            }, this)
        });
    },

    showListLoading : function(){
        this.hideListLoading();
        // 3개의 문구중 랜던하게 보여준다.
        var nRandomNumber = Math.floor(Math.random() * 3); // 0~2 랜덤값
        var welLayer = $(this.tplListLoading());
        welLayer.find("._randomText").hide().eq(nRandomNumber).css("display", "block");
        this.welListContainer.append(welLayer);
    },

    hideListLoading : function(){
        this.welListContainer.find(".res-loading").remove();
    },

    showListEmpty : function(){
        this.welListContainer.html(this.tplListEmpty());
    },

    removeCookie : function(){
        TMON.util.setCookie("arrivalDate", null, {path: '/'});
        TMON.util.setCookie("departureDate", null, {path: '/'});
        TMON.util.setCookie("roomGroupList", null, {path: '/'});
    },

    initTMONDealSlider : function(){
        var welPager = $(".pagination"),
            btn_prev = $('.recomm_btns .left'),
            btn_next = $('.recomm_btns .right');

        $("#_tmonHotelImageSlider").tmonSlider({
            flexible : true,
            btn_prev: btn_prev,
            btn_next: btn_next,
            counter : function (e){
                welPager.each(function(idx, el){
                    welPager.find('span:first-child').text(e.current);
                    welPager.find('span:last-child').text(e.total);
                })
            }
        });
    },

    /**
     * 호텔 이미지가 없을 경우 기본 이미지로 교체
     * @param wel
     */
    onErrorImage : function(wel){
        var sDefaultImage = '/shared/m/img/hotel/hotel_default_img.png';

        wel.find('.thumb_hotel').error(function(e){
            $(e.target).attr("src", sDefaultImage);
        });
    },

    showDeatilOptionLayer : function(){
        gaSendEventForApp("EANsearch", "click", "eandetail");

        if(this.welDetailOptionLayer.is(":visible")){
            this.hideDetailOptionLayer();
            return false;
        }

        this.welEANDealCount.hide();
        this.welListContainer.hide(); // 상세조건 레이어가 보여질떄는 딜리스트와 푸터는 숨겨준다.
        this.welFooter.hide();
        this.welBtnWrap.addClass("tab1_active");
        this.welBtnWrap.removeClass("tab2_active");
        this.welSortLayer.hide();
        this.welDetailOptionLayer.show();
        this.oPriceSlider.onShow();
    },

    hideDetailOptionLayer : function(){
        this.welBtnWrap.removeClass("tab1_active");
        this.welBtnWrap.removeClass("tab2_active");
        this.welDetailOptionLayer.hide();
        this.welListContainer.show();
        this.welEANDealCount.show();
        this.welFooter.show();
    },

    cancelDetailLayer : function(){
        this.hideDetailOptionLayer();
    },

    confirmDetailLayer : function(){
        this.htHotelData.sGradeVal = this.getFilterValues(this.welFilterHotelGrade);
        this.htHotelData.sRoomTypeVal = this.getFilterValues(this.welInputRoomType) || "0";

        this.getTMONDeal();
        this.getEANDeal(true);
        this.hideDetailOptionLayer();
        this.resetSort();
    },

    resetSort : function(){
        this.welBtnShowSortLayer.find(".desc").html($(".sort-options .input-uio:first label").text());
        $(".sort-options .input-uio:first input").prop("checked",true);
        this.sEANSortValue = "";
    },

    showSortLayer : function(){
        gaSendEventForApp("EANsearch", "click", "sortean");

        if(this.welSortLayer.is(":visible")){
            this.hideSortLayer();
            return false;
        }

        this.hideDetailOptionLayer();
        this.welBtnWrap.removeClass("tab1_active");
        this.welBtnWrap.addClass("tab2_active");
        this.welSortLayer.show();
    },

    hideSortLayer : function(){
        this.welBtnWrap.removeClass("tab2_active");
        this.welSortLayer.hide();
    },

    arrangeHotelList: function(e){
        var wel = $(e.currentTarget),
            sSortId = wel.attr('data-sort'),
            sSortTitle = wel.parent().find("label").text();

        this.sEANSortValue = sSortId;
        this.getEANDeal(true);
        this.hideSortLayer();
        this.welBtnShowSortLayer.find(".desc").text(sSortTitle);
    },

    initSearchNotiUI: function() {
        this.welEANDealCount.hide();
    },

    updateEANCommonData: function(htEANCommonData) {
        if(htEANCommonData !== null) {
            this.htHotelData.sCustomerSessionId = htEANCommonData.customerSessionId;
            this.htHotelData.cacheLocation = htEANCommonData.cacheLocation;
            this.htHotelData.cacheKey = htEANCommonData.cacheKey;
            this.htHotelData.sProductType = htEANCommonData.productType;
        }
    },

    makeEANApiParam: function() {
        var htParam = {
            keyword: this.htHotelData.sDestinationKeyword,
            searchType: this.htHotelData.sSearchType, // 자동완성 type값
            searchId: this.htHotelData.sSearchId, // 자동완성 id값
            destinationString: this.htHotelData.sDestinationVal, // 목적지 키워드
            arrivalDate: this.htHotelData.sChkIn, // 체크인 날짜 MM/DD/YYYY
            departureDate: this.htHotelData.sChkOut, // 체크아웃 날짜 MM/DD/YYYY
            propertyCategory: this.htHotelData.sRoomTypeVal, // 숙박유형 id값
            starRating: this.htHotelData.sGradeVal, // 호텔등급 id값
            sort: this.sEANSortValue, // 정렬id
            minRate : this.nLowPrice,
            maxRate : this.nHighPrice,
            rate: this.htHotelData.sPriceVal, // 가격 id값
            customerSessionId: this.htHotelData.sCustomerSessionId, // 최초 1회 호출 후 내려받은값
            cacheLocation: this.htHotelData.cacheLocation,
            cacheKey: this.htHotelData.cacheKey,
            productType: this.htHotelData.sProductType
        };

        return htParam;
    },

    makeTMONApiParam: function() {
        var htParam = {
            keyword: this.htHotelData.sDestinationKeyword,
            searchType: this.htHotelData.sSearchType, // 자동완성 type값
            searchId: this.htHotelData.sSearchId, // 자동완성 id값
            destinationString: this.htHotelData.sDestinationVal, // 목적지 키워드
            arrivalDate: this.htHotelData.sChkIn, // 체크인 날짜 MM/DD/YYYY
            departureDate: this.htHotelData.sChkOut, // 체크아웃 날짜 MM/DD/YYYY
            propertyCategory: this.htHotelData.sRoomTypeVal, // 숙박유형 id값
            starRating: this.htHotelData.sGradeVal, // 호텔등급 id값
            sort: this.sEANSortValue, // 정렬id
            minRate : this.nLowPrice,
            maxRate : this.nHighPrice
        };
        return htParam;
    },

    /**
     * 현재 검색 조건(호텔등급, 가격을 제외한)에서 존재하는 숙박유형만 표시하기 위한 API 콜을 위해 사용
     */
    makeLodgeApiParam: function() {
        var htParam = {
            keyword: this.htHotelData.sDestinationKeyword,
            searchType: this.htHotelData.sSearchType, // 자동완성 type값
            searchId: this.htHotelData.sSearchId, // 자동완성 id값
            destinationString: this.htHotelData.sDestinationVal, // 목적지 키워드
            arrivalDate: this.htHotelData.sChkIn, // 체크인 날짜 MM/DD/YYYY
            departureDate: this.htHotelData.sChkOut, // 체크아웃 날짜 MM/DD/YYYY
            sort: this.sEANSortValue, // 정렬id
            minRate : this.nLowPrice,
            maxRate : this.nHighPrice,
            rate: this.htHotelData.sPriceVal, // 가격 id값
            customerSessionId: this.htHotelData.sCustomerSessionId, // 최초 1회 호출 후 내려받은값
            cacheLocation: this.htHotelData.cacheLocation,
            cacheKey: this.htHotelData.cacheKey
        };

        return htParam;
    },

    /**
     * 페이지 리로드 후에도 같은 옵션값을 가지고 검색해야 하기 때문에,
     * 해당 값들을 해쉬에 저장해 둔다.
     */
    setHashData : function(){
        var aData = ["propertyCategory=" + this.htHotelData.sRoomTypeVal || ""]; // 숙박유형
        aData.push("starRating=" + this.htHotelData.sGradeVal || '"'); // 호텔등급

        document.location.hash = aData.join("&");
    },

    /**
     * 해쉬로부터 호텔등급, 숙박유형 데이터를 가져온다.
     * @returns {*}
     */
    getDataFromHash : function(){
        var sHash = document.location.hash.replace("#", "");

        if(!sHash){
            return false;
        }

        var aHash = sHash.split("&");
        var htData = {};
        for(var i= 0, max=aHash.length ; i<max ; i++){
            var aData = aHash[i].split("=");
            htData[aData[0]] = decodeURI(aData[1]);
        }

        return htData;
    },

    /**
     * 숙박 유형 카운트를 가져온다.
     */
    getLodgingTypeCount : function(){
        if(this.oAjaxGetLodging){
            this.oAjaxGetLodging.abort();
        }

        this.oAjaxGetLodging = $.ajax({
            url: TMON.hotel.htAPI.getLodgingTypeCount,
            type: 'GET',
            dataType: 'json',
            data: this.makeLodgeApiParam(),
            context: this,
            success: $.proxy(this.cbGetLodgingTypeCount, this),
            error: function(xhr) {
            }
        });
    },

    cbGetLodgingTypeCount : function(res){
        var aData = [];

        if(res && res.data && res.data.propertyCategoryFilterList){
            aData = res.data.propertyCategoryFilterList
        }

        this.hideEmptyRoomType(aData);
    },

    /**
     * 리스트 개수가 0개인 숙박유형은 숨겨준다.
     */
    hideEmptyRoomType : function(aData){
        this.welListRoomType.hide();

        for(var i= 0, max = aData.length; i<max ; i++){
            this.welListRoomType.find("input[data-id='" + aData[i].id + "']").parents("li:first").show(); // 해당 id를 가진 엘리먼트를 show한다.
        }
    },

    getTMONDeal: function() {
        this.welTMONDealWrap.html("");
        $.ajax({
            url: TMON.hotel.htAPI.listTmon,
            type: 'GET',
            dataType: 'json',
            data: this.makeTMONApiParam(),
            context: this,
            success: $.proxy(this.cbGetTMONDeal, this),
            error: function(xhr) {
            }
        });
    },

    cbGetTMONDeal: function(res) {
        if (!res || res.data === undefined || res.data.total === 0) {
            return;
        }

        var MAX_COUNT_TMON_DEAL_BANNER = 6;
        // 더보기 누를 때 이동하는 URL
        var sMoreTmonDealLink = TMON.hotel.htURL.searchListTmon;
            sMoreTmonDealLink += "?arrivalDate="+(TMON.util.gup('arrivalDate') == null ? "" : TMON.util.gup('arrivalDate'));
            sMoreTmonDealLink += "&departureDate="+(TMON.util.gup('departureDate') == null ? "" : TMON.util.gup('departureDate'));
            sMoreTmonDealLink += "&searchType="+(TMON.util.gup('searchType') == null ? "" : TMON.util.gup('searchType'));
            sMoreTmonDealLink += "&searchId="+(TMON.util.gup('searchId') == null ? "" : TMON.util.gup('searchId'));
            sMoreTmonDealLink += "&keyword="+(TMON.util.gup('keyword') == null ? "" : TMON.util.gup('keyword'));
            sMoreTmonDealLink += "&starRating="+(this.htHotelData.sGradeVal == null ? "" : this.htHotelData.sGradeVal); // 호텔 등급
            sMoreTmonDealLink += "&propertyCategory="+(this.htHotelData.sRoomTypeVal == null ? "" : this.htHotelData.sRoomTypeVal); // 숙박유형
            sMoreTmonDealLink += "&rate="+(this.htHotelData.sPriceVal == null ? "" : this.htHotelData.sPriceVal); // 가격
            sMoreTmonDealLink += TMON.hotel.oHotelMain.sAppN;


        // 티몬 호텔 딜 리스트를 2개씩 슬라딩 되어야 해서 2개씩 2차원 배열로 만들어준다.
        var aSlicedHotelList = res.data.hotelList.slice();
        var aTmonDealArrange = [];
        for(var i = 0; i < aSlicedHotelList.length; i+=2){
            aTmonDealArrange.push(aSlicedHotelList.slice(i,i+2));
        }

        var tplTmonDealSlider = Handlebars.compile(this.welTMONDealBannerTemplate.html());
        this.welTMONDealWrap.html(tplTmonDealSlider({
            hotelList : aTmonDealArrange,
            tmonDealListUrl : sMoreTmonDealLink,
            totalCount : res.data.totalCount
        }));

        this.welTMONDealWrap.addClass('on');
        this.initTMONDealSlider();
    },

    getEANDeal : function(bIsNewLoading){
        this.bIsEANNewLoading = bIsNewLoading;
        bIsNewLoading && this.welListContainer.html(""); // 새로운 호텔 검색이면 내용을 비워준다.
        this.showListLoading();
        this.oAjaxEANDealList = $.ajax({
            url: bIsNewLoading ? TMON.hotel.htAPI.list : TMON.hotel.htAPI.pageList,
            type: 'GET',
            dataType: 'json',
            data: this.makeEANApiParam(),
            context: this,
            success: $.proxy(this.cbGetEANDeal, this),
            error: function(xhr) {
                // TODO xhr.status
            }
        });
    },

    cbGetEANDeal : function(res){
        this.hideListLoading();
        if(!res || !res.data || !res.data.totalCount){
            this.bIsEANNewLoading && this.showListEmpty();
            return;
        }

        if (res.data.eanCommonData) {
            this.updateEANCommonData(res.data.eanCommonData);
        }

        var welHotels = $(this.tplListItem({data : res.data}));
        welHotels.appendTo(this.welListContainer);
        this.nLastItemTop = this.welListContainer.find("li:last").offset().top;
        this.nLastItemHeight = this.welListContainer.find("li:last").height() * 3;
        this.onErrorImage(welHotels);
    },

    /**
     * [화면 스크롤 마지막일경우 list나 pagelist API 호출하여 페이지 데이커 캐싱하는 메소드 호출]
     */
    chkScrollEnd: function() {
        if(!this.nLastItemTop){
            return;
        }

        // 스크롤중 마지막 아이템의 위치가 마지막 아이템의 높이의 3배 정도 만큼 남을 정도로 스크롤이 되었을때 다음 딜리스트를 로드한다.
        if(this.welWin.scrollTop() + this.welWin.height() > this.nLastItemTop - (this.nLastItemHeight)){
            this.nLastItemTop = 0;
            this.getEANDeal(false);
        }
    },

    /**
     * [체크박스의 값을 '|'로 구분하여 전달하도록 구분처리]
     * @param  {[type]} welFilter [체크박스 필드 배열]
     * @return {[type]}           ['|'로 분기된 값의 문자열]
     */
    getFilterValues: function(welFilter){
        var aIds = [];
        for (var i = 0; i < welFilter.length; i++) {
            if(welFilter[i].checked){
                aIds.push(welFilter.eq(i).attr('data-id'));
            }
        }

        return aIds.join('|');
    }
};
