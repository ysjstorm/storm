/**
 * 딜리스트를 가져오고 뿌려준다.
 * html 렌더링을 java에서 하고 HTML스트링을 가져온다.
 */

var martDealList = function(oMart){
    this.init(oMart);
};

martDealList.prototype = {
    DEFAULT_LIST_COUNT : 50, // 한번에 불러오는 딜 개수
    nCurrentLoadingCategoryIndex : 0, // 현재 로드한 카테고리넘버 인덱스
    bFirstRun : true,

    init : function(oMart){
        this.oMart = oMart;
        this.cacheElement();
        this.setEvent();
    },

    cacheElement : function(){
        this.welWin = $(window);
        this.wfnScroll = $.proxy(this.onScroll, this);
        this.welContainer = $("#_listContainer");
        this.welLoading = $("#_dealListLoading");
        this.welEmpty = $("#_dealEmpty").clone(); // 딜이 없을경우 보여주는 레이어, 딜이 있을때 container안에 내용이 다 지워지기 때문에 clone해서 사용한다.
        this.welBanner = $("#_bannerArea");
        this.welTimeout = $("#_dealTimeOut");
    },

    setEvent : function(){
        this.welTimeout.find("a").click($.proxy(this.onClickTryAgain, this));
    },

    bindScroll : function(){
        this.welWin.bind("scroll", this.wfnScroll);
    },

    unbindScroll : function(){
        this.welWin.unbind("scroll", this.wfnScroll);
    },

    /**
     * 해당 카테고리에 해당하는 모든 딜 번호를 가져와서 저장하고 있는다.
     * @param sCategoryNo
     */
    getDealNumber : function(sCategoryNo){
        this.oAjaxGetDealNumber && this.oAjaxGetDealNumber.abort();
        this.oAjaxGetDealInfo && this.oAjaxGetDealInfo.abort();

        this.welContainer.html("");
        this.showLoading();

        /**
         * api 최초 호출시 "dealOnTop" 파라미터가 있으면 해당 값을 넘긴다.
         */
        var sDealOnTop = "";
        if(this.bFirstRun){
            sDealOnTop = TMON.util.gup("dealOnTop") ? TMON.util.gup("dealOnTop") : "";
            this.bFirstRun = false;
        }

        this.oAjaxGetDealNumber = $.ajax({
            url : TMON.htAPI.htMart.getDealNo,
            data : {
                catNo : sCategoryNo,
                dealOnTop : sDealOnTop
            },
            success : $.proxy(this.cbGetDealNumber, this),
            error : $.proxy(function(jqXHR, textStatus){
                if(textStatus == "abort"){
                    return;
                }
                this.showTimeOut({
                    type : "getDealNo",
                    sCategoryNo : sCategoryNo
                });
            }, this)
        });
    },

    cbGetDealNumber : function(res){
        this.aDealNumber = res.data;
        this.nCurrentLoadingCategoryIndex = this.DEFAULT_LIST_COUNT;
        if(!this.aDealNumber || !this.aDealNumber.length){
            this.hideLoading();
            this.welEmpty.clone().appendTo(this.welContainer).show();
            return;
        }
        this.getDealInfo(this.aDealNumber.slice(0, this.DEFAULT_LIST_COUNT));
    },

    /**
     * 딜 넘버를 넘기면 해당하는 딜의 HTML을 가져온다.
     * @param aDealNo
     */
    getDealInfo : function(aDealNo){
        this.showLoading();
        this.unbindScroll();

        this.oAjaxGetDealInfo = $.ajax({
            url : TMON.htAPI.htMart.getDealInfo,
            data :{
                dealNoList : aDealNo.join(","),
                tlArea : this.welContainer.attr("data-tlarea"),
                tlCartArea : this.welContainer.attr("data-tlcartarea"),
                tlStartOrder : this.nCurrentLoadingCategoryIndex - this.DEFAULT_LIST_COUNT + 1
            },
            success : $.proxy(this.cbDealInfo, this),
            error : $.proxy(function(jqXHR, textStatus){
                if(textStatus == "abort"){
                    return;
                }
                this.showTimeOut({
                    type : "getDealInfo",
                    aDealNo : aDealNo
                });
            }, this)
        });
    },

    cbDealInfo : function(res){
        this.oAjaxGetDealInfo = null;
        this.welContainer.append(res.data);
        this.hideLoading();
        this.welLast = this.welContainer.find("li").last();
        this.nLastItemTop = this.welLast.length ? this.welLast.position().top : 0; // 로딩 위치 계산을 위해 마지막 딜아이템의 top 위치를 캐쉬한다.
        this.nLastItemHeight = this.welLast.length ? this.welLast.height() : 0; // 로딩 위치 계산을 위해 마지막 딜아이템의 height를 캐쉬한다.
        if(this.nCurrentLoadingCategoryIndex < this.aDealNumber.length){
            this.bindScroll();
            this.onScroll();
        }
        this.oMart.onLoadDealListComplete();
    },

    /**
     * 다음 딜 리스트를 가져온다.
     */
    loadNextDealList : function(){
        // 마지막 아이템까지 로딩 완료 했는지?
        this.getDealInfo(this.aDealNumber.slice(this.nCurrentLoadingCategoryIndex, this.nCurrentLoadingCategoryIndex + this.DEFAULT_LIST_COUNT));
        this.nCurrentLoadingCategoryIndex += this.DEFAULT_LIST_COUNT;
    },

    showLoading : function(){
        this.welLoading.show();
    },

    hideLoading : function(){
        this.welLoading.fadeOut("fast");
    },

    onScroll : function(){
        if(!this.nLastItemTop){
            return;
        }

        // 스크롤중 마지막 아이템의 위치가 마지막 아이템의 높이의 3배 정도 만큼 남을 정도로 스크롤이 되었을때 다음 딜리스트를 로드한다.
        if(this.welWin.scrollTop() + this.welWin.height() > this.nLastItemTop - (this.nLastItemHeight * 3)){
            this.nLastItemTop = 0;
            this.loadNextDealList();
        }
    },

    /**
     * 생활, 식품, 육아 페이지(= 카테고리 페이지)에서 사용하는 베너 로딩 코드.
     * @param sCategoryNo
     */
    loadBanner : function(sCategoryNo){
        this.oAjaxGetBanner && this.oAjaxGetBanner.abort();
        this.welBanner.hide();
        this.oAjaxGetBanner = $.ajax({
            url : TMON.htAPI.htMart.getCategoryBannerList,
            data :{
                catNo : sCategoryNo
            },
            success : $.proxy(this.cbLoadBanner, this),
            error : function(jqXHR, textStatus){
                return;
            }
        });
    },

    cbLoadBanner : function(res){
        if(!res.data){
            return;
        }
        this.welBanner.html(res.data).show();
        this.rollBanner();
    },

    rollBanner : function(){
        var bRoll = this.welBanner.find("li").length > 1 ? true : false;

        this.welBanner.find("#_martBanner").tmonSlider(
            {
                flexible : true,
                roll : bRoll,
                view : 1,
                speed : 300,
                autoPaging : true,
                counter : function(e){}
            });
    },

    /**
     * 타임아웃후에 다시시도하기 버튼을 눌렀을때 처리
     * @returns {boolean}
     */
    onClickTryAgain : function(){
        switch(this.htTimeoutData.type){
            case "getDealNo" :
                this.getDealNumber(this.htTimeoutData.sCategoryNo);
                break;
            case "getDealInfo" :
                this.getDealInfo(this.htTimeoutData.aDealNo);
                break;
            default :
                break;
        }

        this.welTimeout.hide(); // 시간 초과 레이어를 숨긴다.
        return false;
    },

    /**
     * 시간초과시 "판매중이 상품이 없습니다. 다시시도하기"를 보여준다.
     * @param htData
     */
    showTimeOut : function(htData){
        this.htTimeoutData = htData;
        this.hideLoading();
        this.welTimeout.show();
    }

};
