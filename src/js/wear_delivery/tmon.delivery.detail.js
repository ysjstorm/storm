/**
 * Wear Delivery Detail
 */
var wearDetail = function(htOptions){
	$.extend(this, htOptions);
	this.htOptions = htOptions;
	this.init();
};

wearDetail.prototype = {
    htNewAddress : { // 우펀번호 검색으로 받은 새로운 주소
        sZip : "", // 우편번호
        sStreet : "", // 도로명 주소
        sAddress : "" // 지역 주소
    },

	init: function () {
        this.oZipCode = new zipCode(this);
		this.cacheElement();
		this.setEvent();
		this.setTemplate();

        this.initMemotextCounter();
	},

	cacheElement: function () {
        // 배송지 정보
        this.welDeliveryInfo = $('#_deliveryInfo');
        this.welDeliveryInfoEditButton = $('#_deliveryInfoEditButton');
        this.welInfoName = this.welDeliveryInfo.find("#_infoName");
        this.welInfoPhone = this.welDeliveryInfo.find("#_infoPhone");
        this.welInfoAddress = this.welDeliveryInfo.find("#_infoAddress");
        this.welInfoMemoWrap = this.welDeliveryInfo.find("#_infoMemoWrap");
        this.welInfoMemo = this.welDeliveryInfo.find("#_infoMemo");

        // 배송지 정보 수정
        this.welDeliveryInfoEdit = $('#_deliveryInfoEdit');
        this.welInputName = this.welDeliveryInfoEdit.find("#receiveName");
        this.welInputPhoneFirst = this.welDeliveryInfoEdit.find("#receiveNumber");
        this.welInputPhoneSecond = this.welDeliveryInfoEdit.find("#receiveNumber2");
        this.welInputPhoneThird = this.welDeliveryInfoEdit.find("#receiveNumber3");
        this.welInputZipcode = this.welDeliveryInfoEdit.find("#postCode");
        this.welInputAddressFirst = this.welDeliveryInfoEdit.find("#receiveAddr");
        this.welInputAddressSecond = this.welDeliveryInfoEdit.find("#receiveAddr2");
        this.welTextAreaMemo = this.welDeliveryInfoEdit.find("#shippingMemo");
        this.welMemoCount = this.welDeliveryInfoEdit.find("#_memo_count");
        this.welDeliveryInfoEditSaveButton = this.welDeliveryInfoEdit.find("#_deliveryInfoEditSave");
        this.welDeliveryInfoEditCancelButton = this.welDeliveryInfoEdit.find("#_deliveryInfoEditCancel");

        this.welGoDealImg = $('#_goDealImg');
        this.welGoDealTitle =$('#_goDealTitle');
        this.welGoTicketMainButton = $('#_goTicketMain');
    },

	setEvent: function () {
        this.welDeliveryInfoEditButton.click($.proxy(this.deliveryInfoEditShow, this));
        this.welInputPhoneFirst.change($.proxy(this.selectBoxSelected, this));
        this.welDeliveryInfoEditSaveButton.click($.proxy(this.deliveryInfoEditSave, this));
        this.welDeliveryInfoEditCancelButton.click($.proxy(this.deliveryInfoEditCancel, this));

        $("#_btnFindAddress").click($.proxy(this.showFindAddress, this));
        this.welInputZipcode.focus($.proxy(this.showFindAddress, this));
        this.welInputAddressFirst.focus($.proxy(this.showFindAddress, this));

        this.welGoDealImg.click($.proxy(this.goDeal, this));
        this.welGoDealTitle.click($.proxy(this.goDeal, this));
        this.welGoTicketMainButton.click($.proxy(this.goTicketMain, this));
	},

	setTemplate: function () {

	},

    /**
     * 상세에서 해당 deal로 이동 call app
     */
    goDeal : function() {
        if(TMON.view_mode == 'app') {
            var url = this.welGoDealTitle.attr('href');
            TMON.app.callApp('wear', 'closeWearWebView', url, false);
            return false
        }
    },

    /**
     * 티켓 main으로 이동 call app
     */
    goTicketMain : function() {
        if(TMON.view_mode == 'app') {
            var url = this.htUri.wear_m_uri_ticketMain + this.htConnectEnvironment.sAppQueryQ;
            TMON.app.callApp('wear', 'closeWearWebView', url, false);
            return false
        }
    },

    /**
     * 배송지 정보 수정 폼 불러오기
     */
    deliveryInfoEditShow : function () {
        welDeliveryInfo = $(this.welDeliveryInfo);
        welDeliveryInfoEdit = $(this.welDeliveryInfoEdit);
        welDeliveryInfo.hide();
        welDeliveryInfoEdit.show();
    },

    /**
     * 수정 상태에서 취소 버튼 클릭
     */
    deliveryInfoEditCancel : function(){
        this.welDeliveryInfoEdit.hide();
        this.welDeliveryInfo.show();
    },

    /**
     * 셀렉트 박스 선택 값 보여주기
     */
    selectBoxSelected : function() {
        this.welDeliveryInfoEdit.find(".select_dp").text(this.welInputPhoneFirst.val());
    },

    /**
     * textCounter 플러그인을 이용해서 배송메모 글자수 제한
     */
    initMemotextCounter : function() {
        if(this.welDeliveryInfoEdit.length > 0) {
            var nInitialLength = this.welTextAreaMemo.val().length;

            this.welMemoCount.html(nInitialLength);
            new textCounter(this.welTextAreaMemo, this.welMemoCount, 50);
        }
    },

    /**
     * 배송지 수정 확인 버튼 클릭시
     */
    deliveryInfoEditSave : function() {
        var oData = {
            buy_srl : this.welDeliveryInfoEditSaveButton.data("buySrl"),
            delivery_name : this.welInputName.val(),
            hp1 : this.welInputPhoneFirst.val(),
            hp2 : this.welInputPhoneSecond.val(),
            hp3 : this.welInputPhoneThird.val(),
            zipcode : this.welInputZipcode.val(),
            addr1 : this.welInputAddressFirst.val(),
            addr2 : this.welInputAddressSecond.val(),
            addr1_street : this.welInputAddressFirst.val(),
            delivery_msg : this.welTextAreaMemo.val()
        };

        if(this.htNewAddress.sZip){ // 우편번호 검색으로 새로운 주소를 받았을 경우
            oData.zipcode = this.htNewAddress.sZip;
            oData.addr1 = this.htNewAddress.sAddress;
            oData.addr1_street = this.htNewAddress.sStreet;
        }

        if(this.validateAddress(oData)){
            $.ajax({
                type : "POST",
                url :TMON.wearDelivery.htAPI.changeAddr,
                dataType : "json",
                data : oData,
                context : this,
                success : $.proxy(this.changeAddress, this),
                error : function(){
                    //this.welDimmed.fadeOut();
                    alert("잠시 후 다시 시도해 주세요.");
                }
            });
        }
    },

    /**
     * 배송지정보 입력값 검증
     * @returns {boolean}
     */
    validateAddress : function(oData){
        var phoneNumber = [oData.hp1, oData.hp2, oData.hp3].join("");
        var isCorrectPhoneNumber = /[0-9]/g.test(phoneNumber) && (phoneNumber.length === 10 || phoneNumber.length === 11 || phoneNumber.length == 12) && oData.hp3.length === 4;
        var isAddressWritten = $.trim(oData.addr1).length > 0 && $.trim(oData.addr2).length > 0;
        var isCorrectAddress = !/[\'\"\<\>\\]+/g.test(oData.addr2);

        if(!oData.delivery_name){
            alert("배송지 정보의 수령인을 입력해 주세요.");
            return false;
        }else if(!isCorrectPhoneNumber){
            alert("휴대폰 정보를 확인해 주세요.");
            return false;
        }else if(!isAddressWritten){
            alert("배송지 주소를 입력해 주세요.");
            return false;
        }else if(!isCorrectAddress){
            alert("배송지주소에 사용불가문자(', \", <, >, \\)가 있습니다.");
            return false;
        }else{
            return true;
        }
    },

    changeAddress : function(res) {
        var data = JSON.parse(res.data);

        if(data.ret === "OK") {
            var addressTemplate = Handlebars.compile("({{zipcode}}) {{addr1}} {{addr2}}{{#if addr1_street}}<br>도로명주소: {{addr1_street}} {{addr2}}{{/if}}");

            this.welInfoName.text(data.name);
            this.welInfoPhone.text(data.phone);
            this.welInfoAddress.html(addressTemplate(data));

            if(data.delivery_msg.length > 0) {
                this.welInfoMemo.text(data.delivery_msg);
                this.welInfoMemoWrap.show();
            } else {
                this.welInfoMemoWrap.hide();
                this.welInfoMemo.text("");
            }

            this.welDeliveryInfoEdit.hide();
            this.welDeliveryInfo.show();
        } else {
            alert("잠시 후 다시 시도해 주세요.");
        }
    },


    showFindAddress : function(){
        this.oZipCode.show();
    },

    afterSelectAddress : function(htAddress){
        this.welInputZipcode.val(htAddress.sZip); // 우편번호 업데이트
        this.welInputAddressFirst.val(htAddress.sStreet ? htAddress.sStreet : htAddress.sAddress); // 주소 업데이트
        this.htNewAddress = htAddress;
    }
};
