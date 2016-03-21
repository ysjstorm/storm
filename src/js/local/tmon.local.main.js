var localMain = function(htOptions) {
    this.htOptions = htOptions;
    $.extend(this, htOptions);
    this.init();
};

localMain.prototype = {
    init : function() {
        this.cacheElement();
        this.setEvent();
        this.initPage(this.htOptions.sCurrentPage);
    },

    /**
     * 페이지별 필요한 함수를 호출한다.
     * @param sPage
     */
    initPage : function (sPage) {
        switch(sPage){
            case "/local/main" : // 로컬 홈 페이지
                this.oLocalHome = new localHome(this.htOptions);
                break;

            case "/local/collection" : // 콜렉션 페이지
                this.oCollection = new localCollection(this.htOptions);
                break;

            case "/local/select" : // 지역선택 페이지
                this.oSelect = new localSelect(this.htOptions);
                break;

            default :
                break;
        }
    },

    cacheElement : function () {
        this.welWin = $(window);
        this.welBody = $("body");
        //this.welFixHeader = $(".submenu");
        //if(this.welFixHeader.length){
        //    this.bHeaderFixed = false;
        //    this.nLastTop = 0;
        //    this.nOffsetBottom = this.welFixHeader.offset().top + this.welFixHeader.height();
        //}
    },

    setEvent : function () {
        //this.welFixHeader.length && this.welWin.scroll($.proxy(this.onScroll, this));
    },

    /**
     * 로컬 메인 헤더 영역 스크롤시 fix 및 slide up,down 한다.
     */
    onScroll : function(){
        var nScroll = this.welWin.scrollTop();

        if(nScroll >= this.nOffsetBottom) {
            this.welBody.addClass("fixed");
            this.welFixHeader.addClass("slide_up");
            this.bHeaderFixed = true;
        }else{
            this.welBody.removeClass("fixed");
            this.welFixHeader.removeClass("slide_up slide_down");
            this.bHeaderFixed = false;
        }

        if(this.bHeaderFixed){
            if(nScroll > this.nLastTop){ // Scroll Down
                this.welFixHeader.removeClass("slide_down");
                !this.welFixHeader.hasClass("slide_up") && this.welFixHeader.addClass("slide_up");
            }else if(nScroll < this.nLastTop){ // Scroll Up
                this.welFixHeader.removeClass("slide_up");
                !this.welFixHeader.hasClass("slide_down") && this.welFixHeader.addClass("slide_down");
            }
        }
        this.nLastTop = nScroll;
        // slide_up, slide_down, body = fixed
    },

    /**
     *
     * @param htData
     * nGPSStatusCode :
     *      0 : 수신성공,
     *      1 : GPS ON/권한 있으나 수실 실패
     *      2 : GPS ON/권한 없음,
     *      3 : GPS OFF / 권한 있음
     *      4 : GPS OFF / 권한 없음
     * nLatitude : 37.5551069 // 위도
     * nLongitude : 126.9685024 // 경도
     */
    updateLocationFromApp : function(sData){
        var htData = JSON.parse(sData);
        if(this.oLocalHome.isCurrentLastViewShowing()) {
            return;
        } else {
            this.oLocalHome.showGPSNotice(htData.nGPSStatusCode,htData.nLatitude, htData.nLongitude);
            this.oLocalHome.loadDealFromApp(htData.nGPSStatusCode, htData.nLatitude, htData.nLongitude);
        }
    },
    /**
     * Select 즐겨찾기
     **/
    updateFavoriteListFromApp : function(){
        this.oLocalHome.resetFavoriteListMenu();
    }
};
