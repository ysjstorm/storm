/**
 * 컬렉션 딜 리스트 페이지
 */
var localCollection = function(htOptions){
    $.extend(this, htOptions);
    this.init();
};

localCollection.prototype = {
    init : function(){
        this.cacheElement();
        this.setEvent();
        this.initSnsShare();
        this.initSendGAEvent();
    },

    cacheElement : function(){
        this.welBody = $("body");
        this.welShareButton = $(".btn_share");
        this.welShareLayer = $(".ly_collection_share");
        this.welShareLayerBg = this.welShareLayer.find(".bg");
        this.welShareLayerCloseButton = this.welShareLayer.find(".btn_close");

        this.welShareKaKao = $(".share_kakao");
        this.welShareKas = $(".share_kas");
        this.welShareFaceBook = $(".share_fb");
        this.welShareTwitter = $(".share_twitter");

    },

    setEvent : function() {
        this.welShareButton.click($.proxy(this.toggleLayerShare, this));
        this.welShareLayerBg.click($.proxy(this.toggleLayerShare, this));
        this.welShareLayerCloseButton.click($.proxy(this.toggleLayerShare, this));

        this.welShareKaKao.on("click", $.proxy(this.onClickKaKaoTalkBtn, this));
        this.welShareKas.on("click", $.proxy(this.onClickKasBtn, this));
        this.welShareFaceBook.on("click", $.proxy(this.onClickFaceBookBtn, this));
        this.welShareTwitter.on("click", $.proxy(this.onClickTwitterBtn, this));
    },

    initSnsShare: function () {
        new SnsShare(this.htSnsShare);
    },

    initSendGAEvent : function() {
        if(this.nCollectionNo) {
            window.gaSendEvent('localGPS','pageview', { 'dimension7' : this.nCollectionNo});
        }
    },

    /**
     * 공유하기 레이어
     */
    toggleLayerShare : function(){
        window.gaSendEvent('localGPS','click','collection_share');
        this.welBody.toggleClass("show_ly");
    },

    onClickKaKaoTalkBtn : function(e) {
        this.gaSendEvent($(e.currentTarget).attr("tl:ord"));
    },

    onClickKasBtn : function(e) {
        this.gaSendEvent($(e.currentTarget).attr("tl:ord"));
    },

    onClickFaceBookBtn : function(e) {
        this.gaSendEvent($(e.currentTarget).attr("tl:ord"));
    },

    onClickTwitterBtn : function(e) {
        this.gaSendEvent($(e.currentTarget).attr("tl:ord"));
    },

    gaSendEvent : function (nIdx) {
        window.gaSendEvent('localGPS','click','share_'+nIdx);
    }
};
