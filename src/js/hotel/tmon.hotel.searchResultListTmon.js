/**
 * 티몬딜 더보기 페이지
 */
var hotelSearchResultListTmon = function(){
    this.init();
};

hotelSearchResultListTmon.prototype = {
    init: function() {
        this.setHotelData();
        this.cacheElement();
        this.setEvent();
        this.setTemplate();
    },

    /**
     * [DOM 캐시]
     */
    cacheElement: function() {
        this.welContainer = $("#_resultList"); // 딜 리스트 컨테이너

        // 딜정렬
        this.welWrapSortDeal = $(".sort_wrap");
        this.welBtnSortDeal = this.welWrapSortDeal.find(".selected");
        this.welSortBtn = this.welWrapSortDeal.find(".sort_buttons button");
    },

    /**
     * [이벤트 바인딩]
     */
    setEvent: function() {
        this.welBtnSortDeal.on("click", $.proxy(this.showSortLayer, this));
        this.welSortBtn.on("click", $.proxy(this.onClickSort, this));
    },

    setTemplate : function(){
        this.tplListLoading = Handlebars.compile($("#resultListLoading").html());
        this.tplTMONDeal = Handlebars.compile($("#resultListTemplate").html());
    },

    /**
     * 소트 값 선택 시
     * @param e
     */
    onClickSort : function(e){
        var welTarget = $(e.currentTarget);

        this.welSortBtn.removeClass("current");
        welTarget.addClass("current");

        this.welBtnSortDeal.text(welTarget.text());
        this.htHotelData.sort = welTarget.attr("data-sort");
        this.hideSortLayer();
        this.getTMONDeal();
    },

    showListLoading : function(){
        this.hideListLoading();
        // 3개의 문구중 랜던하게 보여준다.
        var nRandomNumber = Math.floor(Math.random() * 3); // 0~2 랜덤값
        var welLayer = $(this.tplListLoading());
        welLayer.find("._randomText").hide().eq(nRandomNumber).css("display", "block");
        this.welContainer.append(welLayer);
    },
    
    hideListLoading : function(){
        this.welContainer.find(".res-loading").remove();
    },

    showSortLayer: function(e){
        gaSendEventForApp("EANsearch", "click", "sorttmon");

        // 이미 소팅 선택 레이어가 열려 있을 경우 닫아준다.
        if(this.welWrapSortDeal.hasClass("open")){
            this.hideSortLayer();
            return false;
        }
        this.welWrapSortDeal.addClass("open");
    },

    hideSortLayer: function(e){
        this.welWrapSortDeal.removeClass("open");
    },

    setHotelData: function() {
        this.htHotelData = {
            keyword : decodeURIComponent(TMON.util.gup("keyword")),
            searchType: TMON.util.gup("searchType") || "unknown",
            searchId: TMON.util.gup("searchId"),
            destinationString: decodeURIComponent(TMON.util.gup("destinationString")),
            arrivalDate: TMON.util.gup("arrivalDate"),
            departureDate: TMON.util.gup("departureDate"),
            propertyCategory: TMON.util.gup("propertyCategory") || "0",
            starRating: TMON.util.gup("starRating") || "",
            sort: TMON.util.gup("sort") || "",
            rate: TMON.util.gup("rate") || ""
        };
    },

    getTMONDeal: function() {
        if (this.oAjaxTMONDealList) {
            this.oAjaxTMONDealList.abort();
        }

        this.welContainer.html("");
        this.showListLoading();

        this.oAjaxTMONDealList = $.ajax({
            url: TMON.hotel.htAPI.listTmon,
            type: "GET",
            dataType: "json",
            data: this.htHotelData,
            success: $.proxy(this.cbGetTMONDeal, this),
            error: function(xhr) {
                // TODO xhr.status
            }
        });
    },

    cbGetTMONDeal: function(res) {
        this.hideListLoading();
        this.oAjaxTMONDealList = null;
        if (!res || res.data === undefined || res.data.total === 0) {
            return;
        }

        this.welContainer.html(this.tplTMONDeal({data:res.data}));
    }
};
