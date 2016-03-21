/**
 * Created by superjang on 2016. 1. 5..
 */
var hotelEanPackagePopup = function(){
    this.init();
};

hotelEanPackagePopup.prototype = {
    init : function(){
        this.cacheElement();
        this.setEvent();
    },

    cacheElement : function() {
        this.btnGotoHotelList = $("#_gotoPackageHotelList");
    },

    setEvent : function(){
        this.btnGotoHotelList.on("click", $.proxy(this.gotoPackageHotelList, this));
    },

    getSearchKeyword : function(){
        var sKeyword = this.btnGotoHotelList.data("keyword");

        if(sKeyword == ""){
            sKeyword = null;
        }

        return sKeyword;
    },

    gotoPackageHotelList : function(){
        var sKeyword = this.getSearchKeyword(),
            htTmpParam = {
                isEanPackage : "Y"
            },
            htParam = JSON.stringify(htTmpParam);


        TMON.app.callApp('event', 'searchKeyword', sKeyword, htParam);
    }
};
