/**
*	Create by 20150302 js.ordinary.
*/

var benefitToggle = function(){
	this.init();
};

benefitToggle.prototype = {
	init : function(){
		this.cacheElement();
		this.setEvent();
	},
	
	cacheElement : function(){
		this.welInfo = $('.attn');
		this.elToggleContain = this.welInfo.find('.lst_notice');
	},
	
	setEvent : function(){
		this.welInfo.on('click', '.btn_toggle', $.proxy(this.onTouchEvent, this));
	},
	
	onTouchEvent : function(e){
		e.preventDefault();
		var target = $(e.currentTarget);
		
		target.toggleClass('on');
		this.elToggleContain.slideToggle(200);
	}
};