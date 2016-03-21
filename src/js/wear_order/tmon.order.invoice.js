/**
 * 상품 발송 요청 메인
 * @constructor
 */
var invoice = function(){
	this.init();
};

invoice.prototype = {
    ADDRESS2_MAX_BYTE : 150, // 상세 주소 최대 150byte

	init: function() {
        this.oZipCode = new zipCode(this);
		this.cacheElement();
		this.setEvent();
		this.initMemoCounter();
	},

	cacheElement: function() {
        this.welWin = $(window);
        this.welNewAddress = $("#_newAddressInput");
        this.welForm = $("#_tnSend");
        this.welAgree = $("#_agreeInfo");// 개인정보 3자 제공 동의 체크박스
        this.welAddressItem = $("section.addr_box");
        this.welMemo = $("#shippingMemo");

        this.welLayerSafety = $("#_layerSafetyNumber"); // 안심번호 안내 레이어
	},

	setEvent: function(){
        $("#_showFindAddressLayer").click($.proxy(this.onClickShowAddressLayer, this)); // 우편번호 검색 레이어
        $("#postCode").focus($.proxy(this.onClickShowAddressLayer, this)); // 우편번호 검색 레이어
        $("#receiveAddr").focus($.proxy(this.onClickShowAddressLayer, this)); // 우편번호 검색 레이어
        $("#_submit").click($.proxy(this.onSubmit, this));
        this.welLayerSafety.on("click", ".btn_detail_cancel", $.proxy(this.hideSafeNumberLayer, this));
        $("#_showGuide").click($.proxy(this.showSafeNumberLayer, this));
	},

    showSafeNumberLayer : function(){
        this.welLayerSafety.show();
    },

    hideSafeNumberLayer : function(){
        this.welLayerSafety.hide();
    },

	initMemoCounter : function(){
        new textCounter($("#shippingMemo"), $("#_memoCounter"), 50); // 배송 메모
        new textCounter($("#receiveAddr2"), null, this.ADDRESS2_MAX_BYTE, true); // 주소 상세
	},

    /**
     * 우편번호 검색 레이어 보기 클릭시
     */
    onClickShowAddressLayer : function(){
        this.oZipCode.show();
    },

    checkValidate : function(){
        var sErrorMsg = "";
        var welTarget = null;

        var welSelectedAddress = this.welAddressItem.find("input[type=radio]:checked").parents("section:first");
        var bIsNewAddress = welSelectedAddress.hasClass("_newAddressInput");

        if(bIsNewAddress && this.welNewAddress.find("#receiveName").val() == "") {
            sErrorMsg = "수령인 이름을 입력해 주세요.";
            welTarget = this.welNewAddress.find("#receiveName");
        }else if(bIsNewAddress && this.welNewAddress.find("#receiveNumber2").val() == ""){
            sErrorMsg = "연락처를 입력해 주세요.";
            welTarget = this.welNewAddress.find("#receiveNumber2");
        }else if(bIsNewAddress && this.welNewAddress.find("#receiveNumber3").val() == ""){
            sErrorMsg = "연락처를 입력해 주세요.";
            welTarget = this.welNewAddress.find("#receiveNumber3");
        }else if(bIsNewAddress && this.welNewAddress.find("#postCode").val() == ""){
            sErrorMsg = "주소를 입력해 주세요.";
            welTarget = this.welNewAddress.find("#postCode");
        }else if(bIsNewAddress && this.welNewAddress.find("#receiveAddr2").val() == ""){
            sErrorMsg = "상세주소를 입력해 주세요.";
            welTarget = this.welNewAddress.find("#receiveAddr2");
        }else if(this.welAgree.prop("checked") == false){ // 게인정보 3자 제공 동의 체크
            sErrorMsg = "개인정보 제3자 제공에 동의에 체크해 주세요.";
            welTarget = this.welAgree;
        }else if(!bIsNewAddress && welSelectedAddress.attr("data-addr2").byte() > this.ADDRESS2_MAX_BYTE){
            sErrorMsg = "상세주소는 " + Math.floor(this.ADDRESS2_MAX_BYTE/2) + "글자("+ this.ADDRESS2_MAX_BYTE +"byte)이하만 입력 가능합니다.";
            this.showNewAddressAndFillWithSelected();
            welTarget = this.welNewAddress.find("#receiveAddr2");
        }

        if(sErrorMsg){
            alert(sErrorMsg);
            this.welWin.scrollTop(welTarget.offset().top - 20); // 해당 엘리먼트로 스크롤
            return false;
        }

        return true;
    },

    showNewAddressAndFillWithSelected : function(){
        var welSelectedAddress = this.welAddressItem.find("input[type=radio]:checked").parents("section:first");
        this.welNewAddress.find("input[type=radio]").prop("checked", true);

        this.welNewAddress.find("#receiveName").val(welSelectedAddress.attr("data-name"));
        var aPhone = welSelectedAddress.attr("data-phone").split("-");
        this.welNewAddress.find("#receiveNumber").val(aPhone[0]);
        this.welNewAddress.find("#receiveNumber2").val(aPhone[1]);
        this.welNewAddress.find("#receiveNumber3").val(aPhone[2]);

        this.welNewAddress.find("#postCode").val(welSelectedAddress.attr("data-zip"));
        var sAddress = welSelectedAddress.attr("data-addrstreet") ? welSelectedAddress.attr("data-addrstreet") : welSelectedAddress.attr("data-addr");
        this.welNewAddress.find("#receiveAddr").val(sAddress);
        this.welNewAddress.find("#receiveAddr2").val(welSelectedAddress.attr("data-addr2"));

        this.htNewAddress = {
            sZip : welSelectedAddress.attr("data-zip"),
            sAddress : welSelectedAddress.attr("data-addr"),
            sStreet : welSelectedAddress.attr("data-addrstreet")
        };
    },

    onSubmit : function(){
        if(this.checkValidate() == false){
            return;
        }

        this.fillFormData();
        this.welForm.submit();
    },

    fillFormData : function(){
        var el = this.welForm.get(0);

        var welSelectedAddress = this.welAddressItem.find("input[type=radio]:checked").parents("section:first");
        var bIsNewAddress = welSelectedAddress.hasClass("_newAddressInput");

        if(bIsNewAddress){
            el.name.value = this.welNewAddress.find("#receiveName").val();
            el.phone.value = this.welNewAddress.find("#receiveNumber").val() + "-" + this.welNewAddress.find("#receiveNumber2").val() + "-" + this.welNewAddress.find("#receiveNumber3").val();
            el.zipcode.value = this.htNewAddress.sZip;
            el.addr1.value = this.htNewAddress.sAddress;
            el.addr1_street.value = this.htNewAddress.sStreet;
            el.addr2.value = this.welNewAddress.find("#receiveAddr2").val(); // 상세 주소
            el.is_safe_phone.value = $("#securityNumChk").prop("checked") ? "Y" : "N"; // 안심 번호 사용
        }else{
            el.name.value = welSelectedAddress.attr("data-name");
            el.phone.value = welSelectedAddress.attr("data-phone");
            el.zipcode.value = welSelectedAddress.attr("data-zip");
            el.addr1.value = welSelectedAddress.attr("data-addr");
            el.addr1_street.value = welSelectedAddress.attr("data-addrstreet");
            el.addr2.value = welSelectedAddress.attr("data-addr2");
        }

        el.delivery_msg.value = this.welMemo.val();
    },

    afterSelectAddress : function(htData){
        this.htNewAddress = htData;
        this.welAddressItem.find("#postCode").val(htData.sZip);
        this.welAddressItem.find("#receiveAddr").val(htData.sStreet ? htData.sStreet : htData.sAddress);
    }

};