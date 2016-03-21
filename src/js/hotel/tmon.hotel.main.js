/**
 * 호텔 메인
 * @param htOptions
 */
var hotelMain = function(htOptions){
    this.init(htOptions);
};

hotelMain.prototype = {
    init : function(htOptions){
        $.extend(this, htOptions);

        this.initPage();
        this.cacheElement();
        this.setEvent();
    },

    initPage : function(){
        switch(this.sCurrentPage){
            case "/hotel/search/list" : // 상세 검색, 리스트 페이지
                this.oSearchDetail = new hotelSearchDetail(this.sAppN, this.sAppQ, this.searchId);
            break;
            case "/hotel/search" : // 첫 검색 페이지
                this.oSearch = new hotelSearch(this.aStartDate, this.aEndDate, this.sAppN, this.sAppQ);
            break;
            case "/hotel/detail" : // 딜 상세 페이지
                this.oDealDetail = new hotelDealDetail(this.sAppN, this.sAppQ, this.aStartDate, this.aEndDate, this.sRoomGroupList);
                this.oHighQuailtyImage = new eanImage(); // 최적화된 이미지 호출 tmon.hotel.eanImage.js
            break;
            case "/hotel/room/search" : // 딜 상세 옵션 변경 페이지
                this.oDealDetailOption = new hotelDealDetailOption(this.aStartDate, this.aEndDate, this.sRoomGroupList);
            break;
            case "/hotel/search/list/tmon" :
                this.oSearchListTmon = new hotelSearchResultListTmon(this.sAppN, this.sAppQ);
            break;
            case "/hotel/package/popup" :
                this.oEanPackagePopup = new hotelEanPackagePopup();
        }
    },

    cacheElement : function(){

    },

    setEvent : function(){
        // add tl area code listener
        $('._tlClick').on('click', function(e){ log_click(this, 'click'); });
    }
};
