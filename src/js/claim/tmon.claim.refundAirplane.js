var claimRefundAirplane = function(){
    this.init();
};

claimRefundAirplane.prototype = {

    nCheckDoubleClick : 0,

    init : function(){
        this.cacheElement();
        this.setEvent();
    },

    cacheElement : function(){
        this._welWindow = $(window);
        this._welRefundItemList = $('.it_all');
        this._welClickedItemList = this._welRefundItemList.find('.ipc');
        this._welClickBtnItem =  $('.btn_wrap');
        this._welDeleteInfant = $('#layer_delete_infant');
        this._welCompleteInfant = $('#layer_delete_infant_complete');
        this._welInvalidDeleteInfant = $('#layer_invalid_delete_infant');
        this._welLayerNoneSelected = $('#layer_none_selected');
        this._welDimmed = $('#dimmed');
    },

    setEvent : function(){
        this._welClickedItemList.on("click", $.proxy(this._attachedEvent, this));
        this._welClickBtnItem.on("click", ".bt_blu", $.proxy(this._cancelEvent, this));
        this._welClickBtnItem.on("click", ".bt_org2", $.proxy(this._checkCompleteEvent, this));
        this._welDeleteInfant.on("click", ".bt_blu", $.proxy(this._deleteInfantEvent, this));
        this._welDeleteInfant.on("click", ".cls", $.proxy(this._cancelDeleteInfantEvent, this));
        this._welCompleteInfant.on("click", ".bt_blu, cls", $.proxy(this._reloadEvent, this));
        this._welInvalidDeleteInfant.on("click", ".bt_blu, .cls", $.proxy(this._cancelInvalidDeleteInfantEvent, this));
        this._welLayerNoneSelected.on("click", ".bt_blu, .cls", $.proxy(this._closeLayerNoneSelectedEvent, this));
    },

    _attachedEvent : function (we) {
        var welClickedItemInput = $(we.currentTarget);

        if (welClickedItemInput.data('chk-type') == 'all') {
            var nDealSrl = welClickedItemInput.data('dealsrl');
            this._welClickedItemList.each(function () {
                if (nDealSrl == ($(this).data('dealsrl'))) {
                    if (welClickedItemInput.is(':checked')) {
                        $(this).prop("checked", true);
                        $(this).closest('label').addClass('on');
                    } else {
                        $(this).prop("checked", false);
                        $(this).closest('label').removeClass('on');
                    }
                } else {
                    return;
                }
            });
        } else {
            if (welClickedItemInput.prop('checked')) {
                welClickedItemInput.closest('label').addClass('on');
                welClickedItemInput.prop("checked", true);
            } else {
                welClickedItemInput.closest('label').removeClass('on');
                welClickedItemInput.prop("checked", false);
            }
        }
    },

    _cancelEvent : function () {
        if (TMON.view_mode == 'app') {
            TMON.app.callApp("webview", "closeWebView", true);
        } else {
            history.back();
        }
    },

    _cancelInvalidDeleteInfantEvent : function () {
        this._welInvalidDeleteInfant.hide();
        this._welDimmed.hide();
    },

    _getUrlInfo : function (el) {
        var welTicketInfo = $(el);
        var nDealSrl = welTicketInfo.data('dealsrl');
        var nCurrentAdultCount = welTicketInfo.data('adultcount');
        var nCurrentInfantCount = welTicketInfo.data('infantcount');

        var aTicketSrls = new Array();
        var aInfantPassengerSrls = new Array();
        var nAdultCount = 0;
        var nChildCount = 0;
        var nInfantCount = 0;
        var welCheckBoxInfoList = $('input:checkbox[name=' + nDealSrl + ']');

        welCheckBoxInfoList.each(function () {
            var welCheckBoxInfo = $(this);

            if (welCheckBoxInfo.is(":checked")) {
                var sPassengerType = welCheckBoxInfo.data('passengertype');
                var nTicketSrl = welCheckBoxInfo.data('ticketsrl');
                if (sPassengerType == 'A') {
                    nAdultCount++;
                    aTicketSrls.push(nTicketSrl);
                } else if (sPassengerType == 'C') {
                    nChildCount++;
                    aTicketSrls.push(nTicketSrl);
                } else {
                    nInfantCount++;
                    aInfantPassengerSrls.push(welCheckBoxInfo.data('passengersrl'));
                }
            }
        });

        var nCount = nAdultCount + nChildCount;

        if ((nCurrentAdultCount - nAdultCount) >= (nCurrentInfantCount - nInfantCount)) {
            return {ticketSrls: aTicketSrls.join(","), infantPassengerSrls: aInfantPassengerSrls.join(","), count: nCount, dealSrl : nDealSrl, infantCount : nInfantCount};
        } else {
            return null;
        }
    },

    _checkCompleteEvent : function (we) {
        var welCompleteBtn = $(we.currentTarget);
        var nLayerLocationTop = welCompleteBtn.offset().top - 70;
        var sUrlPath = "";
        var aPassengerTicketSrls = new Array();
        var aInfantPassengerSrls = new Array();
        var nTotalCount = 0;
        var nInfantCount = 0;
        var welTicketInfoList = $('.tbl_dl1.ticket_info');
        var bIsValidRefund = true;

        welTicketInfoList.each($.proxy(function (index, el) {
            var welTicketInfo = $(el);

            var oUrlInfo = this._getUrlInfo(welTicketInfo);

            if (oUrlInfo == null) {
                bIsValidRefund = false;
                return;
            } else {
                if (oUrlInfo.ticketSrls.length > 0) {
                    aPassengerTicketSrls.push(oUrlInfo.ticketSrls);
                }

                if (oUrlInfo.infantPassengerSrls.length > 0) {
                    aInfantPassengerSrls.push(oUrlInfo.infantPassengerSrls);
                    nInfantCount += oUrlInfo.infantCount;
                }
                if (oUrlInfo.count > 0) {
                    sUrlPath += '&deals=' + oUrlInfo.dealSrl + '&counts=' + oUrlInfo.count;
                }
                nTotalCount += oUrlInfo.count;
            }
        }, this));

        if (bIsValidRefund == true) {
            if (nTotalCount > 0) {
                var nMainBuySrl = $('.tbl_cnt').data('mainbuysrl');
                var nMainDealSrl = $('.tbl_cnt').data('maindealsrl');
                var sUrl = '/m/mytmon/claim/confirm/passengers?mainBuySrl=' + nMainBuySrl + '&mainDealSrl=' + nMainDealSrl + '&claimType=R&claimStatus=C2&dealType=U' + sUrlPath + '&passengerTicketSrls=' + aPassengerTicketSrls + '&infantPassengerSrls=' + aInfantPassengerSrls;
                this._welClickedItemList.prop("checked", false);

                location.href = sUrl;
            } else if (nInfantCount > 0) {
                $('#layer_delete_infant').data('infantPassengerSrls', aInfantPassengerSrls).css("top", nLayerLocationTop).show();
                this._welDimmed.show();
            } else {
                this._welLayerNoneSelected.css("top", nLayerLocationTop).show();
                this._welDimmed.show();
                return false;
            }


        } else {
            $('#layer_invalid_delete_infant').css("top", nLayerLocationTop).show();
            this._welDimmed.show();
        }
    },

    _cancelDeleteInfantEvent : function () {
        $('#layer_delete_infant').removeData('infantPassengerSrls').hide();
        this._welDimmed.hide();
    },

    _deleteInfantEvent : function () {
        if (this.nCheckDoubleClick > 0) {
            alert("요청한 작업을 수행중입니다.");
        }
        var sInfantPassengerSrls = $('#layer_delete_infant').data('infantPassengerSrls');

        this.nCheckDoubleClick++;

        $.ajax({
            type: "DELETE",
            url: "/m/mytmon/passengers/" + sInfantPassengerSrls,
            success: function () {
                $('#layer_delete_infant').hide();
                $('#layer_delete_infant_complete').css("top", $('#layer_delete_infant').offset().top + 50).show();
            },
            complete: function () {
                this.nCheckDoubleClick = 0;
            },
            error: function () {
                alert("서버와 연결에 실패하였습니다.")
            }
        });
    },

    _reloadEvent : function () {
        location.reload();
    },

    _closeLayerNoneSelectedEvent : function () {
        this._welLayerNoneSelected.hide();
        this._welDimmed.hide();
    }
};
