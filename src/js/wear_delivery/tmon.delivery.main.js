/**
 * Wear 메인
 * @param sCurrentPage sCurrentPage
 * @param htURL htURL
 * @param htOptions htOptions
 */
var wearDeliveryMain = function(htOptions) {
    $.extend(this, htOptions);
    this.htOptions = htOptions;
    this.init();
};

wearDeliveryMain.prototype = {
    init: function(){
        this.initPage();
        this.setHambergerEvent();
        $(window).hashchange($.proxy(TMON.commonWear.checkHashQuerystring, this));
    },

    initPage: function(){
        $('.drawer_w').show();
        TMON.commonWear.updateShoppingbagCountOnDeliveryUI(this.htOptions.nCartCount);
        TMON.commonWear.updateDeliveryCount(this.htOptions.nDeliveryCount);

        switch (this.sCurrentPage) {
            case this.htViewName.buyList:
                TMON.commonWear.setTitleCallApp('text', '주문배송조회');
                this.oWearList = new wearList(this.htOptions);
                break;
            case this.htViewName.detailBuy:
                TMON.commonWear.setTitleCallApp('text', '주문상세정보');
                this.oWearDetail = new wearDetail(this.htOptions);
                break;
        }
    },

    setHambergerEvent : function(){
        $('#_toggleShowDrawer').on('change',function(){
            if($(this).is(':checked') == true){

                TMON.commonWear.layerOpen();
            }else{
                TMON.wear.oHashbang.setState("",{"layer":"close"});
            }
        });
    }
};