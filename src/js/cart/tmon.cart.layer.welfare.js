/**
 * 카트 복지카드회원 레이어
 */
var cartLayerWelfare = function(htOptions) {
	this.init(htOptions);
};
cartLayerWelfare.prototype = {
	htOptions : {
		cbResult : function(){}
	},

	init : function(htOptions){
		$.extend(true, this.htOptions, htOptions);
		this.cacheElement();
		this.setEvent();
		this.initLayer();
	},

	cacheElement : function(){
		this.welCart = $('.cart');
		this.welLayerWelfare = $('#__ly_welfare'); // 복지카드 알림 레이어
		this.welBtnLayerWelfareNorm = this.welLayerWelfare.find('a.bt_continue'); // 일반 결제 버튼
		this.welBtnLayerWelfareCard = this.welLayerWelfare.find('a.bt_submit'); // 복지카드 결제 버튼
		this.welBtnLayerWelfareClose = this.welLayerWelfare.find('.bt_ly_close'); // 레이어 닫기 버튼
	},

	setEvent : function(){
		this.welBtnLayerWelfareNorm.on('click', $.proxy(this.onClickBtnLayerWelfareNorm, this));
		this.welBtnLayerWelfareCard.on('click', $.proxy(this.onClickBtnLayerWelfareCard, this));
		this.welBtnLayerWelfareClose.on('click', $.proxy(this.onClickBtnLayerWelfareClose, this));
	},

	initLayer : function(){
		this.welLayerWelfare.show();
	},

	onClickBtnLayerWelfareNorm : function(e){
		e.preventDefault();

		this.welCart.data('useWelfare', false);

		this.welLayerWelfare.hide();
	},

	onClickBtnLayerWelfareCard : function(e){
		e.preventDefault();

		this.welCart.data('useWelfare', true);

		this.welLayerWelfare.hide();

		(this.htOptions.cbResult()||function(){})();
	},

	onClickBtnLayerWelfareClose : function(e){
		e.preventDefault();

		this.welLayerWelfare.hide();

		(this.htOptions.cbResult||function(){})();
	}
};
