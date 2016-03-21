var claimDetailButtons = function(){
    this.init();
};

claimDetailButtons.prototype = {

    init : function(){
        this.cacheElement();
        this.setEvent();

        this._assignWebview();
    },

    cacheElement : function(){
        this._welBody = $("body");
        this._welContent = $("#ct");
        this._welDetailWrap = $("#_detail_wrap");
        this._welBtnCancelRefund = this._welDetailWrap.find(".__btn_cancel_refund");
        this._welBtnCancelReturn = this._welDetailWrap.find(".__btn_cancel_return");
        this._welBtnRejectInfo = this._welDetailWrap.find(".__btn_reject_info");
        this._welBtnReturnInfo = this._welDetailWrap.find(".__btn_return_info");
        this._welBtnRefundAsk = this._welDetailWrap.find(".__btn_refund_ask");
        this._welBtnCvsFind = this._welDetailWrap.find(".__btn_cvs_Find");
        this._welBtnHoldInfo = this._welDetailWrap.find(".__btn_hold_info");
        this._welBtnCvsInfo = this._welDetailWrap.find(".__btn_cvs_info");
        this._welBtnCvsFind = $(".__btn_cvs_find");
        this._welBtnReviewWrite = this._welDetailWrap.find(".__btn_review_write");
        this._welBtnReviewRead = this._welDetailWrap.find(".__btn_review_read");
        this._welBtnDelayInfo = this._welDetailWrap.find(".__btn_delay_info");
        this._welBtnDelayReward = this._welDetailWrap.find(".__btn_delay_reward");

        this._welDeliveryInfo = $("#_delivery_info");
        this._welBtnShowAdd = this._welDeliveryInfo.find(".__btn_show_add");
        this._welBtnCloseAdd = this._welDeliveryInfo.find(".__btn_close_add");
        this._welBtnSaveAdd = this._welDeliveryInfo.find(".__btn_save_add");

        this._welBtnCancelAll = this._welDetailWrap.find(".__btn_cancel_all");
        this._welCancelLayerWrap = this._welContent.find("#_layer_cancel_all");
        this._welDimmed = this._welContent.find("#dimmed2");

        this._welCancelLayer = this._welContent.find("#_layer_cancel");
        this._templateDelayReward = Handlebars.compile('<div class="layer_out"><div class="layer_inr"><div class="cont3"><p class="tit_norm">배송 지연에 사과 드립니다.</p><p class="txt">불편을 겪으신 고객님께 배송지연의 보상으로<br>티몬적립금을 지급해 드립니다.</p><dl class="dl_wrap2 type2"><dt><strong>적립금액</strong></dt><dd><strong class="cl_point">{{amount}}원</strong></dd><dt><strong>유효기간</strong></dt><dd>{{expire_date}}</dd></dl></div><p class="txt2">지급내역은 <em class="txt_g">마이티몬&gt;적립금</em>에서 확인 가능합니다.</p><div class="btns"><button type="button" class="bt_blu __btn_close">확인</button></div><p class="btns_add">고객센터 문의 : 1544-6240</p><button type="button" class="bt_cls __btn_close"><span class="blind">닫기</span></button></div></div>');
        this._templateDelayInfo = Handlebars.compile('<div class="layer_out"><div class="layer_inr"><div class="cont3"><p class="tit_norm">배송 지연 안내</p><p class="txt">이용에 불편을 끼쳐드려 죄송합니다.<br>판매자가 등록한 배송지연 내용 안내해 드립니다.</p><dl class="dl_wrap2"><dt><strong>지연사유</strong></dt><dd>{{delay_reason_type}}</dd><dt><strong>발송 예정일</strong></dt><dd><em class="cl_point">{{send_booking_date}}</em></dd><dt><strong>안내일</strong></dt><dd>{{created_at}}</dd></dl></div><div class="btns"><button type="button" class="bt_blu __btn_close">확인</button></div><p class="btns_add">고객센터 문의 : 1544-6240</p><button type="button" class="bt_cls __btn_close"><span class="blind">닫기</span></button></div></div>');
    },

    setEvent : function(){
        this._welBtnCancelRefund.on("click", $.proxy(this._onClickBtnCancel, this));
        this._welBtnCancelReturn.on("click", $.proxy(this._onClickBtnCancel, this));
        this._welBtnRejectInfo.on("click", $.proxy(this._onClickBtnRejectInfo, this));
        this._welBtnReturnInfo.on("click", $.proxy(this._onClickBtnReturnInfo, this));
        this._welBtnRefundAsk.on("click", $.proxy(this._onClickBtnRefundAsk, this));
        this._welBtnHoldInfo.on("click", $.proxy(this._onClickBtnHoldInfo, this));
        this._welBtnCvsInfo.on("click", $.proxy(this._onClickBtnCvsInfo, this));
        this._welBtnCvsFind.on("click", $.proxy(this._onClickBtnCvsFind, this));
        this._welBtnReviewWrite.on("click", $.proxy(this._onClickBtnReview, this));
        this._welBtnReviewRead.on("click", $.proxy(this._onClickBtnReview, this));
        this._welBtnDelayInfo.on("click", $.proxy(this._onClickBtnDelayInfo, this));
        this._welBtnDelayReward.on("click", $.proxy(this._onClickBtnDelayReward, this));

        this._welBtnShowAdd.on("click", $.proxy(this._onClickBtnShowAdd, this));
        this._welBtnCloseAdd.on("click", $.proxy(this._onClickBtnCloseAdd, this));
        this._welBtnSaveAdd.on("click", $.proxy(this._onClickBtnSaveAdd, this));

        this._welBtnCancelAll.on("click", $.proxy(this._onClickBtnCancelAll, this));

        // 전체 구매취소 정보 레이어 닫기
        this._welCancelLayerWrap.on("click", "#form_close, #cancel_confirm_no", $.proxy(this._hideCancelAllLayer, this));
        // 환불문의 레이어 닫기
        this._welCancelLayerWrap.on("click", "#form_close, #form_close2", $.proxy(this._hideCancelAllLayer, this));
        // 전체 구매취소 완료 레이어 닫기 후 새로고침
        this._welCancelLayerWrap.on("click", "#cancel_dismissed, #cancel_dismissed_close", $.proxy(this._reloadDetailBuy, this));
        // 전체 구매취소 진행
        this._welCancelLayerWrap.on("click", "#cancel_confirm_yes", $.proxy(this._confirmCancelAll, this));

        this._welCancelLayer.on("click", ".__btn_close", $.proxy(this._hideCancelLayer, this));
    },

    /**
     * 교환/환불철회 버튼 처리
     */
    _onClickBtnCancel : function(we){
        var welBtn = $(we.currentTarget);
        var oData;
        var claimType;
        var sClaimType;
        var bIsConfirmed;

        if(welBtn.hasClass("__type_buy")){
            // 구매내역에서는 href 값으로 데이터가 들어옴
            oData = TMON.claim.util.convertParam(we);
        }else{
            // 취소내역
            oData = {
                claimGroupSrl : welBtn.data("claimGroupSrl"),
                claimSrl : welBtn.data("claimSrl"),
                mainBuySrl : welBtn.data("mainBuySrl"),
                claimType : welBtn.data("claimType")
            };
        }

        claimType = oData.claimType;
        ajaxUrl = oData.claimGroupSrl > 0 ? TMON.claim.htAPI.withdrawClaimGroup : TMON.claim.htAPI.withdrawClaim;

        sClaimType = oData.claimType === "X" ? "교환" : "환불";
        bIsConfirmed = confirm(sClaimType + "요청을 철회하시겠습니까?");
        delete oData.claimType;

        we.preventDefault();

        // 사용자가 확인을 누르면 호출
        if(bIsConfirmed){
            $.ajax({
                url : ajaxUrl,
                data : oData,
                success : function(data){
                    if(data === "OK"){
                        alert("철회되었습니다.");
                        TMON.claim.util.refreshList();
                        window.location.reload();
                    }else if(data === "NOK"){
                        alert("철회가 정상적으로 처리되지 않았습니다. 다시 시도해주세요.");
                        window.location.reload();
                    }
                },
                error : function(){
                    alert("철회가 정상적으로 처리되지 않았습니다. 다시 시도해주세요.");
                    window.location.reload();
                }
            });
        }
    },

    /**
     * 거절사유버튼 claimType에 따라 앱 헤더 처리
     * X: 교환, R: 환불
     */
    _onClickBtnRejectInfo : function(we){
        if(TMON.view_mode === "app"){
            var welBtn = $(we.currentTarget);
            var claimType = welBtn.data("claimType");
            var sHref = welBtn.attr("href");
            var sClaimType;
            var sTitle;

            // 구매내역에서 href 값으로 데이터가 들어옴(data-claim-type이 없음)
            if(claimType === ""){
                claimType = sHref.split("claimType=")[1];
            }

            sClaimType = claimType === "X" ? "교환" : "환불";
            sTitle = sClaimType + "거절사유";

            we.preventDefault();
            TMON.claim.util.openWebView(we, sTitle, {
                isDelivery : true,
                isViewMode : true,
                sViewModeType : "&",
                isCloseOnly : true
            });
        }
    },

    /**
     * 반품수거지 정보를 가져옴
     */
    _onClickBtnReturnInfo : function(we){
        var welBtn = $(we.currentTarget);
        var oData;

        // 구매내역에서 href 값으로 데이터가 들어옴
        if(welBtn.attr("href").length > 1){
            oData = TMON.claim.util.convertParam(we);
        }else{
            // 취소내역
            oData = {
                claim_delivery_srl : welBtn.data("claimDeliverySrl")
            };
        }

        we.preventDefault();

        $.ajax({
            url : TMON.claim.htAPI.claimDeliveryInfo,
            data : oData,
            success: $.proxy(this._onSuccessReturnInfo, this),
            error : function(){
                alert("반품수거지 정보를 찾을 수 없습니다.");
            }
        });
    },

    /**
     * 반품수거지 정보를 레이어로 노출
     */
    _onSuccessReturnInfo : function(data){
        var welReturnInfoLayer = $(data).find("#_return_info_layer");
        var welBtnClose = welReturnInfoLayer.find(".__btn_close");

        welReturnInfoLayer.find(".cl_layer").css("top", this._welBody.scrollTop() + 100);
        welReturnInfoLayer.appendTo(this._welContent);
        welBtnClose.on("click", function(){
            welReturnInfoLayer.remove();
        });
    },

    /**
     * 환불문의 버튼 처리
     */
    _onClickBtnRefundAsk : function(we){
        var oData = TMON.claim.util.convertParam(we); // notice_type

        we.preventDefault();

        $.ajax({
            url : TMON.claim.htAPI.refundNotice,
            type : "POST",
            data : oData,
            context : this,
            success : function(res){
                var welLayer = $(res.data).find(".layer_out");
                this._welCancelLayerWrap.css("top", this._welBody.scrollTop() + 100).html(welLayer);
                this._showCancelAllLayer();
            },
            error : function(res){
                alert("고객센터(1544-6240)로 환불 문의 바랍니다.");
            }
        });
    },

    /**
     * 전체 구매취소 정보 요청
     */
    _onClickBtnCancelAll : function(we){
        var welBtn = $(we.currentTarget);
        var buySrl = parseInt(welBtn.attr("href").split("?")[0].split("/")[3], 10);
        var statusType = welBtn.attr("href").split("?")[1].replace("status_type=", "");
        var oData = {
            buy_srl : buySrl,
            status_type : statusType,
            view_mode : TMON.view_mode
        };

        we.preventDefault();

        $.ajax({
            url : TMON.claim.htAPI.cancelAllForm,
            type : "POST",
            data : oData,
            success : $.proxy(this._onSuccessCancelAllLayer, this),
            error : function(res){
                alert("취소정보를 불러오지 못했습니다. 다시 시도해주세요.");
            }
        });
    },

    /**
     * 구매취소 정보 수신 후 레이어 열기
     */
    _onSuccessCancelAllLayer : function(res){
        var welData = $(res.data);
        var welForm = welData.find("form[name=cancel]");
        var welLayer = welForm.find(".layer_out");
        var welBtnConfirm = welForm.find("#cancel_confirm_yes");
        var aData = welForm.serializeArray();

        // Form값을 확인버튼에 data로 부여함
        for(var data in aData){
            welBtnConfirm.data(aData[data].name, aData[data].value);
        }

        this._welCancelLayerWrap.css("top", this._welBody.scrollTop() + 100).html(welLayer);
        this._showCancelAllLayer();
    },

    /**
     * 구매취소 레이어 보이기
     */
    _showCancelAllLayer : function(){
        this._welDimmed.show();
        this._welCancelLayerWrap.css("top", this._welBody.scrollTop() + 100).show();
    },

    /**
     * 구매취소 레이어 숨김
     */
    _hideCancelAllLayer : function(){
        this._welDimmed.hide();
        this._welCancelLayerWrap.hide();
        this._welCancelLayerWrap.html("");
    },

    /**
     * 구매취소 확인 후 새로고침
     */
    _reloadDetailBuy : function(){
        this._hideCancelAllLayer();
        TMON.claim.util.refreshList();
        window.location.reload();
    },

    /**
     * 전체 구매취소 진행
     * 데이터: main_buy_srl, cash_amount, point_amount, coupon_amount, status_type
     * 호출하면 응답 레이어를 받아온다
     */
    _confirmCancelAll : function(we){
        var oData = $(we.currentTarget).data();
        var welBtn = this._welCancelLayerWrap.find("button");
        oData.view_mode = TMON.view_mode;

        $.ajax({
            url : TMON.claim.htAPI.cancelAll,
            type : "POST",
            data : oData,
            context : this,
            beforeSend : function(){
                welBtn.prop("disabled", true).fadeTo(0, 0.5);
            },
            success : function(res){
                var welLayer = $(res.data).find(".layer_out");
                this._welCancelLayerWrap.css("top", this._welBody.scrollTop() + 100).html(welLayer);
            },
            error : function(res){
                alert("전체 구매취소 중 오류가 발생했습니다. 다시 시도해주세요.");
                welBtn.prop("disabled", false).fadeTo("fast", 1);
            }
        });
    },

    /**
     * 보류사유보기
     */
    _onClickBtnHoldInfo : function(we){
        if(TMON.view_mode === "app"){
            we.preventDefault();
            TMON.claim.util.openWebView(we, "보류상세정보", {
                isDelivery : true,
                isViewMode : true,
                sViewModeType : "&",
                isCloseOnly : true
            });
        }
    },

    /**
     * 편의점 반품정보
     */
    _onClickBtnCvsInfo : function(we){
        if(TMON.view_mode === "app"){
            we.preventDefault();
            TMON.claim.util.openWebView(we, "편의점반품정보", {
                isDelivery : true,
                isViewMode : true,
                sViewModeType : "&",
                isCloseOnly : true
            });
        }
    },

    _onClickBtnCvsFind : function(we){
        if(TMON.view_mode === "app"){
            we.preventDefault();
            TMON.claim.util.openWebView(we, "가까운 편의점 찾기", {
                isDelivery : false,
                isViewMode : false,
                sViewModeType : "",
                isCloseOnly : true
            });
        }
    },

    /**
     * 구매후기 쓰기/보기
     */
    _onClickBtnReview : function(we){
        var welBtn = $(we.currentTarget);
        // 구매 후 30일 이상 지난 경우
        var bIsOutOfDate = welBtn.attr("href") === "#NoWrite";
        var sTitle = welBtn.hasClass("__btn_review_write") ? "구매 후기 쓰기" : "내 구매 후기";

        if(bIsOutOfDate){
            we.preventDefault();
        }else{
            TMON.claim.util.openWebView(we, sTitle, {
                isDelivery : false,
                isViewMode : true,
                sViewModeType : "?",
                isCloseOnly : true
            });
        }
    },

    /**
     * 배송지연 안내 버튼 클릭시 레이어 노출
     */
    _onClickBtnDelayInfo : function(we){
        var oData = TMON.claim.util.convertParam(we);

        we.preventDefault();

        $.ajax({
            url : TMON.claim.htAPI.getDeliveryDelayRequestInfo,
            type : "POST",
            data : oData,
            success : $.proxy(this._cbOnClickBtnInfo, this),
            error : function(){
                alert("잠시 후에 다시 시도해주세요.");
            }
        });
    },

    _cbOnClickBtnInfo : function(res){
        var oData = JSON.parse(res.data).info;

        // 시분초 제거
        oData.send_booking_date = oData.send_booking_date.split(" ")[0];

        this._welCancelLayer.html(this._templateDelayInfo(oData));
        this._welCancelLayer.css("top", this._welBody.scrollTop() + 100);
        this._welDimmed.show();
        this._welCancelLayer.show();
    },

    /**
     * 배송지연 보상내역 버튼 클릭시 레이어 노출
     */
    _onClickBtnDelayReward : function(we){
        var oData = TMON.claim.util.convertParam(we);

        we.preventDefault();

        $.ajax({
            url : TMON.claim.htAPI.getDeliveryReward,
            type : "POST",
            data : oData,
            success : $.proxy(this._cbOnClickBtnDelayReward, this),
            error : function(){
                alert("잠시 후에 다시 시도해주세요.");
            }
        });
    },

    _cbOnClickBtnDelayReward : function(res){
        var oData = JSON.parse(res.data).info;

        // 천단위 구분자 추가
        oData.amount = TMON.claim.util.addCommaToNumber(oData.amount);
        // 시분초 제거
        oData.expire_date = oData.expire_date.split(" ")[0];

        this._welCancelLayer.html(this._templateDelayReward(oData));
        this._welCancelLayer.css("top", this._welBody.scrollTop() + 100);
        this._welDimmed.show();
        this._welCancelLayer.show();
    },

    _hideCancelLayer : function(){
        this._welCancelLayer.hide();
        this._welDimmed.hide();
        this._welCancelLayer.html("");
    },

    /**
     * CallApp 처리
     */
    _assignWebview : function(){
        var oButtons = {
            ".__btn_cancel_buy" : "구매취소"
        };

        var oButtonsRequest = {
            ".__btn_return_req" : "교환요청",
            ".__btn_cancel_req" : "취소요청",
            ".__btn_refund_req" : "환불요청"
        };

        var oButtonsToExternal = {
            ".__btn_info" : "업체정보",
            ".__btn_warn" : "주의사항",
            ".__btn_sms" : "문자발송"
        };

        var doClaimButton = function(we, sTitle){
            TMON.claim.util.openWebView(we, sTitle, {
                isDelivery : true,
                isViewMode : true,
                sViewModeType : "?",
                isCloseOnly : true
            });
        };

        var confirmForWear = function(selector, we, sTitle){
            var ly;
            switch(selector){
                case '.__btn_cancel_buy':
                case '.__btn_cancel_req':
                    ly = 'ww1';
                    break;
                case '.__btn_refund_req':
                    ly = 'ww2';
                    break;
                case '.__btn_return_req':
                    ly = 'ww3';
                    break;
            }
            if (ly) {
                TMON.claim.util.openHtmlLayer('#_layer_cnf_'+ly, function(result){
                    if (result) {
                        doClaimButton(we, sTitle);
                    }
                });
            } else {
                doClaimButton(we, sTitle);
            }
        };

        // 구매취소
        $.each(oButtons, $.proxy(function(selector, sTitle){
            this._welContent.find(selector).on("click", function(we){
                if ($(we.currentTarget).data('type') === 'WW_TICKET') {
                    confirmForWear(selector, we, sTitle);
                } else {
                    doClaimButton(we, sTitle);
                }
                return false;
            });
        }, this));

        // 취소요청 환불요청 교환요청
        $.each(oButtonsRequest, $.proxy(function(selector, sTitle){
            this._welContent.find(selector).on("click", function(we){
                var currentTarget = $(we.currentTarget);
                var isProcessing = currentTarget.attr("href") === "/m#NoClaimRequest";

                if(isProcessing){
                    alert("같이 배송된 다른 상품에 대한 요청이 진행중입니다. 해당 요청이 완료된 후에 다시 요청해주세요.");
                }else{
                    if (currentTarget.data('type') === 'WW_TICKET') {
                        confirmForWear(selector, we, sTitle);
                    } else {
                        doClaimButton(we, sTitle);
                    }
                }
                return false;
            });
        }, this));

        // 외부 기존 페이지 연결
        $.each(oButtonsToExternal, $.proxy(function(selector, sTitle){
            this._welContent.find(selector).on("click", function(we){
                TMON.claim.util.openWebView(we, sTitle, {
                    isDelivery : false,
                    isViewMode : true,
                    sViewModeType : "?",
                    isCloseOnly : true
                });
            });
        }, this));

        this._welContent.find(".__btn_track").on("click", function(we){
            TMON.claim.util.openWebView(we, "배송추적", {
                isDelivery : false,
                isViewMode : true,
                sViewModeType : "&",
                isCloseOnly : true
            });
        });

        this._welContent.find(".__btn_flight").on("click", function(we){
            TMON.claim.util.openWebView(we, "탑승객 정보", {
                isDelivery : true,
                isViewMode : true,
                sViewModeType : "&",
                isCloseOnly : true
            });
        });

    }
};
