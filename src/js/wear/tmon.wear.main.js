/**
 * Wear 메인
 * @param sCurrentPage sCurrentPage
 * @param htURL htURL
 * @param htOptions htOptions
 */
var wearMain = function(htOptions) {
	$.extend(this, htOptions);
	this.htOptions = htOptions;
	this.init();
};

wearMain.prototype = {
	init: function(){
		this.cacheElement();
		this.setEvent();
		this.initPage();
		this.setScrollEvent();
		this.setModalLinkEvent();
		this.setHambergerEvent();
		this.setFixedHeader();
		this.moveWearSns();
		$(window).hashchange($.proxy(TMON.commonWear.checkHashQuerystring, this));
	},
	
	cacheElement : function(){
		this.welFooter = $('.footer_w');
		this.welWearSns = $('.wear_sns');
	},
	
	setEvent : function(){
		$('body').on('click', '._extLink', $.proxy(this.externalCallApp, this));
		$('body').on('click', '#_footer_partner', $.proxy(function(){
			if(TMON.view_mode == 'app'){
				TMON.commonWear.setTitleCallApp('wearimage', '');
				TMON.app.callApp('wear','setViewStyle','deal');
			}
		}, this));
	},
	
	externalCallApp : function(e){
		if(TMON.view_mode == 'app'){
			var welClickedAnchor = $(e.currentTarget);
			TMON.app.callApp('event', 'outLink', welClickedAnchor.attr('href'));
			return false;
		}
	},

	initPage: function(){
		$('.drawer_w').show();
		TMON.commonWear.updateShoppingbagCount();
        TMON.commonWear.updateDeliveryCount(this.htOptions.nDeliveryCount);

		switch (this.sCurrentPage) {
			case this.htViewName.home:
				TMON.commonWear.setTitleCallApp('wearimage', '');
				TMON.app.callApp('wear','setViewStyle','default');
				this.oHomeMain = new wearHome(this.htOptions);
				break;
			case this.htViewName.mainCollection:
				TMON.commonWear.setTitleCallApp('wearimage', '');
				TMON.app.callApp('wear','setViewStyle','default');
				this.oMainCollection = new wearMainCollection(this.htOptions);
				break;
			case this.htViewName.ticketIntro:
				TMON.commonWear.setTitleCallApp('text', 'TICKET '+this.htOptions.nTicketNo);
				TMON.app.callApp('wear','setViewStyle','default');
				this.oTicketIntro = new wearTicketIntro(this.htOptions);
				break;
			case this.htViewName.ticketMain:
				TMON.commonWear.setTitleCallApp('text', 'TICKET '+this.htOptions.nTicketNo);
				TMON.app.callApp('wear','setViewStyle','default');
				this.oTicketMain = new wearTicketMain(this.htOptions);
				break;
			case this.htViewName.ticketList:
				TMON.commonWear.setTitleCallApp('text', 'TICKET '+this.htOptions.nTicketNo);
				TMON.app.callApp('wear','setViewStyle','list');
				this.oTicketList = new wearDealList(this.htOptions);
				break;
			case this.htViewName.ticketGuide:
				TMON.commonWear.setTitleCallApp('text', 'TICKET '+this.htOptions.nTicketNo);
				TMON.app.callApp('wear','setViewStyle','default');
				this.oTicketGuide = new wearTicketGuide(this.htOptions);
				break;
			case this.htViewName.deal:
				TMON.commonWear.setTitleCallApp('text', '상품 상세');
				TMON.app.callApp('wear','setViewStyle','deal');
				this.oDeal = new wearDeal(this.htOptions);
				break;
			case this.htViewName.inquiry:
				TMON.commonWear.setTitleCallApp('text', '상품 문의');
				TMON.app.callApp('wear','setViewStyle','deal');
				this.oInquiry = new wearInquiry(this.htOptions);
				break;
			case this.htViewName.refundInfo:
				TMON.commonWear.setTitleCallApp('text', '환불/교환 안내');
				TMON.app.callApp('wear','setViewStyle','deal');
				break;
			case this.htViewName.categoryList:
				TMON.commonWear.setTitleCallApp('category', this.htOptions.n3depthCategoryNo);
				TMON.app.callApp('wear','setViewStyle','list');
				this.oCategoryList = new wearDealList(this.htOptions);
				break;
			case this.htViewName.brandMain:
				TMON.commonWear.setTitleCallApp('text', this.sHeaderTitle);
				TMON.app.callApp('wear','setViewStyle','default');
				break;
			case this.htViewName.brandList:
				TMON.commonWear.setTitleCallApp('text', this.sHeaderTitle);
				TMON.app.callApp('wear','setViewStyle','list');
				this.oBrandList = new wearDealList(this.htOptions);
				break;
            case this.htViewName.promotionInterview:
                TMON.commonWear.setTitleCallApp('wearimage', '');
                TMON.app.callApp('wear','setViewStyle','deal');
                this.oPromotion = new wearPromotion(this.htOptions);
                break;

		}
	},

	/**
	 * Scroll up or Down 일때 body에 클래스 추가
	 */
	setScrollEvent : function(){
		TMON.commonWear.setClassByScrollUpDownEvent("scrollUp", "scrollDown");
	},

	setModalLinkEvent : function(){
		$('a[data-role=_modal]').on('click',function(){
			if(TMON.view_mode == 'app'){
				var sUrl = $(this).attr('href');
                sUrl = TMON.util.aup(sUrl, TMON.sAppQuery);
				TMON.app.callApp('wear', 'showEventView', sUrl);
				return false;
			}

		});
	},

	setHambergerEvent : function(){
		$('#_toggleShowDrawer').on('change',function(){
			if($(this).is(':checked') == true){

				TMON.commonWear.layerOpen();
			}else{
				TMON.wear.oHashbang.setState("",{"layer":"close"});
			}
		});
	},
	
	/**
	* 모바일 웹에서 스크롤시 상단 depth 메뉴 고정 플러그인
	*/
	setFixedHeader : function(){
		window.oHeader = new headerControl();
	},
	
	moveWearSns : function(){
		var welFooter = $(this.welFooter);
		var welWearSns = $(this.welWearSns);
		
		if(welWearSns.size() > 0){
			welWearSns.prependTo(welFooter);
		}
	}

};