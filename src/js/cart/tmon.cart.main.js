/**
 * 카트 메인
 * @param htOptions
 */
var cartMain = function(htOptions) {
	this.init(htOptions);
};
cartMain.prototype = {
	init : function(htOptions) {
		$.extend(true, this, htOptions);
		this.initGlobalVars();
		this.cacheElement();
		this.setEvent();
		this.initPage();
	},

	initGlobalVars : function(){
		TMON.cart = TMON.cart || {};
		TMON.cart.util = new cartUtil();
		TMON.cart.htAPI = {
			getBenefit : '/api/m/cart/benefit', // 구매혜택 할인 정보 얻어오기
			getCoupon : '/api/m/cart/coupon', // 카트할인가능 정보 얻어오기
			getOption : '/api/m/cart/option/{mainDealSrl}', // 딜 옵션 정보
			getWearCount : '/api/m/cart/count/wear', // 웨어웨어 카트 갯수 정보
			modifyCart : '/api/m/cart/modify', // 카트 수정(선택, 수량조정 등)
			buyCart : '/api/m/cart/submit' // 카트 구매
		};
		TMON.cart.htURL = {
			home : this.sHost,
			recommends : this.sHost + '/',
			login : this.sLogin,
			dealDetail : this.sHost + '/deal/detailDaily/{mainDealSrl}',
			superMart : 'http://mobile.ticketmonster.co.kr',
			wwCart : this.sHostWw + '/cart/whereWear'
		};
		TMON.cart.htEtc = {
			sServerName : this.sServerName,
			sAppCookieKey : this.sAppCookieKey
		};
	},

	cacheElement : function(){
	},

	setEvent : function(){
	},

	initPage : function() {
		switch (this.sCurrentPage) {
			case '/cart':
				if (this.bIsEmptyCart) {
					this.oCartEmpty = new cartEmpty();
				} else {
					this.oCartHome = new cartHome();
					this.oCartHomeDeal = new cartHomeDeal();
				}
				break;
		}
	}
};