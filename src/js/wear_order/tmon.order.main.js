/**
 * Wear Order 메인
 * @param sCurrentPage sCurrentPage
 * @param htURL htURL
 * @param htOptions htOptions
 */
var orderMain = function(htOptions) {
	$.extend(this, htOptions);
	this.init();
};

orderMain.prototype = {
	init: function(){
		this.initPage();
		//this.setScrollEvent();
		this.callAppLink();
		this.setHambergerEvent();
		$(window).hashchange($.proxy(TMON.commonWear.checkHashQuerystring, this));
	},

	initPage: function(){
		$('.drawer_w').show();
        TMON.commonWear.updateShoppingbagCount();
        TMON.commonWear.updateDeliveryCount(this.nDeliveryCount);

		switch (this.sCurrentPage) {
			case "/order/whereWear": // 주문
                TMON.commonWear.setTitleCallApp('text', '상품발송요청');
				this.oInvoice = new invoice();
				break;
			case "/cart/whereWear": // 쇼핑백
                TMON.commonWear.setTitleCallApp('text', '쇼핑백');
				this.oShoppingBag = new shoppingBag();
				break;
		}
	},

	/**
	 * Scroll up or Down 일때 body에 클래스 추가
	 */
	setScrollEvent : function(){
		TMON.commonWear.setClassByScrollUpDownEvent("scrollUp", "scrollDown");
	},

	/**
	 * APP에서 링크이동 일 경우 callApp 처리해준다.
	 * @returns
	 */
	callAppLink : function(){
		if(TMON.view_mode == "web"){
			return;
		}

		$("a._btnCallAppLink").click($.proxy(function(e){
			TMON.app.callApp('wear', 'closeWearWebView', e.currentTarget.href, false); // true 인경우 url을 이동시키지 않고 리플래쉬만 해줌
			return false;
		}, this));
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
