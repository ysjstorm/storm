var wearMainCollection = function() {
	this.init();
};

wearMainCollection.prototype = {
	init: function() {
		this.cacheElement();
		this.setEvent();
		this.initSnsShare();
	},

	cacheElement: function() {
		this.welContainer = $(".collection_banner");
		this.welImage = this.welContainer.find("> img");
        this.welShareButton = $('#_btnShare'); //공유하기 버튼
        this.welShareLayer = $('.share_ly'); //공유하기 레이어
	},

	setEvent: function() {
        this.welShareButton.click($.proxy(this.showShareLayer, this)); // 공유하기 레이어 열기
	},

	initSnsShare: function () {
		new SnsShare({
			sHashTags : '티몬,티켓몬스터,웨어웨어',
			htKakaotalk: {
				sMessage: this.welContainer.data("title")
			}
		});
	},

    /**
     * 공유하기 레이어를 띄운다.
     */
    showShareLayer : function() {
        var welShareLayer = this.welShareLayer;
        welShareLayer.toggleClass('open');
    },
}

