var hotelDealDetail = function(sAppN, sAppQ, aStartDate, aEndDate){
    this.init(sAppN, sAppQ, aStartDate, aEndDate);
};

hotelDealDetail.prototype = {
    nTotalRooms : null,
    arrivalDate : null,
    departureDate : null,
    roomGroupList : null,
    winPosTopAsShowLayer : 0,
    nLoadImageCount : 0,

    init : function(sAppN, sAppQ, aStartDate, aEndDate){
        this.cacheElement();
        this.setEvent();
        this.getRoomReservationData();
        this.sAppN = sAppN;
        this.sAppQ = sAppQ;
        this.aStartDate = aStartDate;
        this.aEndDate = aEndDate;
        this.removeErrorImage();
        this.replaceErrorRoomImages();
    },

    cacheElement : function(){
        // 공통
        this.welBody = $('body');
        this.welWin = $(window);

        // 호텔 상세 정보 레이어
        this.welHotelInfoLayer = $('._hotelDetailsLyr');

        // 딤 레이어어
        this.welLayerDim = $('._dim');

        this.welSlider = $("#_hotelImageSlider"); // 상단의 이미지 슬라이더
    },

    setEvent : function(){
        // 객실정보 수정 버튼
        $('#_btnModifyRoomData').on('click', $.proxy(this.onClickModifyRoomInfo, this));
        $('#_btnModifyDateData').on('click', $.proxy(this.onClickModifyDate, this));

        // ios 터치 안되는 버그 수정
        $('._btnViewRoomInfo, ._btnViewHotelInfo, ._btnViewConvenienceInfo, ._confirmBtn, ._closeBtn')
            .on('touchend', function (e){e.preventDefault();e.stopPropagation();$(this).trigger('click');});

        $('._btnViewRoomImage').on('click', $.proxy(this.showRoomImageLayer, this));
        // 객실정보 보기 버튼
        $('._btnViewRoomInfo').on('click', $.proxy(this.showRoomInfoLayer, this));
        // 지금예약 버튼
        $('._btnRoomReservation').on('click', $.proxy(this.reserveRoom, this));
        // 호텔 상세정보 보기 버튼
        $('._btnViewHotelInfo').on('click', $.proxy(this.showHotelInfoLayer, this));
        // 호텔 지도보기 버튼
        $('._btnViewHotelMap').on('click', $.proxy(this.showHotelMapLayer, this));
        // 호텔 편의시설 모두보기 버튼
        $('._btnViewConvenienceInfo').on('click', $.proxy(this.showConvenienceInfoLayer, this));

        // 객실정보 없음 레이어 닫기버튼
        $('._confirmBtn').on('click', $.proxy(this.hideRoomInfoLayer, this));
        // 레이어 닫기 버튼
        $('._closeBtn').on('click', $.proxy(this.hideRoomInfoLayer, this));

        // 커스텀 레이어 컨트롤(닫기)
        this.welBody.on('click', $.proxy(this.customUIController, this));

        this.welWin.on('reDraw', $.proxy(this.reDrawIosView, this));
    },

    showRoomImageLayer: function(e){
        this.showLayer(e);
    },

    /**
     * 404 에러 나는 이미지 제거용
     */
    removeErrorImage : function(){
        var welImages = this.welSlider.find("li");
        var welContainer = $("#_imgContainer");
        this.nTotalImageCount = welImages.length;
        for(var i= 0, max=welImages.length; i<max ; i++){
            var sUrl = welImages.eq(i).attr("data-image"); // div에 background로 이미지가 들어가기 때문에 data-image에서 url을 가져온다.
            // 숨겨진 div에 가져온 image url을 가지고 img 엘리먼트를 추가하여 error 이벤트를 검출한다.
            $("<img>").attr("src", sUrl)
                .appendTo(welContainer)
                .bind("error", $.proxy(this.onErrorImage, this))
                .bind("load", $.proxy(this.onSuccessImage, this));
        }
    },

    /**
     * 에러난 이미지 제거
     */
    onErrorImage : function(e){
        var sUrl = e.currentTarget.src;

        // 에러난 이미지에 해당하는 li요소를 제거한다.
        this.welSlider.find("li[data-image='" + sUrl + "']").remove();
        this.nLoadImageCount++;
        if(this.nLoadImageCount == this.nTotalImageCount){ // 모든 이미지 체크가 끝난후 한번만 swipe 적용
            this.setMainVisualBanner();
        }
    },

    onSuccessImage : function(e){
        this.nLoadImageCount++;

        if(this.nLoadImageCount == this.nTotalImageCount){ // 모든 이미지 체크가 끝난후 한번만 swipe 적용
            this.setMainVisualBanner();
        }
    },

    /**
     * 404 에러일 때 객실 이미지를 기본 이미지로 대치
     */
    replaceErrorRoomImages : function(){
        var welContainer = $("#_imgContainer");
        var welImages = $('.room-info .img');
        for(var i= 0, max=welImages.length; i<max ; i++){
            var sUrl = welImages.eq(i).attr("data-image"); // div에 background로 이미지가 들어가기 때문에 data-image에서 url을 가져온다.
            // 숨겨진 div에 가져온 image url을 가지고 img 엘리먼트를 추가하여 error 이벤트를 검출한다.
            $("<img>").attr("src", sUrl)
                .appendTo(welContainer)
                .bind("error", $.proxy(this.onErrorRoomImage, this))
        }
    },

    /**
     * 에러난 객실 이미지를 기본 이미지로 대치
     */
    onErrorRoomImage : function(e){
        var sDefaultImageUrl = TMON.hotel.htURL.imgCdn + '/hotel/room_default_img.png';
        var sUrl = e.currentTarget.src;

        // 에러난 이미지에 해당하는 li요소를 제거한다.
        $('.room-info').find(".img[data-image='" + sUrl + "']")
            .css({
                'background-image': 'url('+sDefaultImageUrl+')'
            });

        $('.thumb_hotel').each(function(idx, wel404Img){
            $(this).error(function(){
                $(wel404Img).attr({src:sDefaultImage})
            })
        })
    },

    setMainVisualBanner : function(){
        var welPager = $("#_hotelImageSlider ~ .pager");
        $("#_hotelImageSlider").tmonSlider({
            flexible : true,
            autoPaging: true,
            speed: 400,
            counter : function (e){
                welPager.html(e.current+'&nbsp;/&nbsp;'+e.total);
            }
        });
    },

    onClickModifyDate : function(){
        gaSendEventForApp("EAN", "click", "date");
        this.modifyRoomInfo();
    },


    onClickModifyRoomInfo : function(){
        gaSendEventForApp("EAN", "click", "room");
        this.modifyRoomInfo();
    },

    modifyRoomInfo : function(){
        var sTitle = "객실수정",
        sUrl = "",
        sProtocol = "http://",
        sDomain = document.location.host,
        sQueryString = TMON.hotel.htURL.roomSearch + "?";
        sQueryString += "arrivalDate=" + this.arrivalDate + "&";
        sQueryString += "departureDate=" + this.departureDate + "&";
        sQueryString += "roomGroupList=" + this.roomGroupList;

        this.setRoomDataCookie();

        if( TMON.bIsIos ){
            sUrl = sProtocol + sDomain + sQueryString + this.sAppN;
            TMON.app.callApp('webview', 'showView', sTitle, sUrl, true);
        }else if( TMON.bIsAndroid ){
            sUrl = sProtocol + sDomain + sQueryString;
            TMON.app.callApp('mytmon', 'showView', sTitle, sUrl, true);
        }
    },

    /**
     * 객실 정보 보기
     * @param e
     */
    showRoomInfoLayer : function(e){
        this.showLayer(e);
        gaSendEventForApp("EAN", "click", "info");
    },

    hideRoomInfoLayer : function(e){
        this.hideLayer(e);
    },

    /**
     * 호텔 상세정보 보기
     * @param e
     */
    showHotelInfoLayer : function(e){
        this.showLayer(e);
        gaSendEventForApp("EAN", "click", "infodetail");
    },

    /**
     * 호텔 지도정보 보기
     * @param e
     */
    showHotelMapLayer : function(e){
        var welMapBtn = $(e.currentTarget),
        sLat = welMapBtn.data("lat"),
        sLng = welMapBtn.data("lng"),
        sTitle = welMapBtn.data("title"),
        sAddress = welMapBtn.data("address");

        TMON.app.callApp('webview', 'showMapView', sLat, sLng, sTitle, sAddress);
    },

    /**
     * 모두 보기
     * @param e
     */
    showConvenienceInfoLayer : function(e){
        this.showLayer(e);
        gaSendEventForApp("EAN", "click", "amenity");
    },

    reDrawIosView : function(e){
        this.welWin.scrollTop((this.winPosTopAsShowLayer + 1) * -1);
    },

    showLayer : function(e){
        var target = $(e.currentTarget);
        this.winPosTopAsShowLayer = this.welWin.scrollTop() * -1;
        this.welBody.css({
            'overflow-y':'hidden',
            'position':'fixed',
            'top': this.winPosTopAsShowLayer
        });
        // target이 호텔 상세 정보 보기일 때
        if (target.is('._btnViewHotelInfo')) {
            this.welHotelInfoLayer.show();
        } else {
            target.next().show();
        }
        this.welLayerDim.show();
        if(TMON.bIsIos){
            this.welWin.trigger('reDraw');
        }
    },

    hideLayer : function(e){
        $('.lyr').hide();
        this.welLayerDim.hide();
        this.welBody.css({
            'overflow-y':'auto',
            'position':'static',
            'top': this.winPosTopAsShowLayer
        });
        this.welWin.scrollTop(this.winPosTopAsShowLayer * -1);
    },

    showDimLayer : function(){
        this.welLayerDim.show();
    },

    hideDimLayer : function(){
        this.welLayerDim.hide();
    },

    customUIController: function(e) {
        var target = e ? $(e.target) : $(window.event.srcElement);

        if (target.hasClass("dim")) {
            this.hideLayer();
        }
    },

    getRoomReservationData : function(){
        var aRoomDataList = ["arrivalDate","departureDate","roomGroupList"],
        aRoomDataValueList = [];

        for( var i=0, max = aRoomDataList.length; i<max; i++){
            if(TMON.util.getCookie(aRoomDataList[i]) !== null){
                // data form cookie
                aRoomDataValueList.push(decodeURIComponent(TMON.util.getCookie(aRoomDataList[i])));
            }else{
                // data from queryString
                aRoomDataValueList.push(decodeURIComponent(TMON.util.gup(aRoomDataList[i])));
            }
        }

        //딜상세 페이지에서 IOS에서 URL에 들어있는 날짜가 두번 URI인코딩되서 넘어오는 문제가 있어서 두번 디코딩하게 수정
        this.arrivalDate = decodeURIComponent(aRoomDataValueList[0]);
        this.departureDate = decodeURIComponent(aRoomDataValueList[1]);
        this.roomGroupList = decodeURIComponent(aRoomDataValueList[2]);
    },

    setRoomDataCookie : function(){
        TMON.util.setCookie("arrivalDate", this.arrivalDate, {path: '/'});
        TMON.util.setCookie("departureDate", this.departureDate, {path: '/'});
        TMON.util.setCookie("roomGroupList", this.roomGroupList, {path: '/'});
    },

    reserveRoom : function(e) {
        var target = $(e.currentTarget);
        var param = {
            rateCode : target.data('ratecode'),
            roomTypeCode : target.data('roomtypecode'),
            productType : target.data('producttype'),
            arrivalDate : this.arrivalDate === 'null' ? this.convertDate(this.aStartDate).join("/") : this.arrivalDate ,
            departureDate : this.departureDate === 'null' ? this.convertDate(this.aEndDate).join("/") : this.departureDate,
            roomGroupList : target.data('roomgrouplist'),
            customerSessionId : $('#customerSessionId').val(),
            hotelId : /[^/]*$/.exec(location.pathname)[0]
        };

        $.ajax({
            url : '/api/ajax/getEanDeal',
            dataType : 'json',
            data : param,
            success : function(result){
                if(result.httpCode != 200){
                    this.error(result);
                    return;
                }
                var sTitle = encodeURIComponent('예약하기');
                TMON.app.callApp('cart', 'goBuy', result.data.redirectTo + '&title=' + sTitle);
            },
            error : function(result){
                alert('선택하신 객실 정보를 찾을 수 없습니다. 검색을 수정하고 다시 시도해주세요.');
            }
        });

        gaSendEventForApp("EAN", "click", "reserve");

    },

    /**
     * 안드로이드에서 백버튼을 눌렀을 때 안드로이드 앱에서 호출한다.
     */
    onCLickAndroidBackBtn : function(){
        // 레이어가 열려 있을 경우 닫아준다.
        if(this.welLayerDim.is(":visible")){
            this.hideLayer();
        }else{ // 레이어가 열려 있지 않을 경우 뒤로가기 한다.
            TMON.app.callApp('webview', 'closeWebView', true);
        }
    },

    convertDate : function(aDate){
        var aConvertedDate = [];

        aConvertedDate[0] = aDate[1] < 10 ? "0" + aDate[1] : aDate[1];
        aConvertedDate[1] = aDate[2] < 10 ? "0" + aDate[2] : aDate[2];
        aConvertedDate[2] = aDate[0];

        return aConvertedDate;
    }
};
