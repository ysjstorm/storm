var claimTicketBarcode = function(){
    this.init();
};

claimTicketBarcode.prototype = {

    init : function(){
        this.cacheElement();
        this.setEvent();
        this._assignTemplate();
    },

    cacheElement : function(){
        this._welBody = $("body");
        this._welContent = $("#ct");
        this._welTickets = $(".__tickets_wrap");
        this._welDimmed = $("#dimmed");
        this._welLayerWrap = $("#_layer_cancel");
        this._welBtnBarcode = this._welTickets.find(".__btn_barcode");
        this._welOpenTicket = this._welTickets.find(".__open_ticket");
    },

    setEvent : function(){
        this._welBtnBarcode.on("click", $.proxy(this._onClickBtnBarcode, this));
        this._welOpenTicket.on("click", $.proxy(this._onClickOpenTicket, this));
        this._welLayerWrap.on("click", ".__btn_close", $.proxy(this._onClickBtnClose, this));
    },

    /**
     * 홈플러스, 에버랜드 바코드 레이어 처리
     */
    _onClickBtnBarcode : function(we){
        var welBtn = $(we.currentTarget);
        var welLayer = $(this._barcodeTemplate(welBtn.data()));

        we.preventDefault();
        this._welDimmed.show();
        this._welLayerWrap.html(welLayer).css("top", this._welBody.scrollTop() + 200).show();
    },

    _onClickBtnClose : function(we){
        we.preventDefault();
        this._welLayerWrap.hide();
        this._welDimmed.hide();
    },

    _assignTemplate : function(){
        this._barcodeTemplate = Handlebars.compile('<div class="layer_headlined"><div class="layer_out"><div class="layer_inr"><div class="tit_dark">바코드 보기</div><div class="barcode_area"><img src="http://bcgen.ticketmonster.co.kr/html/image.php?filetype=PNG&dpi=72&scale=2&rotation=0&font_family=Arial.ttf&font_size=12&text={{ ticketNo }}&thickness=30&start=NULL&code=BCGcode128" width="217" height="56" alt="{{ ticketNo }}"></div><div class="btns"><button type="button" class="bt_blu __btn_close">확인</button></div><button type="button" class="bt_cls_w __btn_close"><span class="blind">닫기</span></button></div></div>');
    }
};
