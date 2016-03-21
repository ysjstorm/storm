var claimSelect = function() {
	this.init();
};

claimSelect.prototype = {
	init: function() {
		this.cacheElement();
		this.setEvent();
	},

	cacheElement: function() {
		this._mainBuySrl = $('#mainBuySrl').val();
		this._mainDealSrl = $('#mainDealSrl').val();
		this._dealType = $('#dealType').val();
		this._claimStatus = $('#claimStatus').val();
		this._claimType = $('#claimType').val();
		this._allListYn = $('#allListYn').val();
		this._productType = $('#productType').val();
		this._wholeRefund = $('#wholeRefund').val();
		this._partRefund = $('#partRefund').val();

		this._btnSubmit = $('#__btn_submit');
		this._btnCancel = $('#__btn_cancel');

		this._selCount = $('select[name="selCount"]');
		this.bIsSubmitted = false;
	},

	setEvent: function() {
		this._btnSubmit.on('click', $.proxy(this._onClickBtnSubmit, this));
		this._btnCancel.on('click', $.proxy(this._onClickBtnCancel, this));
	},

	validate: function() {
		if (this._selCount.length > 0) {
			if (this._selCount.find('option:selected[value=""]').length == this._selCount.length) {
				alert('수량을 선택해주세요.');
				return false;
			}

			if (this._claimType == "R" && this._partRefund == "N") {
				for(var i= 0, max=this._selCount.length; i<max; i++){
					if(this._selCount.eq(i).val() != this._selCount.eq(i).find("option:last").val()){
						alert("편의점 픽업 주문의 부분환불은 상품을 수취하신 이후에만 가능합니다.");
						return false;
					}
				}
			}
		}
		return true;
	},

	submitSelect: function() {
		if (!this.bIsSubmitted) {
			return;
		}

		var sActionUrl = '';
		switch (this._claimType) {
			case 'C':
				sActionUrl = '/m/mytmon/receiveClaimCancel';
				break;
			case 'R':
				if (this._dealType == 'D') {
					sActionUrl = '/m/mytmon/receiveClaimForDelivery';
				} else {
					sActionUrl = '/m/mytmon/receiveClaimForTicket';
				}
				break;
			case 'X':
				sActionUrl = '/m/mytmon/receiveClaimForDelivery';
				break;
		}
		var params= "?mainBuySrl=" + this._mainBuySrl
			+ "&mainDealSrl=" + this._mainDealSrl
			+ "&claimType=" + this._claimType
			+ "&claimStatus=" + this._claimStatus
			+ "&dealType=" + this._dealType
			+ "&allListYn=" + this._allListYn
			+ "&viewMode=" + TMON.view_mode
			+ "&view_mode=" + TMON.view_mode;
		var $ch = this._selCount.find('option:selected[value!=""]');
		for (var i=0; i<$ch.length; i++) {
			params += '&deals=' + $($ch[i]).parent().attr('id').replace('cq_','') + '&counts=' + $ch[i].value;
		}
		if ($ch.length == 1) {
			params += "&method=direct";
			params += "&selectedDeal=" + $ch.parent().attr('id').replace('cq_','');
		} else {
			params += "&method=";
			params += "&selectedDeal=0";
		}
		document.location.href = sActionUrl + params;
	},

	submitGroupSelect: function() {
		if (!this.bIsSubmitted) {
			return;
		}

		var sActionUrl = '';
		switch (this._claimType) {
			case 'C':
				sActionUrl = '/m/mytmon/receiveClaimGroupCancel';
				break;
			case 'R':
				sActionUrl = '/m/mytmon/receiveClaimGroupForDelivery';
				break;
			case 'X':
				sActionUrl = '/m/mytmon/receiveClaimGroupForDelivery';
				break;
		}
		var params= "?mainBuySrl=" + this._mainBuySrl
			+ "&mainDealSrl=" + this._mainDealSrl
			+ "&deliveryGroupSrl=" + $('#deliveryGroupSrl').val()
			+ "&claimType=" + this._claimType
			+ "&claimStatus=" + this._claimStatus
			+ "&dealType=" + this._dealType
			+ "&allListYn=" + this._allListYn
			+ "&viewMode=" + TMON.view_mode
			+ "&view_mode=" + TMON.view_mode
			+ "&productType=" + this._productType;
		var $ch = this._selCount.find('option:selected[value!=""]');
		for (var i=0; i<$ch.length; i++) {
			params += '&deals=' + $($ch[i]).parent().attr('id').replace('cq_','') + '&counts=' + $ch[i].value;
		}
		if ($ch.length == 1) {
			params += "&method=direct";
			params += "&selectedDeal=" + $ch.parent().attr('id').replace('cq_','');
		} else {
			params += "&method=";
			params += "&selectedDeal=0";
		}
		document.location.href = sActionUrl + params;
	},

	_onClickBtnSubmit: function(obj) {
		if (!this.bIsSubmitted) {
			this.bIsSubmitted = true;
			var that = this;
			setTimeout(function(){
				that.bIsSubmitted = false;
			}, 3000);

			var method = this._btnSubmit.data('method');
			if (this[method]) {
				if (this.validate()) {
					(this[method])(this);
				}
			} else {
				console.log(method + ' is not found');
			}
		}
	},

	_onClickBtnCancel: function(obj) {
		// 앱에서는 웹뷰가 새로 떠서 select를 호출하므로 닫아준다.
		if (TMON.view_mode == 'app') {
			TMON.app.callApp('webview', 'closeWebView', true);
		} else {
			window.history.back();
		}
	}
};
