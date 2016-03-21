var wearHome = function(){
	this.init();
};

wearHome.prototype = {
		
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
		this.oSwiper = new Swiper(".home_slider_area", {
			pagination: '.swiper-pagination',
			paginationClickable: true,
			autoplay: 4000,
			autoplayDisableOnInteraction: false,
			loop: true
		});
	}
};
