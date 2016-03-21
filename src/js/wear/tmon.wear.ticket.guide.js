var wearTicketGuide = function(htOptions){
	$.extend(this, htOptions);
	this.init(htOptions);
};

wearTicketGuide.prototype = {

	init: function() {
		this.cacheElement();
		this.setEvent();
	},

	cacheElement: function(){
		this.welTicket3BuyButton = $("#_ticketBuy");

	},

	setEvent: function() {
		this.welTicket3BuyButton.click($.proxy(this.goBuyTicket3Page, this));
	},

	goBuyTicket3Page : function (e){
		if (TMON.view_mode == 'app'){
			var welClickedButton = $(e.currentTarget);
			var sUrl = welClickedButton.attr('data-callapp-uri');
			TMON.app.callApp('cart','goBuy',sUrl);
			return false;
		}
		
		if($(e.currentTarget).data("hasTicket")){
			alert("이미 구매하신 티켓이 있습니다. 발송처리 후 다시 구매해 주세요.");
			
			return false;
		}
	}
};