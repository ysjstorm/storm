/**
 * 쇼핑팩 메인페이지
 * @constructor
 */
var shoppingBag = function(){
	this.init();
};

shoppingBag.prototype = {
	init: function() {
        this.oCommonItem = new shoppingBagCommonItem();
        //this.oTicketItem = new shoppingBagTicketItem(); 티켓3 막아둠
		this.cacheElement();
		this.setEvent();
	},

	cacheElement: function() {
        this.welWin = $(window);

        this.welCommonItemHeader = $("#_commonItemHeader"); // 일반 상품 헤더
        this.nCommonItemHeaderTop = this.welCommonItemHeader.offset().top; // 포지션 fix를 하기위해 top값을 캐쉬한다.
        this.welCommonItemList = $("#_commonItemList"); // 일반 상품 리스트

        //this.welTicketItemHeader = $("#_ticketItemHeader"); // 티켓 상품 헤더
        //this.nTicketItemHeaderTop = this.welTicketItemHeader.offset().top; // 포지션 fix를 하기위해 top값을 캐쉬한다.
        //this.welTicketItemHeaderInfo = $("#extra"); // 티켓 상품 헤더 추가 정보
        //this.welTicketItemList = $("#_ticketItemList"); // 티켓 상품 리스트
        //this.welTicketItemFixHeader = $("#_ticketItemFixHeader"); // 티켓 상품 헤더와 헤더추가정보 둘다 fix하기 div를 한번더 감쌌다.
	},

	setEvent: function(){
        this.welCommonItemHeader.click($.proxy(this.onClickCommonItemHeader, this));
        //this.welTicketItemHeader.click($.proxy(this.onClickTicketItemHeader, this));
        this.welWin.scroll($.proxy(this.onScroll, this));
	},

    /**
     * position fix가 되는 헤더의 자리를 차지하고 있게 만들기 위해 감싸고 있는 DIV에 height를 넣어준다.
     */
    setFixWrapperHeight : function(welHeader){
        welHeader.parents("._fixWrap:first").css("height", welHeader.height() + 1);// border bottom 1px 때문에 1px를 더해준다.
    },

    setUnfixWrapperHeight : function(welHeader){
        if(welHeader.hasClass("fix_header") == false){
            welHeader.parents("._fixWrap:first").css("height", "auto");
        }
    },

    onClickCommonItemHeader : function(){
        if(this.welCommonItemHeader.hasClass("on")){ // 이미 보여지고 있을 경우 숨겨준다.
            this.hideCommonItemList();
        }else{
            //this.hideTicketItemList();
            this.showCommonItemList();
        }
    },

    onClickTicketItemHeader : function(){
        if(this.welTicketItemHeader.hasClass("on")){ // 이미 보여지고 있을 경우 숨겨준다.
            this.hideTicketItemList();
        }else{
            this.hideCommonItemList();
            this.showTicketItemList();
        }
    },

    hideCommonItemList : function(){
        this.welCommonItemHeader.removeClass("on");
        this.welCommonItemList.hide();
    },

    showCommonItemList : function(){
        this.welCommonItemHeader.addClass("on");
        this.welCommonItemList.show();
        this.onScroll();
    },

    hideTicketItemList : function(){
        this.welTicketItemHeader.removeClass("on");
        this.welTicketItemFixHeader.removeClass("on");
        this.welTicketItemHeaderInfo.hide();
        this.welTicketItemList.hide();
    },

    showTicketItemList : function(){
        this.welTicketItemHeader.addClass("on");
        this.welTicketItemFixHeader.addClass("on");
        this.welTicketItemHeaderInfo.show();
        this.welTicketItemList.show();
        this.onScroll();
    },

    onScroll : function(){
        this.fixHeader(this.welCommonItemHeader, this.nCommonItemHeaderTop);
        //this.fixHeader(this.welTicketItemFixHeader, this.nTicketItemHeaderTop);
    },

    fixHeader : function(welHeader, nHeaderTop){
        var nScrollTop = this.welWin.scrollTop();

        if(nScrollTop < nHeaderTop || !welHeader.hasClass("on")){
            this.unfixHeader(welHeader);
            this.setUnfixWrapperHeight(welHeader);
            return;
        }

        if(welHeader.hasClass("on")){
            this.setFixWrapperHeight(welHeader);
            welHeader.addClass("fix_header");
        }
    },

    unfixHeader : function(welHeader){
        welHeader.removeClass("fix_header");
    }
};