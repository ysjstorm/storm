var wearTicketMain = function(){
	this.init();
};

wearTicketMain.prototype = {
		
	init: function () {
	    this.cacheElement();
	    this.setEvent();
	    this.initSwiper();
	},
	
    cacheElement: function () {
    	
    },
    
    setEvent: function () {
    	
    },
    
    initSwiper: function () {
    	this.oDepth3Swiper = new Swiper(".depth3_w", {
    	    slidesPerView: 'auto',
    	    grabCursor: true,
    	    setWrapperSize: true    
    	});
    	this.oSwiper = new Swiper(".relation_deal .deal_lst4", {
    	    slidesPerView: 'auto',
    	    grabCursor: true,
    	    spaceBetween: 5,
    	    setWrapperSize: true    
    	});
    }
};
