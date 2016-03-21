/**
 * 카트 홈
 * @param htOptions
 */
var cartHome = function(htOptions) {
	this.init(htOptions);
};
cartHome.prototype = {
	init : function(htOptions){
		$.extend(true, this, htOptions);
		this.cacheElement();
		this.setEvent();
		this.initPage();
	},

	cacheElement : function(){
		this.welBtnDealGroupToggle = $('section.ct_prod_wp .bt_toggle button'); // 그룹영역 토글
		this.welBtnClose = $('section.ct_prod_wp.ct_total .bt_continue'); // 쇼핑계속하기
		this.welBtnGoSuperMart = $('.bnr_mart a'); // 슈퍼마트 이동

		this.welWwCart = $('section.bnr_where'); // 웨어웨어 카트 영역
		this.welWwCartCount = this.welWwCart.find('.cnt'); // 웨어웨어 카트 카운트
		this.welBtnGoWwCart = this.welWwCart.find('a'); // 웨어웨어 카트 이동
	},

	setEvent : function(){
		this.welBtnDealGroupToggle.on('click', $.proxy(this.onClickBtnDealGroupToggle, this));
		this.welBtnClose.on('click', $.proxy(this.onClickBtnClose, this));
		this.welBtnGoSuperMart.on('click', $.proxy(this.onClickBtnGoSuperMart, this));
		this.welBtnGoWwCart.on('click', $.proxy(this.onClickBtnGoWwCart, this));
	},

	initPage : function(){
		this.setWWCartCountInfo(); // 웨어웨어 카운트 정보
	},

	setWWCartCountInfo : function(){
		$.ajax({
			type : 'GET',
			url : TMON.cart.htAPI.getWearCount,
			dataType : 'json',
			contentType : 'application/json; charset=UTF-8',
			success : $.proxy(function(res){
				var nCount = -1;
				if (res && res.data) {
					nCount = res.data.total; // generalCount, ticketCount, count, total
					this.welWwCartCount.html(nCount);
				}
				if (nCount > 0) {
					this.welWwCart.css({display : 'flex'}); // 보여지기 위해 display:flex 사용
				} else {
					this.welWwCart.hide();
				}
			}, this),
			error : $.proxy(function(res){
				console.log(res);
				//if (res.responseJSON.data.errorCode || res.responseJSON.data.errorMessage) {
				//	this.handleException(res.responseJSON.data.errorCode, res.responseJSON.data.errorMessage, res.responseJSON.data.errorInfo);
				//}
			}, this)
		});
	},

	onClickBtnDealGroupToggle : function(e){
		e.preventDefault();
		$(e.currentTarget).closest('.ct_prod_wp').toggleClass('close');
	},

	onClickBtnClose : function(e){
		e.preventDefault();
		if (TMON.view_mode === 'app') {
			TMON.app.callApp('cart', 'resumeShopping');
		} else {
			var sPageRef = document.referrer;
			if (!sPageRef) {
				TMON.cart.util.loadView(TMON.cart.htURL.home);
			} else {
				var nPageIdx = document.location.href.indexOf('?');
				var sPage = (nPageIdx > 0) ? document.location.href.substring(0, nPageIdx - 1) : document.location.href;
				if (sPageRef === sPage) {
					TMON.cart.util.loadView(TMON.cart.htURL.home);
				} else {
					history.back();
				}
			}
		}
	},

	onClickBtnGoSuperMart : function(e){
		e.preventDefault();
		if (TMON.view_mode === 'app') {
			TMON.app.callApp('cart', 'goMart');
		} else {
			TMON.cart.util.loadView(TMON.cart.htURL.superMart);
		}
	},

	onClickBtnGoWwCart : function(e){
		e.preventDefault();
		if (TMON.view_mode === 'app') {
			TMON.app.callApp('cart', 'goWearCart');
		} else {
			TMON.cart.util.loadView(TMON.cart.htURL.wwCart);
		}
	}
};