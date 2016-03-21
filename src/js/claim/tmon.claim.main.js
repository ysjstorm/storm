/**
 * 클레임 메인
 * @param htOptions
 */
var claimMain = function(htOptions) {
	this.init(htOptions);
};

claimMain.prototype = {
	init: function(htOptions) {
		$.extend(this, htOptions);

        TMON.claim.htAPI = {
            getBuyList : "/m/mytmon/getBuyList",
            getClaimList : "/m/mytmon/getClaimList",
            withdrawClaim : "/m/mytmon/withdrawClaim",
            withdrawClaimGroup : "/m/mytmon/withdrawClaimGroup",
            claimDeliveryInfo : "/m/mytmon/claimDeliveryInfo",
            accountCheck : "/m/mytmon/accountCheck",
            accountCheckProc : "/m/mytmon/accountCheckProc",
            claimHoldInfoProc: "/m/mytmon/claimHoldInfoProc",
            refundNotice : "/m/proxy/mytmon/refundNotice",
            cancelAllForm : "/m/proxy/mytmon/cancelAllForm",
            cancelAll : "/m/proxy/mytmon/cancelAll",
            changeAddr : "/m/proxy/mytmon/changeAddr",
            getDeliveryDelayRequestInfo : "/m/proxy/mytmon/getDeliveryDelayRequestInfo",
            getDeliveryReward : "/m/proxy/mytmon/getDeliveryReward",
            getPostCodeByAjax : "/m/proxy/mytmon/getPostCodeByAjax",
            useticket : "/m/proxy/mytmon/useticket",
            getMultiTicketUsedInfo : "/m/proxy/mytmon/getMultiTicketUsedInfo",
            checkDeliveryInfo : "/m/mytmon/checkDeliveryInfo",
            receiveClaimCancelProc : "/m/mytmon/receiveClaimCancelProc",
            receiveClaimGroupCancelProc : "/m/mytmon/receiveClaimGroupCancelProc",
            receiveClaimForTicketProc : "/m/mytmon/receiveClaimForTicketProc",
            receiveClaimForDeliveryProc : "/m/mytmon/receiveClaimForDeliveryProc",
            receiveClaimGroupForDeliveryProc : "/m/mytmon/receiveClaimGroupForDeliveryProc"
        };

        TMON.claim.util = new claimUtil();

        this.cacheElement();
        this.setEvent();
		this.initPage();
	},

    cacheElement: function(){
        this._welTabNav = $('.my_his_nav');
        this._welTabNavAnc = this._welTabNav.find('ul li a');
    },

    setEvent: function(){
        this._welTabNavAnc.on('click', $.proxy(this._onClickTabNav, this));
    },

	initPage: function() {
		switch (this.sCurrentPage) {
			case "/mytmon/buyList" :
				this.oClaimBuyList = new claimBuyList();
				break;
			case "/mytmon/claimList" :
				this.oClaimClaimList = new claimClaimList();
				break;
			case "/mytmon/detailBuy" :
				this.oClaimDetailClaim = new claimDetailBuy();
				break;
			case "/mytmon/detailClaim" :
            case "/mytmon/detailClaimGroup":
				this.oClaimDetailClaim = new claimDetailClaim();
				break;
			case "/mytmon/fastDeliveryAndJustRefund" :
				this.oClaimFastDelivery = new claimFastDelivery();
				break;
			case "/mytmon/rejectReasonInfo" :
            case "/mytmon/claimHoldInfo" :
				this.oClaimRejectReason = new claimRejectReason();
				break;
			case "/mytmon/receiveClaimSelect" :
			case "/mytmon/receiveClaimGroupSelect" :
				this.oClaimSelect = new claimSelect();
				break;
            case "/mytmon/receiveClaimCancel" :
            case "/mytmon/receiveClaimCancelReq" :
            case "/mytmon/receiveClaimForDelivery" :
            case "/mytmon/receiveClaimForMultiBiz" :
            case "/mytmon/receiveClaimForTicket" :
            case "/mytmon/receiveClaimForTicketReq" :
            case "/mytmon/receiveClaimGroupCancel" :
            case "/mytmon/receiveClaimGroupCancelReq" :
            case "/mytmon/receiveClaimGroupForDelivery" :
            case "/mytmon/receiveClaimExchangeReq" :
            case "/mytmon/receiveClaimGroupExchangeReq" :
            case "/mytmon/receiveClaimDone" :
				this.oClaimCancel = new claimCancel();
				break;
            case "/mytmon/receiveClaimPassenger" :
                this.oClaimRefundAirplane = new claimRefundAirplane();
                break;
            case "/mytmon/showPassenger" :
                this.oModifyPassenger = new modifyPassenger();
                break;
		}
	},

    _onClickTabNav: function(we){
        var welSel = $(we.currentTarget);
        this._welTabNav.find('ul li').removeClass('on');
        welSel.parent().addClass('on');
    }
};
