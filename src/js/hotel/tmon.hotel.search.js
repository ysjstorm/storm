var hotelSearch = function(aStartDate, aEndDate, sAppN, sAppQ){
    this.aStartDate = aStartDate;
    this.aEndDate = aEndDate;
    this.sAppN = sAppN;
    this.sAppQ = sAppQ;

    this.init();
};

hotelSearch.prototype = {
    bIsCheckInCalendarShow : false,
    bIsCheckOutCalendarShow : false,

    init : function(){
        this.oLocalStorage = new hotelLocalStorage("recentSearchKeyword", 50);
        this.oDesAutoComplete = new hotelSearchDesAC(this, this.oLocalStorage, this.getDataFromHash());

        this.cacheElement();
        this.setEvent();
        this.setTemplate();
        this.initCalendar();
        this.setInitialData();
        this.getPopularPlace();
        this.showRecentSearchPlace(); // 최근 검색 여행지 표시
        this.openInitLink();
    },

    /**
     * 통합검색에서 클릭한 호텔명, 체크인, 체크아웃 버튼에 따라서
     * 해당하는 동작을 수행한다.
     * 호텔명 -> 목적지가 텍스트가 없을 경우만, 목적지 입력창에 포커스(키보드 노출)
     * 체크인, 아웃 -> 달력 노출
     */
    openInitLink : function(){
        var sInitLink = TMON.util.getCookie('clickLink'); // "place", "checkIn", "checkOut"
        TMON.util.setCookie("clickLink", "", {path: '/'}); // 한번만 사용 후 쿠키 제거

        switch(sInitLink){
            case "place" :
                // 포커스를 시켜서 키보드를 노출시킬려고 했으나, app에서는 동작안함, 기획과 협의하에 그냥 두기로 함
                if(this.welInputKeyword.val() == ""){
                    this.welInputKeyword.focus();
                }
                break;
            case "checkIn" :
                this.showCheckinCalendar();
                break;
            case "checkOut" :
                this.showCheckoutCalendar();
                break;
        }
    },

    /**
     * 초기 URI로 넘어오는 데이터를 셋팅해준다.
     */
    setInitialData : function(){
        var htHashData = this.getDataFromHash();

        // Hash에 데이터가 있을 경우 Hash 데이터를 우선으로 한다.
        if(htHashData){
            this.oCal.aStartDate = [parseInt(htHashData.checkIn[0], 10), parseInt(htHashData.checkIn[1], 10), parseInt(htHashData.checkIn[2], 10)];
            this.oCal.aEndDate = [parseInt(htHashData.checkOut[0], 10), parseInt(htHashData.checkOut[1], 10), parseInt(htHashData.checkOut[2], 10)];
            this.welDisplayCheckIn.val(this.getFormatedDate(htHashData.checkIn));
            this.welDisplayCheckOut.val(this.getFormatedDate(htHashData.checkOut));

            this.welInputKeyword.val(htHashData.wordKr);
            return;
        }

        this.oCal.aStartDate = this.aStartDate;
        this.oCal.aEndDate = this.aEndDate;
        this.welDisplayCheckIn.val(this.getFormatedDate(this.aStartDate));
        this.welDisplayCheckOut.val(this.getFormatedDate(this.aEndDate));
    },

    cacheElement : function(){
        this.welBody = $("body");
        this.welCalendar = $("#chk_in_calendar");
        this.welDisplayCheckIn = $("#_btnCheckIn input.date");
        this.welDisplayCheckOut = $("#_btnCheckOut input.date");
        this.welCheckInWrap = $(".chk_in");
        this.welCheckOutWrap = $(".chk_out");
        this.welBtnCheckIn = $("#_btnCheckIn").find("button.btn_cal_toggle");
        this.welBtnCheckOut = $("#_btnCheckOut").find("button.btn_cal_toggle");

        this.welInCalWrap = $("#_checkInCalendarWrap");
        this.welOutCalWrap = $("#_checkOutCalendarWrap");

        this.welInputKeyword = $("#field_search_destination");
        this.welRecentSearchWrap = $(".recent.recommendations");
        this.welPopularPlaceWrap = $('.popular.recommendations');

        this.welRecentKeyword = $(".ly_auto_destination_search .recent_keyword"); // 최근검색어
    },

    setEvent : function(){
        $("#btn_ean_search").click($.proxy(this.doSearch, this)); // 검색
        this.welBody.click($.proxy(this.onClickBody, this));
        $("#_popularPlaceList").on("click", "li.region a", $.proxy(this.onClickPopularLink, this));
        this.welRecentSearchWrap.find(".recommendations_list").on("click", "a", function(){gaSendEventForApp("Lodging", "click", "recentsearch");}); // GA 트래킹 코드 추가
    },

    onClickBody : function(e){
        this.hideCheckInCal();
        this.hideCheckOutCal();
    },

    setTemplate: function() {
        // 최근검색 여행지
        $.template(
            "recentSearchKeyword",
            '{{each aItems}}' +
            '<li class="recent-item item">'+
            '<a href="${url}">'+
            '${wordKr}'+
            '<br>'+
            '<span class="target-date">'+
            '${checkIn[0]}. ${checkIn[1]}. ${checkIn[2]}'+
            ' ~ '+
            '${checkOut[0]}. ${checkOut[1]}. ${checkOut[2]}'+
            '</span>'+
            '</a>'+
            '</li>' +
            '{{/each}}'
        );
    },

    /**
     * 페이지 리로드 후에도 같은 목적지와 날짜를 가지고 검색결과를 보여줘야 하기 때문에,
     * 해당 값들을 해쉬에 저장해 둔다.
     */
    setHashData : function(htSelectedData){
        var aData = ["keyword=" + encodeURI(htSelectedData.keyword)];
        aData.push("wordKr=" + encodeURI(htSelectedData.wordKr));
        aData.push("type=" + encodeURI(htSelectedData.type));
        aData.push("id=" + encodeURI(htSelectedData.id));
        aData.push("regionId=" + encodeURI(htSelectedData.regionId));
        aData.push("checkIn=" + this.oCal.aStartDate.join("-"));
        aData.push("checkOut=" + this.oCal.aEndDate.join("-"));

        document.location.hash = aData.join("&");
    },

    /**
     * 해쉬로부터 목적지와 체크인,아웃 날짜를 가져온다.
     * @returns {*}
     */
    getDataFromHash : function(){
        var sHash = document.location.hash.replace("#", "");
        var regDate = new RegExp(/^[0-9]{4}-([1-9]|1[0-2])-([1-9]|[1-2][0-9]|3[0-1])$/);

        if(!sHash){
            return false;
        }

        var aHash = sHash.split("&");
        var htData = {};
        for(var i= 0, max=aHash.length ; i<max ; i++){
            var aData = aHash[i].split("=");
            htData[aData[0]] = decodeURI(aData[1]);
        }

        // 날짜가 유효한 포멧이 아닐경우 서버에서 받은 값을 사용한다.
        if(regDate.test(htData.checkIn) == false){
            htData.checkIn = this.aStartDate;
        }else{
            htData.checkIn = htData.checkIn.split("-");
        }

        if(regDate.test(htData.checkOut) == false){
            htData.checkOut = this.aEndDate;
        }else{
            htData.checkOut = htData.checkOut.split("-");
        }

        return htData;
    },

    getPopularPlace : function(){
        $.ajax({
            url: TMON.hotel.htAPI.popularPlace,
            type: 'GET',
            dataType: 'JSON',
            context: this,
            success: $.proxy(this.drawPopularPlace, this),
            error: function(xhr){

            }
        });
    },

    drawPopularPlace : function(res){
        if(!res.data){
            return;
        }

        var oRes = res.data;
        var nRegionLength = res.data.length;
        var raw_temp = $("#popularPlace").html();
        var template = Handlebars.compile(raw_temp);

        // 인기검색어 regionId 값을 ean딜 호출시 넘기면
        for( var i = 0; i < nRegionLength; i ++ ){
            for( var j = 0; j < oRes[i].keywordData.length; j++ ){
                var nTempUrl = TMON.hotel.htURL.searchList;
                    nTempUrl += "?arrivalDate="+this.withZero(this.oCal.aStartDate[1]) + "/" + this.withZero(this.oCal.aStartDate[2]) + "/" + this.oCal.aStartDate[0];
                    nTempUrl += "&departureDate="+this.withZero(this.oCal.aEndDate[1]) + "/" + this.withZero(this.oCal.aEndDate[2]) + "/" + this.oCal.aEndDate[0];
                    nTempUrl += "&searchType=region"; // region 하드코딩 서버에서처리하지 않음 내려주는 데이터자체가 region에 대한 데이터라서
                    nTempUrl += "&searchId="+ oRes[i].keywordData[j].regionId;
                    nTempUrl += "&keyword="+ encodeURIComponent(oRes[i].keywordData[j].keyword);
                    nTempUrl += "&fullKeyword="+ encodeURIComponent(oRes[i].keywordData[j].keyword);
                    nTempUrl += "&destinationString="+ encodeURIComponent(oRes[i].keywordData[j].keyword);
                    nTempUrl += this.sAppN;
                oRes[i].keywordData[j]['url'] = nTempUrl;
            }
        }

        $('#_popularPlaceList').html(template(res));
        this.welPopularPlaceWrap.addClass('on');
        $('.region-type').on('click', this.popularPlaceToggle);
    },

    popularPlaceToggle : function(e){
        $(e.currentTarget).parent().toggleClass('open');
    },

    showCheckinCalendar : function(){
        if(this.bIsCheckInCalendarShow){
            this.hideCheckInCal();
            return false;
        }

        this.oCal.setPickStart(); // 체크 인 날짜 선택하게 셋팅
        this.oCal.setCurrentDisplayYearMonth(this.oCal.aStartDate[0], this.oCal.aStartDate[1]); // 체크 아웃이 선택된 달의 날짜로 달력을 그려주게 셋팅
        this.welCalendar.appendTo(this.welInCalWrap); // 하나의 달력으로 체크아웃/인을 같이 사용하기 떄문에 위치를 옴겨준다.
        this.welBtnCheckIn.addClass("on");
        this.welCheckInWrap.addClass("on");
        this.welCheckOutWrap.removeClass("on");
        this.welBtnCheckOut.removeClass("on");
        this.bIsCheckInCalendarShow = true;
        this.bIsCheckOutCalendarShow = false;
        this.oCal.show(true);
        return false;
    },

    hideCheckInCal : function(){
        this.welCheckInWrap.removeClass("on");
        this.welBtnCheckIn.removeClass("on");
        this.bIsCheckInCalendarShow = false;
        this.oCal.hide();
    },

    showCheckoutCalendar : function(bShowCheckInDateInDisplay){
        if(this.bIsCheckOutCalendarShow){
            this.hideCheckOutCal();
            return false;
        }

        this.oCal.setPickEnd(); // 체크 아웃 날짜 선택하게 셋팅
        this.oCal.setCurrentDisplayYearMonth(this.oCal.aEndDate[0], this.oCal.aEndDate[1]); // 체크 아웃이 선택된 달의 날짜로 달력을 그려주게 셋팅
        this.welCalendar.appendTo(this.welOutCalWrap); // 하나의 달력으로 체크아웃/인을 같이 사용하기 떄문에 위치를 옴겨준다.
        this.welBtnCheckIn.removeClass("on");
        this.welCheckInWrap.removeClass("on");
        this.welCheckOutWrap.addClass("on");
        this.welBtnCheckOut.addClass("on");
        this.bIsCheckInCalendarShow = false;
        this.bIsCheckOutCalendarShow = true;
        this.oCal.show(bShowCheckInDateInDisplay);

        return false;
    },

    hideCheckOutCal : function(){
        this.welBtnCheckOut.removeClass("on");
        this.welCheckOutWrap.removeClass("on");
        this.bIsCheckOutCalendarShow = false;
        this.oCal.hide();
    },

    onClickCalendarCheckIn : function(){
        this.showCheckinCalendar();
        return false;
    },

    onClickCalendarCheckOut : function(){
        this.showCheckoutCalendar(true);
        return false;
    },

    getFormatedDate : function(aDate){
        var aDay = ["일", "월", "화", "수", "목", "금", "토"];
        var oDate = new Date(aDate[0], aDate[1]-1, aDate[2]);
        var result = [];

        result.push(aDate[0]);
        result.push((aDate[1].length > 1 || aDate[1] > 9)? aDate[1] : '0'+aDate[1]);
        result.push((aDate[2].length > 1 || aDate[2] > 9)? aDate[2] : '0'+aDate[2]);

        return result[0] + "년 " + result[1] + "월 " + result[2] + "일 " + aDay[oDate.getDay()] + "요일";

    },

    initCalendar : function(){
        $("#_btnCheckIn").click($.proxy(this.onClickCalendarCheckIn, this));
        $("#_btnCheckOut").click($.proxy(this.onClickCalendarCheckOut, this));

        this.oCal = new tmonCalendar({
            welLayer : this.welCalendar, // 칼렌더 레이어
            welCal : this.welCalendar.find("div.month_wrap"), // 개별 달력을 감싸고 있는 엘리먼트, 2개 이상의 칼렌더가 나올 수도 있다.
            sDayCellSeletor : ".cal_date_list li", // 날짜 Cell을 선택하기 위한 셀렉터
            sDayTextSelector : ".date", // 날짜 Cell에 날짜의 숫자가 입력되는 엘리먼트의 셀렉터
            welBtnPrev : this.welCalendar.find(".btn_last"), // 이전달 버튼
            welBtnNext : this.welCalendar.find(".btn_next"), // 다음달 버튼

            sDisabledClass : "past", // 오늘 이전의 날짜를 선택할 수 없을때 추가하는 클래스
            sSaturdayClass : "wkd sat", // 토요일에 추가하는 클래스
            sSundayClass : "wkd sun", // 일요일에 추가하는 클래스
            sHolidayClass : "wkd sun", // 공휴일에 추가하는 클래스
            sHoverDayClass : "", // 마우스 오버시에 추가되는 클래스
            sTodayClass : "", // 오늘 날짜에 추가되는 클래스
            sStartClass : "chk_in_day", // 선택된 시작 날짜 클래스
            sBetweenClass : "stay_in", // 선택된 시작, 끝 날짜 사이의 클래스
            sEndClass : "chk_out_day", // 선택된 끝 날짜 클래스
            sOneDayClass : "one_day", // 1박2일일 경우 시작 날짜에 추가되는 클래스
            aStartDate : this.aStartDate,
            aEndDate : this.aEndDate,

            sDisplayYearMonthClass : "_yearMonth", // 년,월 표시되는 엘리먼트의 클래스
            nStartNEndDateGap : 2, // 시작날짜 와 끝날짜 사이의 최소 갭
            nMaxAvailableDays : 499, // 오늘부터 x일까지만 선택 가능
            nMaxReservableDays : 28, // 예약가능한 최대 기간(박수)
            nSelectableStartDayFromToday : 0, // 오늘부터 x일 이후에 선택 가능
            bDisableOverMaxReservableDays : true,
            bEnableMouseoverAction:false,

            afterSelect : $.proxy(function(oThis, bIsPickStart, aStartDate, aEndDate, nDays, bShowEndDateSelector){ // 날짜 선택 후 실행되는 함수
                this.aStartDate = aStartDate;
                this.aEndDate = aEndDate;
                this.welDisplayCheckIn.val(this.getFormatedDate(aStartDate));
                this.welDisplayCheckOut.val(this.getFormatedDate(aEndDate));

                if(bIsPickStart){
                    this.hideCheckInCal();
                }else{
                    this.hideCheckOutCal();
                }

                if(bShowEndDateSelector && bIsPickStart){
                    this.showCheckoutCalendar(false);
                }
            },this)
        });

    },

    /**
     * 인기 여행지 링크 클릭시에도 최근검색 여행지에 표시되어야 한다.
     */
    onClickPopularLink : function(e){
        var wel = $(e.currentTarget);

        // 로컬스토리지 저장 객체
        var htRecentSearchKeyword = {
            keyword: wel.attr("data-keyword"),
            wordKr: wel.attr("data-keyword"),
            type: "region",
            id: wel.attr("data-id"),
            checkIn: this.aStartDate,
            checkOut: this.aEndDate,
            url: wel.attr("data-url")
        };

        // 최근검색어 로컬스토리지에 저장
        this.oLocalStorage.addItem(htRecentSearchKeyword);
        gaSendEventForApp("Lodging", "search", "popular");
    },

    /**
     * 검색버튼 클릭시
     */
    doSearch : function(){
        var sSearchKeyword = this.welInputKeyword.val();

        if(!sSearchKeyword){
            alert("목적지를 입력해 주세요.");
            return false;
        }else if(this.oCal.aStartDate[0] == 0){
            alert("체크인/체크아웃 날짜를 선택해 주세요.");
            return false;
        }

        if(this.oDesAutoComplete.isSelectedHotel){
            this.goToHotelDetailPageUrl();
        }else{
            this.goToSearchListPage(sSearchKeyword);
        }

        gaSendEventForApp("Lodging", "search", "searchbutton");
    },

    /**
     * 호텔 상세 페이지로 이동
     */
    goToHotelDetailPageUrl : function(){
        var htSelectedData = this.oDesAutoComplete.getSelectedDestinationData();

        var sUrl = "http://"+location.host+TMON.hotel.htURL.detail;
        sUrl += "/" + htSelectedData.id;
        sUrl += "?arrivalDate="+this.getDateFormatForUrl(this.oCal.aStartDate[1], this.oCal.aStartDate[2], this.oCal.aStartDate[0]);
        sUrl += "&departureDate="+this.getDateFormatForUrl(this.oCal.aEndDate[1], this.oCal.aEndDate[2], this.oCal.aEndDate[0]);
        sUrl += "&" + htSelectedData.keyword;
        sUrl += "&roomGroupList=2";
        sUrl += "&title=" + htSelectedData.wordKr;

        this.saveToLocalStorage(sUrl);
        location.href = sUrl;
    },

    /**
     * 검색 결과 리스트 페이지 이동
     */
    goToSearchListPage : function(){
        var htSelectedData = this.oDesAutoComplete.getSelectedDestinationData();
        this.setHashData(htSelectedData);

        var aParam = ["searchType=" + htSelectedData.type,
            "searchId=" + htSelectedData.id,
            "regionId=" + htSelectedData.regionId,
            "keyword=" + htSelectedData.keyword,
            "fullKeyword=" + htSelectedData.wordKr,
            "departureDate=" + this.getDateFormatForUrl(this.oCal.aEndDate[1], this.oCal.aEndDate[2], this.oCal.aEndDate[0]), // 호텔에서 출발, 체크아웃
            "arrivalDate=" + this.getDateFormatForUrl(this.oCal.aStartDate[1], this.oCal.aStartDate[2], this.oCal.aStartDate[0]) // 호텔 도착, 체크인
        ];

        var sParameters = aParam.join("&");

        var sUrl = "/hotel/search/list?" + sParameters + this.sAppN;
        this.saveToLocalStorage(sUrl);
        document.location = sUrl;
    },

    /**
     * 최근 검색 여행지에 표시하기위해 local storage에 추가한다.
     * @param sUrl
     */
    saveToLocalStorage : function(sUrl){
        var htSelectedData = this.oDesAutoComplete.getSelectedDestinationData();

        // 로컬스토리지 저장 객체
        var htRecentSearchKeyword = {
            keyword: htSelectedData.keyword,
            wordKr: htSelectedData.wordKr,
            type: htSelectedData.type,
            id: htSelectedData.id,
            regionId: htSelectedData.regionId,
            checkIn: this.oCal.aStartDate,
            checkOut: this.oCal.aEndDate,
            url: sUrl
        };
        // 최근검색어 로컬스토리지에 저장
        this.oLocalStorage.addItem(htRecentSearchKeyword);
    },

    getDateFormatForUrl : function(nMonth, nDay, nYear){
        return this.withZero(nMonth) + "/" + this.withZero(nDay) + "/" + nYear;
    },

    withZero : function(n){
        return n < 10 ? "0" + n : n;
    },

    /**
     * 최근 검색 여행지를 표시한다.
     */
    showRecentSearchPlace : function(){
        var htKeywords = this.oLocalStorage.getAllItems();
        var SHOW_RECENT_SEARCH_KEYWORD_LENGTH = 2;

        if(!htKeywords){
            return;
        }

        var aRecentKeyword = htKeywords.recentKeyword;
        var welItems = $.tmpl("recentSearchKeyword", {aItems : aRecentKeyword.slice(0, SHOW_RECENT_SEARCH_KEYWORD_LENGTH)});
        welItems.appendTo(this.welRecentSearchWrap.find(".recommendations_list"));
        this.welRecentSearchWrap.addClass('on');
    }
};
