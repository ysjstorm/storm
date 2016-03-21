/**
 * Wear Promotion
 */
var wearPromotion = function(htOptions){
    $.extend(this, htOptions);
    this.init(htOptions);
};

wearPromotion.prototype = {

    init: function (htOptions) {
        this.cacheElement();
        this.setEvent();
        this.initSnsShare();
    },

    cacheElement: function () {
        this.welContainer = $(".prm");
        this.welShareButton = $('.btn_share'); //공유하기 버튼
        this.welShareLayer = $('.share_ly'); //공유하기 레이어
        this.welLayerCloseButton = $('.btn_detail_cancel'); //레이어 닫기버튼
    },

    setEvent: function () {
        this.welShareButton.click($.proxy(this.showShareLayer, this)); // 공유하기 레이어 열기
        this.welLayerCloseButton.on('click',function(){history.back();}); //레이어 닫기버튼 클릭
    },

    /**
     * 공유하기 레이어를 띄운다.
     */
    showShareLayer : function() {
        var welShareLayer = this.welShareLayer;
        $('body').toggleClass('share_open');
        welShareLayer.toggleClass('open');
    },

    initSnsShare: function () {
        new SnsShare({
            sHashTags : '티몬,티켓몬스터,웨어웨어',
            htKakaotalk: {
                sMessage: this.welContainer.data("title")
            }
        });
    }

};