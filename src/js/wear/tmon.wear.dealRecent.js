/**
 * Wear Deal 상세의 연관상품 , 최근 본 상품
 */
var wearDealRecent = function(htOptions){
    $.extend(this, htOptions);
	this.init();
};

wearDealRecent.prototype = {
    MAX_RECENT_DEAL_COUNT : 9, // 최근 본 상품 몇개까지 보여줄 것인가
    COOKIE_NAME : "wearRecentDeals",

	init: function () {
		this.cacheElement();
		this.setEvent();
		this.setTemplate();
        this.addThisDealToCookie(); // 지금 상품을 최근본 상품으로 쿠키에 저장한다
		this.getRelationDeal();
        this.showRecentDeal();
        this.initSlide();
	},

	cacheElement: function () {
		this.welRelatedDeal = $('#_anotherDealList'); //연관상품 영역
		this.welRelatedDealPaginate = $('#_anotherDealPaginate'); //연관상품 상단 탭영역

		this.welRelationDealGroup = $('#_relationDealGroup'); //연관상품 영역 딜그룹 wrapper
		this.welRecentViewDealGroup = $('#_recentViewDealGroup'); //최근 본 상품 딜그룹 wrapper
	},

	setEvent: function () {
        $(window).resize($.proxy(this.resizeAnotherDealGroup, this));
	},

	setTemplate: function () {
        this.tplDeallist3 = Handlebars.compile($("#deallist3Template").html()); //연관상품 영역 딜그룹 템플릿
		this.tplDeallist3EmptyMessage = Handlebars.compile($("#deallist3EmptyMessageTemplate").html()); //연관상품 영역 딜그룹 비었을 때 템플릿
	},

	initSlide : function(){
		// 연관상품 Slide Init
		var welRelatedDealPaginate = this.welRelatedDealPaginate;
		this.welRelatedDeal.tmonSlider({
			roll : false,
			flexible : true,
			counter : function (e){
				welRelatedDealPaginate.find('li').removeClass('on');
				welRelatedDealPaginate.find('[data-page='+e.current+']').addClass('on');
			},
			btn_prev : welRelatedDealPaginate.find('#_btRelationDeal'),
			btn_next : welRelatedDealPaginate.find('#_btRecentDeal')
		});
	},

	/**
	 * 연관상품 딜목록을 가져온다.
	 */
	getRelationDeal : function (){
		$.ajax({
			url: TMON.wear.htAPI.getRelationDeal.replace('{dealNo}',this.htDealDetail.sDealNo),
			data: {
				'size':6
			},
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
			success: $.proxy(function(res){
                this.renderDealGroup(res.data, "relation");
            }, this),
			error: function (jqXHR, textStatus) {
				if (textStatus == "abort") {
					return;
				}
				alert("일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
				return;
			}
		});
	},

    /**
     * 최근본상품 딜목록을 가져온다.
     */
    getRecentDealFromCookie : function(){
        return JSON.parse(TMON.util.getCookie(this.COOKIE_NAME)) || [];
    },

	/**
	 * 연관상품, 최근본상품 딜그룹을 렌더링한다.
	 * @param res
	 * @param sDealType "relation", "recent"
	 */
	renderDealGroup : function(aItems, sDealType){
        if(sDealType == 'relation'){
            var sEmptyMessage = '연관';
            var welDealGroup = $(this.welRelationDealGroup);
        }else if(sDealType == 'recent'){

            var sEmptyMessage = '최근 본';
            var welDealGroup = $(this.welRecentViewDealGroup);
        }

        if (!aItems || aItems.length == 0){
            var sHtml = this.tplDeallist3EmptyMessage({'prefixMessage':sEmptyMessage});
        }else{
            var htData = {
                aItems : aItems,
                htUri : this.htUri,
                sAppQuery : this.htConnectEnvironment.sAppQueryQ,
                nHurryCnt : this.nHurryCnt
            };
            var sHtml = this.tplDeallist3(htData);
        }

        welDealGroup.html(sHtml);
        this.resizeAnotherDealGroup();
	},

    /**
     * 현재 상품을 최근 본 상품 쿠키에 저장한다.
     */
    addThisDealToCookie : function(){
        var htThisDeal = {
                dealNo : this.htDealDetail.sDealNo,
                restCnt : this.htDealDetail.nRestCnt,
                isSoldOut : this.htDealDetail.bSoldOut,
                imageUrl : this.htDealDetail.sDealImageUrl,
                //dealTitle : this.htDealDetail.sDealTitle,
                wearType : this.htDealDetail.sWearType,
                wearPricing : {
                    price : this.htDealDetail.price
                }
            };

        this.aRecentDeal = this.getRecentDealFromCookie();
        //console.log(this.aRecentDeal[0]);
        var bFound = false;
        for(var i= 0, max=this.aRecentDeal.length; i<max ; i++){
            if(this.aRecentDeal[i].dealNo == htThisDeal.dealNo){ // 이미 있는 딜일경우 맨 앞으로 넣어준다.
                this.aRecentDeal.unshift(this.aRecentDeal.splice(i,1)[0]);
                //console.log(i);
                bFound = true;
                break;
            }
        }
        //console.log("bFound", bFound);

        if(bFound == false){
            this.aRecentDeal.unshift(htThisDeal);
        }

        //console.log(this.aRecentDeal[0]);

        // 현재 보고 있는 딜과 같은 딜이 있을 경우를 포함하여 9 + 1개로 잘라준다.
        if(this.aRecentDeal.length > this.MAX_RECENT_DEAL_COUNT+1){
            this.aRecentDeal = this.aRecentDeal.slice(0, this.MAX_RECENT_DEAL_COUNT+1);
        }

        //console.log(JSON.stringify(this.aRecentDeal));
        window.sText =JSON.stringify(this.aRecentDeal);
        TMON.util.setCookie(this.COOKIE_NAME, JSON.stringify(this.aRecentDeal), {path : '/', expires : 7});
    },

    showRecentDeal : function(){
        if(this.aRecentDeal[0].dealNo == this.htDealDetail.sDealNo){ // 현재 보고 있는 딜과 같은 상품의 경우 최근 본 상품에 보여주지 않는다.
            this.aRecentDeal.shift();
        }

        this.renderDealGroup(this.aRecentDeal.slice(0, this.MAX_RECENT_DEAL_COUNT), "recent");
    },

    /**
     * 연관상품 딜그룹 영역의 height 를 조정한다. 연관상품이 로딩되었을 때 한번, 최근본상품이 로딩되었을 때 한번 총 두 번 호출하며, 새로 로딩이 완료된 영역의 height 현재 height보다 높을 경우 업데이트한다.
     * @param nNewHeight
     */
    resizeAnotherDealGroup : function () {
        var welRelatedDeal = $(this.welRelatedDeal);
        var welRelationDealGroup = $(this.welRelationDealGroup);
        var welRecentViewDealGroup = $(this.welRecentViewDealGroup);
        var nBottomPadding = 110;
        var nOriginalHeight = welRelatedDeal.height()-nBottomPadding;
        var nRelationHeight = welRelationDealGroup.closest('.deal_lst3').outerHeight();
        var nRecentHeight = welRecentViewDealGroup.closest('.deal_lst3').outerHeight();

        if (nRecentHeight <= nRelationHeight){
            nOriginalHeight = nRelationHeight;
        }else{
            nOriginalHeight = nRecentHeight;
        }

        welRelatedDeal.height(nOriginalHeight+nBottomPadding);
    }

};