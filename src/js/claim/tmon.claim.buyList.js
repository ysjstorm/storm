var claimBuyList = function(){
    this.init();
};

claimBuyList.prototype = {

    sStorageEventKey : "__claim_list_reload",

    init : function(){
        this.cacheElement();
        this.setEvent();
        this.setStorageEvent();

        this._oClaimRefundAccount = new claimRefundAccount();
        this._oClaimListLoad = new claimListLoad(TMON.claim.htAPI.getBuyList, false, this._sDealType);

        // 모바일웹 목록에서 헤더 뒤로가기 클릭시 마이티몬으로 이동하게 함
        TMON.sListUrl = TMON.claim.htURL.my_m;

        // 웹뷰에서 상세내역 이동 후에 목록으로 돌아왔을 때 새로고침되지 않게 함
         TMON.app.callApp("mytmon", "mytmonLoaded", true);
    },

    cacheElement : function(){
        this._welWindow = $(window);
        this._sDealType = ($('.my_his_nav').data('sel') || '').trim();
        this._welBuyList = $("#_buyList");
        this._welBtnFast = this._welBuyList.find("#_fni_banner");
    },

    setEvent : function(){
        this._welBuyList.on("click", ".__link_detail_all, .__link_detail_deal", $.proxy(this._onClickDetail, this));
        this._welBtnFast.on("click", $.proxy(this._onClickBtnFast, this));
    },

    /**
     * 개별 상품 선택시 웹뷰 요청
     * EAN딜은 PHP 상세 이동
     */
    _onClickDetail : function(we){
        var welDeal = $(we.currentTarget);
        var sHref = welDeal.attr("href");
        var bIsEAN = /\beanDetailBuy\b/g.test(sHref);

        TMON.claim.util.openWebView(we, "상세정보", {
            sDealType : this._sDealType,
            isDelivery : !bIsEAN,
            isViewMode : true,
            sViewModeType : bIsEAN ? "&" : "?", // EAN 딜이면 &
            isVersion : bIsEAN
        });
    },

    /**
     * 빠른배송&바로환불 배너 선택시 웹뷰 요청
     */
    _onClickBtnFast : function(we){
        TMON.claim.util.openWebView(we, "빠른배송&바로환불", {
            sDealType : this._sDealType,
            isDelivery : true,
            isViewMode : true,
            sViewModeType : "?",
            isCloseOnly : true
        });
    },

    /**
     * localStorage에 값을 부여하고 목록을 새로고침해야 할 때
     * TMON.claim.util.refreshList(); 를 사용해서 값을 true로 변경하면
     * storage 이벤트가 trigger되어 목록이 새로고침되고 값은 false로 돌아간다
     */
    setStorageEvent : function(){
        if(TMON.view_mode === "app"){
            localStorage.setItem(this.sStorageEventKey, "false");
            this._welWindow.on("storage", $.proxy(this.reloadPage, this));
        }

        // iOS webview에서 storage event가 작동하지 않아서 setInterval로 대체함
        if(TMON.app_os === "ios"){
            this.storageInterval = setInterval($.proxy(this.reloadPageOniOS, this), 500);
        }
    },

    reloadPage : function(we){
        var bIsListReload = we.originalEvent.key === this.sStorageEventKey;

        if(bIsListReload){
            window.location.reload();
        }
    },

    reloadPageOniOS : function(){
        var bIsListReload = localStorage.getItem(this.sStorageEventKey) === "true";

        if(bIsListReload){
            clearInterval(this.storageInterval);
            window.location.reload();
        }
    }
};
