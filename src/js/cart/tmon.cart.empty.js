/**
 * 카트 공카트
 * @param htOptions
 */
var cartEmpty = function(htOptions) {
	this.init(htOptions);
};
cartEmpty.prototype = {
	init : function(htOptions) {
		$.extend(true, this, htOptions);
		this.cacheElement();
		this.setEvent();
	},

	cacheElement : function(){
		this.welBtnSubmit = $('.bt_submit');
	},

	setEvent : function(){
		this.welBtnSubmit.on('click', $.proxy(this.onClickBtnSubmit, this));
	},

	onClickBtnSubmit : function(e){
		var sType = $(e.currentTarget).data('type');
		switch (sType) {
			case 'recommends':
				// 추천상품 보러가기
				if (TMON.view_mode === 'app') {
					TMON.app.callApp('cart', 'goHome');
				} else {
					window.location.href = TMON.cart.htURL.recommends;
				}
				break;
			case 'login':
				// 로그인하기
				if (TMON.view_mode === 'app') {
					TMON.app.callApp('cart', 'login');
				} else {
					window.location.href = TMON.cart.htURL.login + encodeURIComponent(window.location.href);
				}
				break;
		}
	}
};