var claimRejectReason = function(){
    this.init();
};

claimRejectReason.prototype = {

    // 청구금액 수락 여부
    _isAccepted : null,

    init : function(){
        this.cacheElement();
        this.setEvent();
    },

    cacheElement : function(){
        this._welBtnBack = $("#_btnBackBtn");
        this._welRejectWrap = $("#_reject_wrap");
        this._welBtnAsk = this._welRejectWrap.find(".__btn_ask");
        this._welBtnAccept = this._welRejectWrap.find(".__btn_accept");
        this._welBtnConfirm = this._welRejectWrap.find(".__btn_confirm");
        this._welBtnConfirmReason = this._welRejectWrap.find(".__btn_confirm_reason");
        this._welBtnBack = $("#_btnBackBtn");
    },

    setEvent : function(){
        this._welBtnAsk.on("click", $.proxy(this._onClickBtnAsk, this));
        this._welBtnConfirm.on("click", $.proxy(this._onClickConfirm, this));
        this._welBtnConfirmReason.on("click", $.proxy(this._onClickConfirmReason, this));
        this._welBtnAccept.on("click", $.proxy(this._onClickBtnAccept, this));
    },

    /**
     * 1:1 문의 버튼 웹뷰 요청
     */
    _onClickBtnAsk : function(we){
        TMON.claim.util.openWebView(we, "1:1문의", {
            isDelivery : false,
            isViewMode : true,
            sViewModeType : "&",
            isCloseOnly : true
        });
    },

    /**
     * 거절사유 확인 버튼 처리
     * 앱이면 웹뷰 요청하고 웹이면 뒤로 가기
     */
    _onClickConfirmReason : function(we){
        we.preventDefault();

        if(TMON.view_mode === "app"){
            TMON.app.callApp("webview", "closeWebView", true);
        }else{
            this._welBtnBack.trigger("click");
        }
    },

    /**
     * 보류사유 확인 버튼 처리
     */
    _onClickConfirm : function(we){
        we.preventDefault();

        this._closeRejectReason();
    },

    /**
     * 앱: 레이어를 닫고 부모창을 새로고침
     * 웹: 뒤로 가기 버튼 트리거
     */
    _closeRejectReason : function(){
        if(TMON.view_mode === "app"){
            TMON.app.callApp("webview", "closeWebView", true);
        }else{
            this._welBtnBack.trigger("click");
        }
    },

    /**
     * 청구금액수락 버튼 처리
     * ajax 응답형태: "OK" | "NOK"
     */
    _onClickBtnAccept : function(we){
        var welBtn = $(we.currentTarget);
        var claimSrl = welBtn.data("claimSrl");

        if(!this._isAccepted){
            we.preventDefault();

            $.ajax({
                url : TMON.claim.htAPI.claimHoldInfoProc,
                data : {
                    claimSrl : claimSrl
                },
                success : $.proxy(this._onSuccessHoldInfoProc, this),
                error : function(){
                    alert("청구금액 수락이 정상적으로 완료되지 않았습니다. 다시 시도해주세요.");
                }
            });
        }else{
            alert("환불 처리가 완료되었습니다.");
            this._closeRejectReason();
        }
    },

    /**
     * 청구금액 수락 완료 후 처리
     * this._isAccepted를 변경
     */
    _onSuccessHoldInfoProc : function(status){
        if(status === "OK"){
            alert("환불예정금액에서 청구금액 차감 후 환불 처리되었습니다.");
            this._isAccepted = true;
            this._closeRejectReason();
        }else if(status  === "NOK" && this._isAccepted){
            alert("환불 처리가 완료되었습니다.");
            this._closeRejectReason();
        }else if(status  === "NOK" && !this._isAccepted){
            alert("청구금액 수락이 정상적으로 완료되지 않았습니다.");
        }
    }
};
