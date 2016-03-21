var claimRefundAccount = function(){
    this.init();
};

claimRefundAccount.prototype = {

    _isAccountValidated : false,
    _isValidatingAccount : false,

    init : function(){
        this.cacheElement();
        this.setEvent();
    },

    cacheElement : function(){
        this._welBody = $("body");
        this._welRegistAccount = $("#_regist_account");
        this._welDimmed = this._welRegistAccount.find("#dimmed2");
        this._welBtnRegist = this._welRegistAccount.find(".__btn_regist");

        this._welLayerRefund = this._welRegistAccount.find("#_layer_refund");
        this._welBtnCloseRefund = this._welLayerRefund.find(".__btn_close");

        this._welLayerRegist = this._welRegistAccount.find("#_layer_regist");
        this._welBtnShowRefund = this._welRegistAccount.find(".__btn_show_refund");
        this._welBtnCloseRegist = this._welLayerRegist.find(".__btn_close");
        this._welBtnAccountCheck = this._welLayerRegist.find(".__btn_acc_check");
        this._welBtnDoneRegist = this._welLayerRegist.find(".__btn_done");

        this._welSelectBank = this._welLayerRegist.find("#acc_bank");
        this._welInputAccountNumber = this._welLayerRegist.find("#acc_number");
        this._welInputAccountOwner = this._welLayerRegist.find("#acc_owner");
        this._welCheckBoxDefault = this._welLayerRegist.find("#acc_default");
    },

    setEvent : function(){
        this._welDimmed.on("click", $.proxy(this._onClickDimmed, this));
        this._welBtnRegist.on("click", $.proxy(this._onClickBtnRegist, this));

        this._welBtnCloseRegist.on("click", $.proxy(this._onClickBtnCloseRegist, this));
        this._welBtnShowRefund.on("click", $.proxy(this._onClickBtnShowRefund, this));
        this._welBtnAccountCheck.on("click", $.proxy(this._onClickBtnAccountCheck, this));
        this._welBtnDoneRegist.on("click", $.proxy(this._onClickBtnDoneRegist, this));

        this._welBtnCloseRefund.on("click", $.proxy(this._onClickBtnCloseRefund, this));
    },

    /**
     * 딤드 클릭시 레이어 제거
     */
    _onClickDimmed : function(we){
        we.preventDefault();
        this._welDimmed.hide();
        this._welLayerRegist.hide();
        this._welLayerRefund.hide();
    },

    /**
     * 환불계좌 등록하기 버튼 클릭시 레이어 노출
     */
    _onClickBtnRegist : function(we){
        we.preventDefault();
        this._welDimmed.show();
        this._welLayerRegist.css("top", this._welBody.scrollTop() + 100).show();
    },

    /**
     * 환불계좌 등록 레이어 닫기
     */
    _onClickBtnCloseRegist : function(we){
        we.preventDefault();
        this._welLayerRegist.hide();
        this._welDimmed.hide();
    },

    /**
     * 환불내역 레이어 열기
     */
    _onClickBtnShowRefund : function(we){
        we.preventDefault();
        this._welLayerRegist.hide();
        this._welLayerRefund.css("top", this._welBody.scrollTop() + 100).show();
    },

    /**
     * 환불내역 레이어 닫기
     */
    _onClickBtnCloseRefund : function(we){
        we.preventDefault();
        this._welLayerRefund.hide();
        this._welLayerRegist.css("top", this._welBody.scrollTop() + 100).show();
    },

    /**
     * 계좌인증
     */
    _onClickBtnAccountCheck : function(we){
        var kcpCode = this._welSelectBank.val();
        var accountNumber = this._welInputAccountNumber.val();
        var accountOwner = this._welInputAccountOwner.val();
        var oData = {
            kcpCode : kcpCode,
            accountNumber : accountNumber,
            accountOwner : accountOwner
        };

        we.preventDefault();

        if(this._isValidatingAccount){
            alert("계좌 인증 진행중입니다.");
            return false;
        }

        if(this._isAccountValidated){
            alert("계좌인증이 완료되었습니다. 입력완료 버튼을 눌러주세요.");
            return false;
        }

        if(this._validateAccountInfo()){
            $.ajax({
                url : TMON.claim.htAPI.accountCheck,
                type : "POST",
                data : oData,
                context : this,
                beforeSend : function(){
                    this._welSelectBank.attr("disabled", true);
                    this._welInputAccountNumber.attr("disabled", "disabled");
                    this._welInputAccountOwner.attr("disabled", "disabled");
                    this._welCheckBoxDefault.attr("disabled", "disabled");
                    this._isValidatingAccount = true;
                },
                success : function(res){
                    var data = res.data;

                    if (data.ret == "OK") {
                        alert("계좌인증이 완료되었습니다.");
                        this._isAccountValidated = true;
                    } else if (data.ret == "NOK") {
                        this._welSelectBank.removeAttr("disabled");
                        this._welInputAccountNumber.removeAttr("disabled");
                        this._welInputAccountOwner.removeAttr("disabled");
                        this._welCheckBoxDefault.removeAttr("disabled");

                        alert("입력하신 정보가 정확하지 않아 계좌인증에 실패하였습니다.");
                    }

                    this._isValidatingAccount = false;
                },
                error : function(res){
                    alert("계좌인증 도중 오류가 발생했습니다. 다시 시도해주세요.");
                    this._isValidatingAccount = false;
                }
            });
        }
    },

    /**
     * 입력값 검증
     * @returns {boolean}
     */
    _validateAccountInfo : function(){
        var kcpCode = this._welSelectBank.val();
        var accountNumber = parseInt(this._welInputAccountNumber.val(), 10);
        var accountOwner = this._welInputAccountOwner.val();
        var hasKcpCode = kcpCode.length > 0;
        var hasAccountNumber = accountNumber > 0;
        var hasAccountOwner = accountOwner.length > 0;
        var isAccountDefaultChecked = this._welCheckBoxDefault.prop("checked");

        if(!hasKcpCode){
            alert("은행을 선택해주세요.");
            this._welSelectBank.focus();
            return false;
        }else if(isNaN(accountNumber)){
            alert("계좌번호는 숫자만 입력해주세요.");
            this._welInputAccountNumber.focus();
            return false;
        }else if(!hasAccountNumber){
            alert("계좌번호를 입력해주세요.");
            this._welInputAccountNumber.focus();
            return false;
        }else if(!hasAccountOwner){
            alert("예금주를 입력해주세요.");
            this._welInputAccountOwner.focus();
            return false;
        }else if (!isAccountDefaultChecked){
            alert("기본 환불계좌설정에 동의해주세요.");
            this._welCheckBoxDefault.focus();
            return false;
        }else if (this._isValidatingAccount){
            alert("계좌인증 진행 중입니다.");
            return false;
        }else{
            return true;
        }
    },

    /**
     * 입력완료
     */
    _onClickBtnDoneRegist : function(we){
        var bankId = this._welSelectBank.find(":selected").data("bankId");
        var kcpCode = this._welSelectBank.val();
        var accountNumber = this._welInputAccountNumber.val();
        var accountOwner = this._welInputAccountOwner.val();
        var oData = {
            bankId : bankId,
            kcpCode : kcpCode,
            accountNumber : accountNumber,
            accountOwner : accountOwner
        };

        we.preventDefault();

        if(!this._isAccountValidated){
            alert("계좌번호 인증을 하셔야 합니다.");
            return false;
        }

        if(this._validateAccountInfo()){
            $.ajax({
                url : TMON.claim.htAPI.accountCheckProc,
                type : "POST",
                data : oData,
                success : function(res){
                    var data = res.data;

                    if (data.ret === "OK") {
                        alert("계좌정보가 입력되었습니다.");
                        window.location.reload();
                    } else if (data.ret === "NOK") {
                        alert(data.msg);
                    } else if (data.ret === "CK") {
                        alert("계좌번호 인증성공");
                    } else if (data.ret === "NCK") {
                        alert(data.msg);
                    }
                },
                error : function(res){
                    alert("계좌번호 저장 도중 오류가 발생했습니다. 다시 시도해주세요.");
                    this._isValidatingAccount = false;
                    this._isAccountValidated = false;
                }
            });
        }
    }
};
