var claimTicket = function(){
    this.init();
};

claimTicket.prototype = {

    init : function(){
        this.cacheElement();
        this.setEvent();

        // 바코드 레이어, FREE덤딜 쿠폰사용
        this._oClaimTicketBarcode = new claimTicketBarcode();
        this._oClaimTicketFree = new claimTicketFree();
    },

    cacheElement : function(){
        this._welTickets = $(".__tickets_wrap");
        this._welOpenTicket = this._welTickets.find(".__open_ticket");
        this._welBtnMultiTicket = this._welTickets.find(".__btn_ticket_multi");
        this._welBody = $("body");
        this._welDimmed = $("#dimmed2");
        this._welLayerWrap = $("#_layer_cancel");

        this._templateMultiTicketLayer = Handlebars.compile('<div class="layer_headlined"><div class="layer_out"><div class="layer_inr"><div class="tit_dark">사용내역</div><div class="multi_wrap"><ul class="multi_lst">{{#unless detail}}<li>사용 내역이 없습니다.</li>{{/unless}}{{#each detail}}<li>{{created_at}} <em class="cl_point">{{nCount}}{{../sCount}}</em> {{sType}}</li>{{/each}}</ul></div><div class="btns type2"><button type="button" class="bt_blu __btn_close">확인</button></div><button type="button" class="bt_cls_w __btn_close"><span class="blind">닫기</span></button></div></div></div>');
    },

    setEvent : function(){
        this._welOpenTicket.on("click", $.proxy(this._onClickOpenTicket, this));
        this._welBtnMultiTicket.on("click", $.proxy(this._onClickBtnMultiTicket, this));
        this._welLayerWrap.on("click", ".__btn_close", $.proxy(this._onClickBtnLayerClose, this));
    },

    /**
     * 티켓 클릭시 티켓 화면으로 이동
     */
    _onClickOpenTicket : function(we){
        var welAnchor = $(we.currentTarget);
        var ticketUrl = this._getTicketUrl(welAnchor.data("ticketNo").toString());

        we.preventDefault();

        if(TMON.view_mode === "app"){
            welAnchor.attr("href", ticketUrl);
            TMON.claim.util.openWebView(we, "티켓번호", {
                isDelivery : false,
                isViewMode : false,
                isCloseOnly : true
            });
        }else if(TMON.view_mode === "web"){
            window.location.href = ticketUrl;
        }
    },

    /**
     * 티켓번호로 url 생성
     * 티켓번호에 -가 있는 경우 처리
     */
    _getTicketUrl : function(sTicketNo){
        var aNumbers = sTicketNo.match(/([^-])+/g);
        var oData = {
            view_mode : TMON.view_mode
        };

        oData.no1 = aNumbers[0];

        if(aNumbers.length === 2){
            oData.no2 = aNumbers[1];
        }else if(aNumbers.length > 2){
        	oData.no1 = aNumbers.join("-");
        }

        var sTicketUrl = TMON.claim.htURL.www_php_m + "/mytmon/voucher/?" + $.param(oData);

        return sTicketUrl;
    },

    /**
     * 다회권인 경우 내역보기 레이어 처리
     */
    _onClickBtnMultiTicket : function(we){
        var oData = TMON.claim.util.convertParam(we); // ticket_srl

        we.preventDefault();

        $.ajax({
            url : TMON.claim.htAPI.getMultiTicketUsedInfo,
            type : "GET",
            data : oData,
            success : $.proxy(this._cbMultiTicket, this),
            error : function(){
                alert("사용내역을 확인할 수 없습니다.");
            }
        });
    },

    _cbMultiTicket : function(res){
        var oData = JSON.parse(res.data);
        oData.sCount = oData.multi_ticket_type === "CT" ? "회" : "원"; // CT : 횟수, FT : 금액

        $.each(oData.detail, function(index, data){
            // 사용일시에서 마지막 초단위 제거
            oData.detail[index].created_at = data.created_at.slice(0, -3);

            // 티켓 종류에 따라 금액 또는 횟수 표기
            oData.detail[index].nCount = oData.multi_ticket_type === "CT" ? data.count : data.amount;
        });

        this._welLayerWrap.html(this._templateMultiTicketLayer(oData));
        this._welLayerWrap.css("top", this._welBody.scrollTop() + 100);
        this._welDimmed.show();
        this._welLayerWrap.show();
    },

    _onClickBtnLayerClose : function(){
        this._welLayerWrap.html("");
        this._welLayerWrap.hide();
        this._welDimmed.hide();
    }
};
