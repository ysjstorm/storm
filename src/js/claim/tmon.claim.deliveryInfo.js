var claimDeliveryInfo = function(selectorOptions){
    this.init(selectorOptions);
};

claimDeliveryInfo.prototype = {

    wrapText : null,
    btnEdit : null,
    textName : null,
    textPhone : null,
    textAddress : null,
    wrapMemo : null,
    textMemo : null,
    textNotice : null,
    wrapEdit : null,
    btnCancel : null,
    btnSave : null,
    btnZipcode : null,
    inputName : null,
    selectPhoneFirst : null,
    inputPhoneSecond : null,
    inputPhoneThird : null,
    inputZipcode : null,
    inputAddressFirst : null,
    inputAddressSecond : null,
    wrapTextStreetAddress : null,
    textAddressFirst : null,
    textAddressSecond : null,
    textareaMemo : null,
    memoCount : null,
    dimmed : null,

    init : function(selectorOptions){
        $.extend(this, selectorOptions);

        // 우편번호 레이어 초기화
        this._oSearchZipcode = new claimSearchZipcode();

        this.cacheElement();
        this.setEvent();

        this._initMemotextCounter();
    },

    cacheElement : function(){
        // 배송지 정보
        this._welDeliveryInfo = $(this.wrapText);
        this._welBtnShowAddress = this._welDeliveryInfo.find(this.btnEdit);
        this._welInfoName = this._welDeliveryInfo.find(this.textName);
        this._welInfoPhone = this._welDeliveryInfo.find(this.textPhone);
        this._welInfoAddress = this._welDeliveryInfo.find(this.textAddress);
        this._welInfoMemoWrap = this._welDeliveryInfo.find(this.wrapMemo);
        this._welInfoMemo = this._welDeliveryInfo.find(this.textMemo);
        this._welInfoNotice = this._welDeliveryInfo.find(this.textNotice);

        // 배송지 정보 수정
        this._welDeliveryInfoEdit = $(this.wrapEdit);
        this._welBtnCloseAddress = this._welDeliveryInfoEdit.find(this.btnCancel);
        this._welBtnSaveAddress = this._welDeliveryInfoEdit.find(this.btnSave);
        this._welBtnZipcode = this._welDeliveryInfoEdit.find(this.btnZipcode);
        this._welInputName = this._welDeliveryInfoEdit.find(this.inputName);
        this._welInputPhoneFirst = this._welDeliveryInfoEdit.find(this.selectPhoneFirst);
        this._welInputPhoneSecond = this._welDeliveryInfoEdit.find(this.inputPhoneSecond);
        this._welInputPhoneThird = this._welDeliveryInfoEdit.find(this.inputPhoneThird);
        this._welInputZipcode = this._welDeliveryInfoEdit.find(this.inputZipcode);
        this._welInputAddressFirst = this._welDeliveryInfoEdit.find(this.inputAddressFirst);
        this._welInputAddressSecond = this._welDeliveryInfoEdit.find(this.inputAddressSecond);
        this._welTextStreetAddress = this._welDeliveryInfoEdit.find(this.wrapTextStreetAddress);
        this._welTextAddressFirst = this._welDeliveryInfoEdit.find(this.textAddressFirst);
        this._welTextAddressSecond = this._welDeliveryInfoEdit.find(this.textAddressSecond);
        this._welTextAreaMemo = this._welDeliveryInfoEdit.find(this.textareaMemo);
        this._welMemoCount = this._welDeliveryInfoEdit.find(this.memoCount);

        this._welDimmed = $(this.dimmed);
    },

    setEvent : function(){
        this._welBtnShowAddress.on("click", $.proxy(this._onClickBtnShowAddress, this));
        this._welBtnCloseAddress.on("click", $.proxy(this._onClickBtnCloseAddress, this));
        this._welBtnSaveAddress.on("click", $.proxy(this._onClickBtnSaveAddress, this));
        this._welBtnZipcode.on("click", $.proxy(this._oSearchZipcode.showLayer, this._oSearchZipcode));
        this._welInputAddressSecond.on("keyup", $.proxy(this._onKeyupInputAddressSecond, this));

        // 레이어에서 주소 검색결과 선택시 이벤트로 처리
        // 도로명 주소 : clickStreetZipcode
        // 지번 주소 : clickNumberZipcode
        this._oSearchZipcode.zipcode.on("clickNumberZipcode", $.proxy(this._onNumberZipcodeSelected, this));
        this._oSearchZipcode.zipcode.on("clickStreetZipcode", $.proxy(this._onStreetZipcodeSelected, this));
    },

    /**
     * textCounter 플러그인을 이용해서 배송메모 글자수 제한
     */
    _initMemotextCounter : function(){
        if(this._welDeliveryInfoEdit.length > 0){
            var nInitialLength = this._welTextAreaMemo.val().length;

            this._welMemoCount.html(nInitialLength);
            new textCounter(this._welTextAreaMemo, this._welMemoCount, 50);
        }
    },

    /**
     * 수정 버튼 클릭
     */
    _onClickBtnShowAddress : function(){
        this._welDeliveryInfo.hide();
        this._welDeliveryInfoEdit.show();
    },

    /**
     * 수정 상태에서 취소 버튼 클릭
     */
    _onClickBtnCloseAddress : function(){
        this._welDeliveryInfoEdit.hide();
        this._welDeliveryInfo.show();
    },

    /**
     * 저장 버튼 클릭시 처리
     */
    _onClickBtnSaveAddress : function(){
        var oData = {
            buy_srl : this._welBtnSaveAddress.data("buySrl"),
            delivery_msg : this._welTextAreaMemo.val(),
            delivery_name : this._welInputName.val(),
            hp1 : this._welInputPhoneFirst.val(),
            hp2 : this._welInputPhoneSecond.val(),
            hp3 : this._welInputPhoneThird.val(),
            zipcode : this._welInputZipcode.val(),
            addr1 : this._welInputAddressFirst.val(),
            addr1_street : this._welTextAddressFirst.text(),
            addr2 : this._welInputAddressSecond.val()
        };

        if(this._validateAddress(oData)){
            this._welDimmed.fadeIn();

            $.ajax({
                type : "POST",
                url : TMON.claim.htAPI.changeAddr,
                dataType : "json",
                data : oData,
                context : this,
                success : $.proxy(this._changeAddress, this),
                error : $.proxy(function(){
                    this._welDimmed.fadeOut();
                    alert("잠시 후 다시 시도해 주세요.");
                }, this)
            });
        }
    },

    /**
     * 리턴값으로 돌아온 배송지 정보로 갱신하고
     * 수정 폼을 감춤
     */
    _changeAddress : function(res){
        var data = JSON.parse(res.data);

        if (data.ret === "OK"){
            var addressTemplate = Handlebars.compile("({{zipcode}}) {{addr1}} {{addr2}}{{#if addr1_street}}<br>도로명주소: {{addr1_street}} {{addr2}}{{/if}}");

            this._welInfoName.text(data.name);
            this._welInfoPhone.text(data.phone);
            this._welInfoAddress.html(addressTemplate(data));

            if(data.delivery_msg.length > 0){
                this._welInfoMemo.text(data.delivery_msg);
                this._welInfoMemoWrap.show();
            }else{
                this._welInfoMemoWrap.hide();
                this._welInfoMemo.text("");
            }

            this._welDeliveryInfoEdit.hide();
            this._welInfoNotice.show();
            this._welDeliveryInfo.show();
        }else{
            alert("잠시 후 다시 시도해 주세요.");
        }

        this._welDimmed.fadeOut();
    },

    /**
     * 배송지정보 입력값 검증
     * @returns {boolean}
     */
    _validateAddress : function(oData){
        var phoneNumber = [oData.hp1, oData.hp2, oData.hp3].join("");
        var isCorrectPhoneNumber = /[0-9]/g.test(phoneNumber) && (phoneNumber.length === 10 || phoneNumber.length === 11 || phoneNumber.length == 12) && oData.hp3.length === 4;
        var isAddressWritten = $.trim(oData.addr1).length > 0 && $.trim(oData.addr2).length > 0;
        var isCorrectAddress = !/[\'\"\<\>\\]+/g.test(oData.addr2);
        var isCorrectAddressLen = oData.addr2.length <= 50;
        var isCorrectMemo = oData.delivery_msg.length <= 50;

        if(!isCorrectPhoneNumber){
            alert("휴대폰 정보를 확인해 주세요.");
            return false;
        }else if(!isAddressWritten){
            alert("배송지 주소를 입력해 주세요.");
            return false;
        }else if(!isCorrectAddress){
            alert("배송지 주소에 사용불가문자(', \", <, >, \\)가 있습니다.");
            return false;
        }else if(!isCorrectAddressLen){
            alert("배송지 주소는 50자 이내로 작성해 주세요.");
            return false;
        }else if(!isCorrectMemo){
            alert("배송시 요청사항은 50자 이내로 작성해 주세요.");
            this._welTextAreaMemo.focus();
            return false;
        }else{
            return true;
        }
    },

    /**
     * 도로명 주소를 입력했을 때
     * 상세주소를 입력하면 도로명주소의 상세주소도 함께 수정함
     */
    _onKeyupInputAddressSecond : function(we){
        var welInput = $(we.currentTarget);

        this._welTextAddressSecond.text(welInput.val());
    },

    /**
     * 도로명 주소 검색 후 선택되었을 때
     */
    _onStreetZipcodeSelected : function(we, data){
        this._welInputZipcode.val(data.zip1);
        this._welInputAddressFirst.val(data.addr1);
        this._welTextAddressFirst.text(data.addr1_street);
        this._welTextStreetAddress.show();
        this._welInputAddressSecond.focus();
    },

    /**
     * 지번 주소 검색 후 선택되었을 때
     */
    _onNumberZipcodeSelected : function(we, data){
        this._welInputZipcode.val(data.zip1);
        this._welInputAddressFirst.val(data.addr1);
        this._welTextStreetAddress.hide();
        this._welTextAddressFirst.html("");
        this._welTextAddressSecond.html("");
        this._welInputAddressSecond.focus();
    }
};
