/**
 * Wear Delivery List
 */
var wearList = function(htOptions){
	$.extend(this, htOptions);
	this.htOptions = htOptions;
	this.init();
};

wearList.prototype = {

	init: function () {
		this.cacheElement();
		this.setEvent();
		this.setTemplate();
	},

	cacheElement: function () {
        this.welDeliveryTicketList = $('[data-template-id=deliveryTicketListTemplate]');
        this.welMoreDeliveryTicketButton = $('#_moreDeliveryTicketListButton');
        this.welDeliveryNormalList = $('[data-template-id=deliveryNormalListTemplate]');
        this.welMoreDeliveryNormalButton = $('#_moreDeliveryNormalListButton');
        this.welClaimLayerOpenButton = $('#_claimLayerOpen');
        this.welClaimLayer = $('#_claimLayer');
        this.welLayerCloseButton = $('.btn_detail_cancel');
	},

	setEvent: function () {
        this.welMoreDeliveryTicketButton.click($.proxy(this.getDeliveryTicketList, this));
        this.welMoreDeliveryNormalButton.click($.proxy(this.getDeliveryNormalList, this));
        this.welClaimLayerOpenButton.click($.proxy(this.claimLayerOpen, this));
        this.welLayerCloseButton.on('click',function(){history.back();});
        this.welDeliveryNormalList.on('click', '.right_area a', $.proxy(this.redirectDealDetail, this));
	},

	setTemplate: function () {
        this.tplDeliveryTicketList = Handlebars.compile($("#buyListTicket").html());
        this.tplDeliveryNormalList = Handlebars.compile($("#buyListNormal").html());
	},

    getDeliveryTicketList : function () {
        welDeliveryTicketList = $(this.welDeliveryTicketList);
        nPageTicket = Number(welDeliveryTicketList.find('.order_deal_lst:last-child').attr('data-page')) +1;
        $.ajax({
            url: TMON.wearDelivery.htAPI.getWhereWearBuyList.replace('{pageNo}', nPageTicket).replace('{listType}', "TICKET3"),
            dataType: "json",
            success: $.proxy(this.renderDeliveryTicketList, this),
            error: function (jqXHR, textStatus) {
                if (textStatus == "abort") {
                    return;
                }
                alert("일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
                return;
            }
        });
    },

    getDeliveryNormalList : function () {
        welDeliveryNormalList = $(this.welDeliveryNormalList);
        nPageNormal = Number(welDeliveryNormalList.find('.order_deal_lst:last-child').attr('data-page')) +1;
        $.ajax({
            url: TMON.wearDelivery.htAPI.getWhereWearBuyList.replace('{pageNo}', nPageNormal).replace('{listType}', "WEAR_GN"),
            dataType: "json",
            success: $.proxy(this.renderDeliveryNormalList, this),
            error: function (jqXHR, textStatus) {
                if (textStatus == "abort") {
                    return;
                }
                alert("일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
                return;
            }
        });
    },

    renderDeliveryTicketList : function (res) {
        if (res.httpStatus != "OK") {
            return false;
        }
        var htDeliveryTicketListData = {
            aItems : res.data.buyList,
            sAppQueryQ : this.htConnectEnvironment.sAppQueryQ,
            sAppQueryN : this.htConnectEnvironment.sAppQueryN,
            pageNo : nPageTicket
        }
        if (!res.data.hasMoreData) {
            el = $(this.welMoreDeliveryTicketButton);
            el.hide();
        }

        sHtml = this.tplDeliveryTicketList(htDeliveryTicketListData);
        this.welDeliveryTicketList.append(sHtml);
    },

    renderDeliveryNormalList : function (res) {
        if (res.httpStatus != "OK") {
            return false;
        }
        var htDeliveryNormalListData = {
            aItems : res.data.buyList,
            sAppQueryQ : this.htConnectEnvironment.sAppQueryQ,
            sAppQueryN : this.htConnectEnvironment.sAppQueryN,
            pageNo : nPageNormal,
            sDealDetailUri : this.htOptions.htUri.wear_m_uri_deal
        }
        if (!res.data.hasMoreData) {
            el = $(this.welMoreDeliveryNormalButton);
            el.hide();
        }

        sHtml = this.tplDeliveryNormalList(htDeliveryNormalListData);
        this.welDeliveryNormalList.append(sHtml);
    },

    claimLayerOpen : function () {
        welClaimLayer = $(this.welClaimLayer);
        TMON.wear.oHashbang.setState('',{'layer':'open'});
        welClaimLayer.show();
        TMON.commonWear.layerOpen();
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
    }

};
