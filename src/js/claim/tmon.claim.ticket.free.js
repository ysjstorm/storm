var claimTicketFree = function(){
    this.init();
};

claimTicketFree.prototype = {

    init : function(){
        this.cacheElement();
        this.setEvent();
    },

    cacheElement : function(){
        this._welTickets = $(".__tickets_wrap");
        this._welBtnFreedom = this._welTickets.find(".__btn_frd");
        this._welBtnUseFreedom = this._welTickets.find(".__btn_frd_use");
        this._welForm = this._welTickets.find("#useticket");
        this._welInputTicketSrl = this._welTickets.find("#ticket_srl");
        this._welInputPartnerSrl = this._welTickets.find("#partner_srl");
        this._welTargetIframe = this._welTickets.find("#iframe_useticket");
    },

    setEvent : function(){
        this._welBtnFreedom.on("click", $.proxy(this._onClickBtnFreedom, this));
        this._welBtnUseFreedom.on("click", $.proxy(this._onClickBtnUseFreedom, this));
        this._welTargetIframe.on("load", $.proxy(this._onLoadSubmit, this));
    },

    /**
     * 쿠폰사용 버튼 클릭시 상세내용 토글
     */
    _onClickBtnFreedom : function(we){
        var welBtn = $(we.currentTarget);
        var welCoupon = welBtn.parent(".__frd_cpn");

        we.preventDefault();
        welCoupon.toggleClass("fold");
    },

    /**
     * 쿠폰사용 처리
     * 프록시를 이용해서 PHP쪽으로 호출
     */
    _onClickBtnUseFreedom : function(we){
        var welBtn = $(we.currentTarget);
        var isConfirmed = confirm("사용처리를 하시겠습니까?");
        var ticketSrl = welBtn.data("ticketSrl").toString();
        var partnerSrl = welBtn.data("partnerSrl").toString();
        var oData = {
            ticket_srl : ticketSrl,
            partner_srl: partnerSrl
        };

        we.preventDefault();

        if(isConfirmed){
            $.ajax({
                url : TMON.claim.htAPI.useticket,
                type : "POST",
                data : oData,
                dataType : "json",
                success : function(res){
                    var data = JSON.parse(res.data);
                    alert(data.msg);
                    window.location.reload();
                },
                error : function(res){
                    var data = JSON.parse(res.data);
                    alert(data.msg);
                }
            });
        }
    }
};
