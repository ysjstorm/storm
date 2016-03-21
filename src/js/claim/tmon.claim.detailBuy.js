var claimDetailBuy = function(){
    this.init();
};

claimDetailBuy.prototype = {

    init : function(){
        this.cacheElement();
        this.setEvent();

        this._oClaimTicket = new claimTicket();
        this._oClaimDetailButtons = new claimDetailButtons();
        this._initDeliveryInfo();

        // 상단 뒤로가기 누르는 경우 목록으로 이동하게 함
        TMON.sListUrl = "/m" + TMON.claim.htURL.buyList + "?view_mode=" + TMON.view_mode + '&dealType=' + this._sDealType;
    },

    cacheElement : function(){
        this._welContent = $("#ct");
        this._welBtnFast = this._welContent.find("#_fni_banner");
        this.welDealAnchor = this._welContent.find(".cl_buy_item a[data-dealNo]");
        this._sDealType = $('#dealType').val();
        this._welBtnEanPackage = $('.__btn_hotel_pkg');
    },

    setEvent : function(){
        this._welBtnFast.on("click", $.proxy(this._onClickBtnFast, this));
        this.welDealAnchor.on("click", $.proxy(this.redirectDealDetail, this));
        this._welBtnEanPackage.on("click", $.proxy(this.gotoPackageHotelList, this));
    },

    /**
     * 빠른배송&바로환불 배너 선택시 웹뷰 요청
     */
    _onClickBtnFast : function(we){
        TMON.claim.util.openWebView(we, "빠른배송&바로환불", {
            isDelivery : true,
            isViewMode : true,
            sViewModeType : "?",
            isCloseOnly : true
        });
    },

    /**
     * 배송지정보와 우편번호 레이어 초기화
     */
    _initDeliveryInfo : function(){

        this._oCliamDeliveryInfo = new claimDeliveryInfo({
            wrapText : "#_delivery_info",
            btnEdit : ".__btn_show_add",
            textName : "#org_delivery_name",
            textPhone : "#org_delivery_phone",
            textAddress : "#org_addr",
            wrapMemo : "#org_delivery_msg_title",
            textMemo : "#org_delivery_msg",
            textNotice : ".__add_notice",
            wrapEdit : "#_delivery_info_edit",
            btnCancel : ".__btn_close_add",
            btnSave : ".__btn_save_add",
            btnZipcode : ".__btn_zipcode",
            inputName : "#pcl_name",
            selectPhoneFirst : "#pcl_phn1",
            inputPhoneSecond : "#pcl_phn2",
            inputPhoneThird : "#pcl_phn3",
            inputZipcode : "#pcl_zip1",
            inputAddressFirst : "#pcl_add1",
            inputAddressSecond : "#pcl_add2",
            wrapTextStreetAddress : "#_txt_st",
            textAddressFirst : "#_txt_add1",
            textAddressSecond : "#_txt_add2",
            textareaMemo : "#pcl_memo",
            memoCount : "#_memo_count",
            dimmed : "#dimmed2"
        });
    },

    redirectDealDetail : function(e){
        var welClickedButton = $(e.currentTarget),
            sHref = welClickedButton.attr('href'),
            sDealSrl = welClickedButton.attr('data-dealNo'),
            sUri = sHref.replace('{dealNo}', sDealSrl);
        if(TMON.view_mode == 'app'){
            TMON.app.callApp('wear', 'closeWearWebView', sUri, true);
            TMON.app.callApp('webview', 'goWearPage', sUri);
        }else{
            location.href=sUri;
        }

        return false;
    },

    /**
     * EAN Package 딜리스트 콜앱 호출
     */
    gotoPackageHotelList : function(e){
        e.preventDefault();
        var sKeyword = this._welBtnEanPackage.data("keyword"),
            htTmpParam = {
                isEanPackage : "Y"
            },
            htParam = JSON.stringify(htTmpParam);

        TMON.app.callApp('event', 'searchKeyword', sKeyword, htParam);
    }
};
