var claimFastDelivery = function(){
    this.init();
};

claimFastDelivery.prototype = {

    init : function(){
        this.cacheElement();
        this.setEvent();
    },

    cacheElement : function(){
        this._welWrap = $("#_fni_wrap");
        this._welNavigationTab = this._welWrap.find("#_fni_nav a");
        this._welNavigationTabDelivery = $(this._welNavigationTab[0]);
        this._welNavigationTabRefund = $(this._welNavigationTab[1]);
        this._welContentDelivery = this._welWrap.find("#_fni_delivery");
        this._welContentRefund = this._welWrap.find("#_fni_refund");
        this._welBtnFaq = this._welWrap.find(".__btn_faq");
        this._welBtnAsk = this._welWrap.find(".__btn_ask");
    },

    setEvent : function(){
        this._welNavigationTabDelivery.on("click", $.proxy(this._onClickNavigationTab, this));
        this._welNavigationTabRefund.on("click", $.proxy(this._onClickNavigationTab, this));
        this._welBtnFaq.on("click", $.proxy(this._onClickBtnFaq, this));
        this._welBtnAsk.on("click", $.proxy(this._onClickBtnAsk, this));
    },

    /**
     * 탭간 이동
     */
    _onClickNavigationTab : function(we){
        var welTab = $(we.currentTarget);
        var nIndex = welTab.index(this._welNavigation);

        welTab.addClass("on");

        if(nIndex === 0){
            this._welNavigationTabRefund.removeClass("on");
            this._welContentDelivery.show();
            this._welContentRefund.hide();
        }else{
            this._welNavigationTabDelivery.removeClass("on");
            this._welContentDelivery.hide();
            this._welContentRefund.show();
        }
    },

    _onClickBtnFaq : function(we){
        TMON.claim.util.openWebView(we, "자주묻는질문", {
            isDelivery : false,
            isViewMode : true,
            sViewModeType : "&",
            isCloseOnly : true
        });
    },

    _onClickBtnAsk : function(we){
        TMON.claim.util.openWebView(we, "1:1문의", {
            isDelivery : false,
            isViewMode : true,
            sViewModeType : "&",
            isCloseOnly : true
        });
    }
};
