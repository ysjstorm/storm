var modifyPassenger = function(){
    this.init();
};

modifyPassenger.prototype = {

    bIsAvailable : true,
    sInfantSrl : '',
    nCheckDoubleClick : 0,

    init : function(){
        this.cacheElement();
        this.setEvent();
    },

    cacheElement : function(){
        this.welPassengerInfo = $('.passenger_info');
        this.welAddInfant = $('.btn_infant');
        this.welPassengerList = $('.lst_passenger');
        this.welHideLayerBtn = $('.cls');
        this.welDelteNoticeLayer = $('#layer_delete_infant');
        this.welCompleteInfantLayer = $('#layer_complete_delete_infant');
        this.welCloseLayer = $('._close');
        this.welDimmed = $('#dimmed');
    },

    setEvent : function(){
        this.welAddInfant.on('click', $.proxy(this._addInfantEvent, this));
        this.welPassengerList.on('click', '.modify', $.proxy(this._modifyPassengerInfo, this));
        this.welPassengerList.on('click', '.delete', $.proxy(this._deleteInfantInfoEvent, this));
        this.welPassengerList.on('click', '.complete', $.proxy(this._completeAddInfantEvent, this));
        this.welHideLayerBtn.on('click', $.proxy(this._hideLayerEvent, this));
        this.welDelteNoticeLayer.on('click', '.bt_blu', $.proxy(this._removeInfantInfoEvent, this));
        this.welCompleteInfantLayer.on('click', '.bt_blu, .cls', $.proxy(this._reLoad, this));
        this.welCloseLayer.on('click', '.bt_blu, .cls', $.proxy(this._hideLayerEvent, this));
    },

    _reLoad : function () {
        location.reload();
    },

    _deleteInfantInfoEvent : function (we) {
        var welDeleteBtn = $(we.currentTarget);
        var nLayerLocationTop = welDeleteBtn.offset().top - 70;

        if (welDeleteBtn.is('._infant')) {
            $('#addInfantHtml').remove();
            this.bIsAvailable = true;
            return false;
        } else if (this.bIsAvailable == false) {
            $('#layer_invalid_edit').css("top", nLayerLocationTop).show()
            this.welDimmed.show();
            return false;
        }

        this.sInfantSrl = welDeleteBtn.closest('.passenger').data('passengerSrl');

        $('#layer_delete_infant').css("top", nLayerLocationTop).show();
        this.welDimmed.show();

        return false;
    },

    _removeInfantInfoEvent : function () {
        if (this.nCheckDoubleClick > 0) {
            alert("요청한 작업을 수행중입니다.");
        }
        var url = '/m/mytmon/passengers/' + this.sInfantSrl;
        var welLayerDeleteInfant = $('#layer_delete_infant');

        this.nCheckDoubleClick++;

        $.ajax({
            type: "DELETE",
            url: url,
            success: function () {
                welLayerDeleteInfant.hide();
                $('#layer_complete_delete_infant').css("top", welLayerDeleteInfant.offset().top + 50).show();
            },
            complete: function () {
                this.nCheckDoubleClick = 0;
            },
            error: function () {
                alert("서버와 연결에 실패하였습니다.");
            }
        });
    },

    _addInfantEvent : function (we) {
        var welInfantInfo = $(we.currentTarget);
        var nLayerLocationTop = welInfantInfo.offset().top - 70;

        if (this.bIsAvailable == false) {
            $('#layer_invalid_edit').css("top", nLayerLocationTop).show();
            this.welDimmed.show();
            return false;
        }

        if (welInfantInfo.data('enableAddInfant')) {
            var sDealSrl = welInfantInfo.data('dealSrl');
            var welAddInfant = $('#addInfantHtml').clone(true);

            $('#addInfantTarget_'+sDealSrl).append(welAddInfant.show());
            welAddInfant.find('#_lastName').focus();
            welAddInfant.find('.tit_category').addClass('_checkInfant');

            this.bIsAvailable = false;
            return false;
        } else {
            $('#layer_invalid_add_infant').css("top", nLayerLocationTop).show();
            this.welDimmed.show();
        }
    },

    _modifyPassengerInfo : function (we) {
        var welModifyBtn = $(we.currentTarget);
        var welCompleteBtn = welModifyBtn.closest('.passenger').find('.complete');

        var welPassengerInfo = welModifyBtn.closest('.passenger').find('.passenger_desc');
        var welPassengerInputText = welPassengerInfo.find('.passenger_txt');

        if (this.bIsAvailable == false) {
            $('#layer_invalid_edit').css("top", welModifyBtn.offset().top - 70).show();
            this.welDimmed.show();
            return false;
        }

        this.bIsAvailable = false;

        welPassengerInputText.removeAttr('disabled');
        welPassengerInfo.find('.selwp').removeClass('disabled');
        welPassengerInfo.find('._selectBar').removeAttr('disabled');
        welModifyBtn.hide();
        welCompleteBtn.show();

        return false;
    },

    _completeAddInfantEvent : function (we) {
        if (this.nCheckDoubleClick > 0) {
            alert("요청한 작업을 수행중입니다.");
        }
        var welCompleteBtn = $(we.currentTarget);
        var sUrl = '/m/mytmon/passengers';
        var nLayerLocationTop = welCompleteBtn.offset().top - 70;

        if (welCompleteBtn.is('._infant')) {
            var nBirthDay = $('#_birth').val();

            if (($.isNumeric(nBirthDay) == false) || (nBirthDay.length != 8)) {
                $('#layer_invalid_birthday').css("top", nLayerLocationTop).show();
                this.welDimmed.show();
                return false;
            }

            var oData = new Object();

            oData.mainBuySrl = this.welPassengerInfo.data('mainBuySrl');
            oData.mainDealSrl = this.welPassengerInfo.data('mainDealSrl');
            oData.dealSrl = $('#addInfantHtml').parent().attr('id').split('_')[1];
            oData.passengerFirstName = $('#_firstName').val();
            oData.passengerLastName = $('#_lastName').val();
            oData.passengerBirthday = nBirthDay;
            oData.passengerGender = $('#_gender').val();
            oData.passengerType = "I";
            this.nCheckDoubleClick++;

            $.ajax({
                type: "POST",
                url: sUrl,
                data: oData,
                success: function () {
                    location.reload();
                },
                complete: function () {
                  this.nCheckDoubleClick = 0;
                },
                error: function () {
                    alert("서버와 연결에 실패하였습니다.");
                }
            });
        } else {
            var welPassengerInfo = welCompleteBtn.closest('.passenger');
            var oData = new Object();
            var nBirthDay = welPassengerInfo.find('input[name=birthday]').val();

            if (($.isNumeric(nBirthDay) == false) || (nBirthDay.length != 8)) {
                $('#layer_invalid_birthday').css("top", nLayerLocationTop).show();
                this.welDimmed.show();
                return false;
            }

            oData.passengerType = welPassengerInfo.find('select[name=type]').val();
            oData.passengerFirstName = welPassengerInfo.find('input[name=firstName]').val();
            oData.passengerLastName = welPassengerInfo.find('input[name=lastName]').val();
            oData.passengerBirthday = nBirthDay;
            oData.passengerGender = welPassengerInfo.find('select[name=gender]').val();

            sUrl += '/' + welPassengerInfo.data('passengerSrl');
            this.nCheckDoubleClick++;

            $.ajax({
                type: "PUT",
                url: sUrl,
                data: oData,
                success: function () {
                    location.reload();
                },
                complete: function () {
                    this.nCheckDoubleClick = 0;
                },
                error: function () {
                    alert("서버와 연결에 실패하였습니다.");
                }
            });
        }
    },

    _hideLayerEvent : function (we) {
        var welCloseBtn = $(we.currentTarget);

        var sLayerId = '#' + welCloseBtn.closest('.layer_cncl').attr('id');

        $(sLayerId).hide();
        this.welDimmed.hide();
    }

};
