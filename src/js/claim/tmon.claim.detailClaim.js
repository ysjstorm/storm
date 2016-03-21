var claimDetailClaim = function(){
    this.init();
};

claimDetailClaim.prototype = {

    init : function(){
        this.cacheElement();
        this.setEvent();

        this._oClaimDetailButtons = new claimDetailButtons();

        // 상단 뒤로가기 누르는 경우 목록으로 이동하게 함
        TMON.sListUrl = "/m" + TMON.claim.htURL.claimList + "?view_mode=" + TMON.view_mode;
    },

    cacheElement : function(){
        this._welContent = $("#ct");
        this._welDetailWrap = $("#_detail_wrap");
        this._welBtnExtra = this._welDetailWrap.find(".__btn_extra");
        this._welExtraLayer = this._welContent.find("#_extra_layer");
        this._welBtnAskExtraLayer = this._welExtraLayer.find(".__btn_ask");
        this._welBtnCloseExtraLayer = this._welExtraLayer.find(".__btn_close");
        this.welWearDealAnchor = $('a[data-bWearDeal=true]');
    },

    setEvent : function(){
        this._welBtnExtra.on("click", $.proxy(this._onClickBtnExtra, this));
        this._welBtnAskExtraLayer.on("click", $.proxy(this._onClickBtnAskExtraLayer, this));
        this._welBtnCloseExtraLayer.on("click", $.proxy(this._onClickBtnCloseExtraLayer, this));
        this.welWearDealAnchor.on('click', $.proxy(this.checkWearDeallCallApp, this));
    },

    /**
     * 추가공제금 안내 레이어             b
     */
    _onClickBtnExtra : function(){
        this._welExtraLayer.show();
    },

    /**
     * 추가공제금 안내 레이어 닫기
     */
    _onClickBtnCloseExtraLayer : function(){
        this._welExtraLayer.hide();
    },

    /**
     * 1:1 문의 선택시 웹뷰 요청
     */
    _onClickBtnAskExtraLayer : function(we){
        TMON.claim.util.openWebView(we, "1:1문의", {
            isDelivery : false,
            isViewMode : true,
            sViewModeType : "&",
            isCloseOnly : true
        });
    },

    checkWearDeallCallApp : function(e){
        if(TMON.view_mode == 'app'){
            var sUri = $(e.currentTarget).attr('href');
            TMON.app.callApp('webview', 'goWearPage', sUri);
            return false;
        }
    }
};
