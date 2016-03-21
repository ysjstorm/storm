var claimCancel = function() {
	this.init();
};

claimCancel.prototype = {
	init: function() {
		this.cacheElement();
		this.setEvent();
		this.addDeliveryCorp();
	},

	cacheElement: function() {
		this._mainBuySrl = $('#mainBuySrl').val();
		this._mainDealSrl = $('#mainDealSrl').val();
		this._allListYn = $('#allListYn').val();
		this._dealType = $('#dealType').val();
		this._claimStatus = $('#claimStatus').val();
		this._productType = $('#productType').val();

		this._chgacc = $('#chgacc');
		this._bnknm = $('#bnknm');
		this._accnm = $('#accnm');
		this._ownnm = $('#ownnm');
		this._figacc = $('#figacc');
		this._authacc = $('#authacc');
		this._bankId = '';
		this._bankKcpCode = '';
		this._bankAccName = '';
		this._bankOwnName = '';
		this._oldBankBankName = this._bnknm.val();
		this._oldBankAccName = this._accnm.val();
		this._oldBankOwnName = this._ownnm.val();
		this._hasBankAccount = ($('#__hasBankAccount').length > 0);

		this._btnSubmit = $('#__btn_submit');
		this._btnCancel = $('#__btn_cancel');
		this._btnSearchZipcode = $('#__btn_search_zipcode');
		this._btnModifyReturnPickup = $('#__btn_modify_returnpickup');
		this._btnCancelModifyReturnPickup = $('#__btn_cancel_modify_returnpickup');
		this._btnSubmitModifyReturnPickup = $('#__btn_submit_modify_returnpickup');
		this._btnCvsReturn = $('#__btn_cvs_return');
		this._btnPopupNearbyCvs = $('#__btn_popup_nearbyCvs');

		this._pickupName = $('#pickupName');
		this._pickupPhone = $('#pickupPhone');
		this._pickupPhone1 = $('#pickupPhone1');
		this._pickupPhone2 = $('#pickupPhone2');
		this._pickupPhone3 = $('#pickupPhone3');
		this._pickupZipcode = $('#pickupZipcode');
		this._pickupAddr1 = $('#pickupAddr1');
		this._pickupAddr1Street = $('#pickupAddr1Street');
		this._pickupAddr2 = $('#pickupAddr2');
		this._pickupCvsCd = $('#pickupCvsCd');
		this._pickupCvsBranchCd = $('#pickupCvsBranchCd');
		this._pickupCvsBranchNm = $('#pickupCvsBranchNm');
		this._pickupCvsTelNo = $('#pickupCvsTelNo');
		this._selPickupCorp = $('select[name="selPickupCorp"]');
		this._txtPickupNumber = $('input[name="txtPickupNumber"]');
		this._isPickupModifying = false;
		this._isSubmitForm = false;

		this._haveToAuth = false;
		this._isValidAcc = true;
		this._isAuthNow = false;
		this._selReason = $('select[name="selReason"]');
		this._txtReason = $('textarea[name="txtReason"]');
		this._rdoSendyn = $('input[name="__rdo_sendyn"]');
		this._selRefundType = $('select[name="selRefundType"]');
		this._repaymentAmount = $('#__repaymentAmount');
		this._repaymentPartnerAmount = $('#__repaymentPartnerAmount');
		this._repaymentTotalAmount = $('#__repaymentTotalAmount');
		this._repaymentCashAmount = $('#__repaymentCashAmount');
		this._repaymentPartnerCashAmount = $('#__repaymentPartnerCashAmount');
		this._repaymentTotalCashAmount = $('#__repaymentFinalCashAmount');
		this._divReturnPickupDefault = $('#__divReturnPickupDefault');
		this._divReturnPickupModify = $('#__divReturnPickupModify');
		this._divSendynWrap = $('.sendq2_wrap');
		this._divSendynYes = $('#__div_sendyn_yes');
		this._divSendynNo = $('#__div_sendyn_no');
		this._divSendynPickupInfo = $('#__div_sendyn_pickupInfo');
		this._divRefundTypeDefault = $('#__div_refundType_default');
		this._divRefundTypeHD = $('#__div_refundType_hd');
		this._divRefundTypeCV = $('#__div_refundType_cv');
		this._divRefundTypeCV2 = $('#__div_refundType_cv2');

		this._doneBtnClose = $('#cancel_dismissed_close');
		this._doneBtnConfirm = $('#cancel_dismissed');

		this._redirectUrl = '/m/mytmon/detailBuy/' + this._mainBuySrl;
		if (this._allListYn != 'Y' && this._mainDealSrl != undefined) {
			this._redirectUrl += '/' + this._mainDealSrl;
		}
		this._redirectUrl += '?view_mode=' + TMON.view_mode;

		this._memberGrade = $('#__memberGrade');
		this.bIsSubmitted = false;
	},

	setEvent: function() {
		// 환불계좌 변경하기 클릭
		this._chgacc.on('click', $.proxy(this._onClickAccount, this));
		// 은행명 변경시
		this._bnknm.on('change', $.proxy(this._onChangeBankName, this));
		// 계좌번호 변경시
		this._accnm.on('input', $.proxy(this._onChangeAccountName, this));
		// 예금주명 변경시
		this._ownnm.on('input', $.proxy(this._onChangeOwnName, this));
		// 계좌인증 버튼 클릭
		this._authacc.on('click', $.proxy(this._onClickAuthAccount, this));
		// 사유 입력
		var that = this;
		this._selReason.on('change', $.proxy(this._onChangeSelReason, this));
		this._txtReason.each(function() {
			var $this = $(this);
			$this.on('input', function() { that._onInputReason($this); });
		});
		this._selRefundType.on('change', $.proxy(this._onChangeRefundType, this));
		this._btnSubmit.on('click', $.proxy(this._onClickBtnSubmit, this));
		this._btnCancel.on('click', $.proxy(this._onClickBtnCancel, this));
		// 기타 이벤트
		this._btnModifyReturnPickup.on('click', $.proxy(this._onClickBtnModifyReturnPickup, this));
		this._btnCancelModifyReturnPickup.on('click', $.proxy(this._onClickBtnCancelModifyReturnPickup, this));
		this._btnSubmitModifyReturnPickup.on('click', $.proxy(this._onClickBtnSubmitModifyReturnPickup, this));
		this._btnCvsReturn.on('click', $.proxy(this._onClickBtnCvsReturn, this));
		this._btnPopupNearbyCvs.on('click', $.proxy(this._onClickBtnPopupNearbyCvs, this));
		this._rdoSendyn.on('change', $.proxy(this._onChangeRdoSendyn, this));
		// 완료 레이어
		this._doneAction = function() {
			if (TMON.view_mode == 'app') {
				TMON.app.callApp('webview', 'closeWebView', true);
			} else {
				window.opener.location.href = this._redirectUrl;
				window.close();
			}
		};
		this._doneBtnClose.on('click', $.proxy(this._doneAction, this));
		this._doneBtnConfirm.on('click', $.proxy(this._doneAction, this));
		// 우편번호 검색 레이어
		if (this._btnSearchZipcode.length > 0) {
			this._oSearchZipcode = new claimSearchZipcode();
			this._btnSearchZipcode.on('click', $.proxy(this._oSearchZipcode.showLayer, this._oSearchZipcode));
			this._oSearchZipcode.zipcode.on('clickNumberZipcode', $.proxy(this._onClickNumberZipcode, this));
			this._oSearchZipcode.zipcode.on('clickStreetZipcode', $.proxy(this._onClickStreetZipcode, this));
		}

		if(this._pickupZipcode.val() == ''){
			this._onClickBtnModifyReturnPickup();
		}
	},

	addDeliveryCorp: function() {
		if (this._selPickupCorp.length > 0) {
			var pickupCorps = [
				{name:'우체국택배', value:'우체국택배', url:'http://parcel.epost.go.kr'},
				{name:'한진택배', value:'한진택배', url:'http://hanex.hanjin.co.kr/'},
				{name:'CJ대한통운', value:'CJ대한통운', url:'https://www.doortodoor.co.kr/'},
				{name:'현대택배', value:'현대택배', url:'http://hlc.co.kr/personalService/tracking/06/tracking_goods.jsp'},
				{name:'로젠택배', value:'로젠택배', url:'http://www.ilogen.com/d2d/delivery/invoice_search.jsp'},
				{name:'KGB택배', value:'KGB택배', url:'http://www.kgbls.co.kr/sub5/sub5_1.asp'},
				{name:'옐로우캡택배', value:'옐로우캡택배', url:'https://www.yellowcap.co.kr/custom/custom03.jsp'},
				{name:'일양택배', value:'일양택배', url:'https://www.ilyanglogis.com/functionality/tracking.asp'},
				{name:'천일택배', value:'천일택배', url:'http://www.cyber1001.co.kr/kor/taekbae/main.jsp '},
				{name:'경동택배', value:'경동택배', url:'http://www.kdexp.com/sub3_shipping.asp'},
				{name:'등기우편', value:'등기우편', url:'http://parcel.epost.go.kr'},
				{name:'GTX로지스', value:'GTX로지스', url:'http://www.gtxlogis.co.kr/gtxlogis/index.html'},
				{name:'KG로지스', value:'KG로지스', url:'http:/www.kglogis.co.kr/delivery/delivery_result.jsp'}
			];
			var that = this;
			$(pickupCorps).each(function(){
				$('<option value="' + this.value + '">' + this.name + '</option>').appendTo(that._selPickupCorp);
			});
		}
	},

	calRepaymentAmount: function() {
		var returnValue = true;
		var totalCount = this._selReason.length;
		var noneCount = 0;
		var buyerCount = 0;
		var partnerCount = 0;
		var logisticsCount = 0;
		var showInfo = '#__whoReason_default';
		this._selReason.each(function() {
			var whoReason = $(this).find('option:selected').data('whoReason');
			if (whoReason != undefined) {
				switch (whoReason) {
					case 'buyer': buyerCount++; break;
					case 'partner': partnerCount++; break;
					case 'logistics': logisticsCount++; break;
				}
			} else {
				noneCount++;
			}
		});
		if (noneCount == 0) {
			var isBuyerImpute = (buyerCount == totalCount);
			// 사유 모두 선택시 (기획상 사유가 모두 구매자 귀책일때만 #__whoReason_buyer 노출)
			showInfo = (isBuyerImpute ? '#__whoReason_buyer' : '#__whoReason_partner');

			// 환불예정액 존재시 노출
			if (this._repaymentAmount.length > 0) {
				var partnerAmount = parseInt(this._repaymentPartnerAmount.val());
				var partnerCashAmount = parseInt(this._repaymentPartnerCashAmount.val());
				var totalAmount = (isBuyerImpute ? parseInt(this._repaymentAmount.val()) : partnerAmount);
				var totalCashAmount = (isBuyerImpute ? parseInt(this._repaymentCashAmount.val()) : partnerCashAmount);

				if (totalAmount < 0) {
					alert('취소 금액보다 추가 비용이 많아 요청이 불가능 합니다.\n상세한 내용은 고객센터(1544-6240)으로 문의해 주세요.');
					this._selReason.val('');
					this._repaymentTotalAmount.html(0);
					showInfo = '#__whoReason_default';
					returnValue = false;
				} else {
					// 환불예정액이 0원 이상일 경우 (0원 환불포함)
					this._repaymentTotalAmount.html($.number_format(totalAmount, {precision: 0}));
					this._repaymentTotalCashAmount.val(totalCashAmount);
				}
			}
		} else {
			if (this._repaymentAmount.length > 0) {
				this._repaymentTotalAmount.html(0);
			}
		}
		$('#__whoReason_default').hide();
		$('#__whoReason_buyer').hide();
		$('#__whoReason_partner').hide();
		$('#__whoReason_logistics').hide();
		$(showInfo).show();
		return returnValue;
	},

	displayChangeZipcodeInfo: function() {
		this._divSendynPickupInfo.show(); // 반품수거지 정보 추가

		// 반품수거지 정보 노출시 새 우편번호 변경 안내 레이어 노출
		/* 팝업노출 종료(PLP-2055)
		 var zip = $('#pickupZipcode');
		 if (zip.length > 0 && !zip.val().match(/^[0-9]{5}$/)) {
		 var that = this;
		 TMON.claim.util.openHtmlLayer('#__ly_chg_zipcode', function(){
		 that._btnModifyReturnPickup.click(); // 반품수거지 정보 수정버튼 클릭
		 });
		 }*/
	},

	validate: function() {
		if (this._selReason.length > 0) {
			if (this._selReason.find('option:selected[value=""]').length > 0) {
				alert('사유를 선택해주세요.');
				this._selReason.focus();
				return false;
			} else {
				var objSelReason = this._selReason.find('option:selected');
				for (var i = 0; i < objSelReason.length; i++) {
					if (objSelReason[i].innerHTML == '기타') {
						var objTxtReason = $(objSelReason[i]).parent().parent().find('.rsn_wrap .cl_txtarea');
						if (objTxtReason.val() == '') {
							alert('상세 사유를 반드시 입력해주세요.');
							objTxtReason.focus();
							return false;
						}
					}
				}
			}
		}
		if (this._isPickupModifying) {
			alert('반품 수거지 정보 입력을 완료해주세요.');
			return false;
		}
		if (this._rdoSendyn.length > 0) {
			var rdoSendYn = $('input[name="__rdo_sendyn"]:checked');
			if (rdoSendYn.val() == undefined) {
				alert('상품 전달 여부를 선택해주세요.');
				this._rdoSendyn.focus();
				return false;
			} else if (rdoSendYn.val() == 'Y') {
				if (this._selPickupCorp.val() != '') {
					if (this._txtPickupNumber.val() != undefined) {
						if (this._txtPickupNumber.val() == '') {
							alert('운송장 번호를 숫자로만 입력해주세요.');
							this._txtPickupNumber.focus();
							return false;
						} else if (!this._txtPickupNumber.val().match(/^[0-9]*$/)) {
							alert('운송장 번호는 숫자로만 입력해주세요.');
							this._txtPickupNumber.focus();
							return false;
						} else {
							var result = TMON.claim.util.checkValidateDeliveryNumber(this._selPickupCorp.val(), this._txtPickupNumber.val());
							switch (result) {
								case 'ERROR':
									alert('진행중 오류가 발생했습니다. 다시 한 번 시도해주세요.');
									return false;
								case 'NOK':
									alert('형식에 맞지 않는 운송장 번호입니다. 다시 한 번 확인해주세요.');
									return false;
							}
						}
					}
				} else {
					alert('택배사를 선택해주세요.');
					this._txtPickupNumber.val('');
					this._selPickupCorp.focus();
					return false;
				}
			} else {
				this._selPickupCorp.val('');
				this._txtPickupNumber.val('');
				if (this._selRefundType.length > 0 && this._selRefundType.val() == '') {
					alert('반품 방법을 선택해주세요.');
					this._selRefundType.focus();
					return false;
				}
			}
		}
		return true;
	},

	submitForm: function(saveCallback, that) {
		if (that._isSubmitForm == false) {
			// validate
			if (that.calRepaymentAmount() == false) {
				return false;
			}
			// 최종 submit
			that._isSubmitForm = true;
			setTimeout(function(){ that._isSubmitForm = false; }, 3000);
			var sActionUrl = (saveCallback)(that)
					+ '&viewMode=' + TMON.view_mode + '&view_mode=' + TMON.view_mode;
			// 폼에 undefined 값 제거
			sActionUrl = sActionUrl.replace(/(undefined)/g, '');

			//console.log('sActionUrl = ' + sActionUrl);
			//console.log('sRedirectUrl = ' + that._redirectUrl);
			TMON.claim.util.openCancelDoneLayer(sActionUrl, that._redirectUrl);
		}
	},

	updateAccountBeforeSave: function(saveCallback, that) {
		if (that._isValidAcc && !that._haveToAuth) {
			if (that._chgacc.length > 0 && !that._chgacc.is(':checked')) {
				that.submitForm(saveCallback, that);
			} else {
				if (that._bnknm.val() == '') {
					alert('환불 받으실 은행을 선택해주세요.');
					that._bnknm.focus();
					return false;
				} else if (that._accnm.val() == '') {
					alert('환불 받으실 계좌번호를 입력해주세요.');
					that._accnm.focus();
					return false;
				} else if (that._ownnm.val() == '') {
					alert('환불 받으실 예금주명을 입력해주세요.');
					that._ownnm.focus();
					return false;
				} else {
					if (that._figacc.is(':checked')) {
						// 환불계좌 업데이트
						$.ajax({
							type: 'POST',
							url: TMON.claim.htAPI.accountCheckProc,
							dataType: 'json',
							data: {
								bankId: that._bankId,
								kcpCode: that._bankKcpCode,
								accountNumber: that._bankAccName,
								accountOwner: that._bankOwnName
							},
							success: function(r) {
								if (r.data.ret == 'OK') {
									that.submitForm(saveCallback, that);
								} else {
									alert(r.data.msg);
								}
							},
							error: function(xhr, status, error) {
								alert('계좌 인증에 실패했습니다. 다시 한 번 시도해주세요.');
							}
						});
					} else {
						alert('기본 환불계좌 설정에 동의해주세요.');
						that._figacc.focus();
						return false;
					}
				}
			}
		} else {
			alert('계좌 인증이 필요합니다.');
			return false;
		}
		return false;
	},

	submitCancel: function(that) {
		var actionUrl = TMON.claim.htAPI.receiveClaimCancelProc;
		var params = '?claimStatus=' + that._claimStatus
				+ '&mainBuySrl=' + that._mainBuySrl
				+ '&mainDealSrl=' + that._mainDealSrl
				+ '&allListYn=' + that._allListYn
				+ '&claimReasonType=' + $('#claimReasonType').val()
				+ '&claimReasonDetail=' + $('#claimReasonDetail').val()
				+ '&dealType=' + that._dealType
				+ '&repaymentTotalCashAmount=' + that._repaymentTotalCashAmount.val(); //PLP-2035 간편결제 PAYCO_즉시할인시 부분취소 불가
		$('.__deals').each(function() { params += '&deals=' + this.value });
		$('.__counts').each(function() { params += '&counts=' + this.value });
		return actionUrl + params;
	},

	submitGroupCancel: function(that) {
		var actionUrl = TMON.claim.htAPI.receiveClaimGroupCancelProc;
		var params = '?claimStatus=' + that._claimStatus
				+ '&mainBuySrl=' + that._mainBuySrl
				+ '&deliveryGroupSrl=' + $('#deliveryGroupSrl').val()
				+ '&mainDealSrls=' + $('.__dealSrls').map(function() { return this.value; }).get()
				+ '&claimReasonTypes=' + that._selReason.map(function() { return this.value; }).get()
				+ '&claimReasonDetails=' + that._txtReason.map(function() { return this.value; }).get()
				+ '&allListYn=' + that._allListYn
				+ '&productType=' + that._productType
				+ '&dealType=' + that._dealType
				+ '&repaymentTotalCashAmount=' + that._repaymentTotalCashAmount.val(); //PLP-2035 간편결제 PAYCO_즉시할인시 부분취소 불가
		$('.__deals').each(function() { params += '&deals=' + this.value });
		$('.__counts').each(function() { params += '&counts=' + this.value });
		return actionUrl + params;
	},

	submitCancelReq: function(that) {
		var actionUrl = TMON.claim.htAPI.receiveClaimCancelProc;
		var params = '?claimStatus=' + that._claimStatus
				+ '&mainBuySrl=' + that._mainBuySrl
				+ '&mainDealSrl=' + that._mainDealSrl
				+ '&allListYn=' + that._allListYn
				+ '&claimReasonType=' + that._selReason.val()
				+ '&claimReasonDetail=' + that._txtReason.val()
				+ '&dealType=' + that._dealType;
		$('.__deals').each(function() { params += '&deals=' + this.value });
		$('.__counts').each(function() { params += '&counts=' + this.value });
		return actionUrl + params;
	},

	submitGroupCancelReq: function(that) {
		var actionUrl = TMON.claim.htAPI.receiveClaimGroupCancelProc;
		var params = '?claimStatus=' + that._claimStatus
				+ '&mainBuySrl=' + that._mainBuySrl
				+ '&deliveryGroupSrl=' + $('#deliveryGroupSrl').val()
				+ '&mainDealSrls=' + $('.__dealSrls').map(function() { return this.value; }).get()
				+ '&claimReasonTypes=' + that._selReason.map(function() { return this.value; }).get()
				+ '&claimReasonDetails=' + that._txtReason.map(function() { return this.value; }).get()
				+ '&allListYn=' + that._allListYn
				+ '&dealType=' + that._dealType
				+ '&productType=' + that._productType;
		$('.__deals').each(function() { params += '&deals=' + this.value });
		$('.__counts').each(function() { params += '&counts=' + this.value });
		return actionUrl + params;
	},

	submitRefundTicket: function(that) {
		// 로직 하드코딩
		var claimReasonType = that._selReason.find('option:selected').val();
		var claimReasonDetail = that._txtReason.val();
		var approveReasonType = '';
		if (that._claimStatus == 'C2') {
			var reasonHide = $('#reasonHide');

			if (reasonHide.length > 0) {
				if (reasonHide.val() == 'Y') {
					claimReasonType = (that._dealType == 'C') ? 'RRC1' : 'RRU1';
					claimReasonDetail = '';
				}
				approveReasonType = (that._dealType == 'C') ? 'ARC1' : 'ARU1';
			}
		}

		if (claimReasonType == null) {
			if (that._dealType == 'T') {
				claimReasonType = 'RRT1';
				approveReasonType = 'ART1';
			} else {
				claimReasonType = 'RRP1';
				approveReasonType = 'ARP1';
			}
		}

		var actionUrl = TMON.claim.htAPI.receiveClaimForTicketProc;
		var params = '?mainBuySrl=' + that._mainBuySrl
				+ '&mainDealSrl=' + that._mainDealSrl
				+ '&claimStatus=' + that._claimStatus
				+ '&claimType=' + $('#claimType').val()
				+ '&claimReasonType=' + claimReasonType
				+ '&claimReasonDetail=' + claimReasonDetail
				+ '&approveReasonType=' + approveReasonType
				+ '&allListYn=' + that._allListYn
				+ '&dealType=' + that._dealType
				+ '&useDirectPin=' + $('#useDirectPin').val()
				+ '&infantPassengerSrls=' + $('#infantPassengerSrls').val()
				+ '&passengerTicketSrls=' + $('#passengerTicketSrls').val() //PLP-1922 항공딜 추가 파라미터
				+ '&repaymentTotalCashAmount=' + that._repaymentTotalCashAmount.val(); //PLP-2035 간편결제 PAYCO_즉시할인시 부분취소 불가
		$('.__deals').each(function() { params += '&deals=' + this.value });
		$('.__counts').each(function() { params += '&counts=' + this.value });
		return actionUrl + params;
	},

	submitRefundDelivery: function(that) {
		var actionUrl = TMON.claim.htAPI.receiveClaimForDeliveryProc;
		var params = '?mainBuySrl=' + that._mainBuySrl
				+ '&mainDealSrl=' + that._mainDealSrl
				+ '&claimStatus=' + that._claimStatus
				+ '&claimType=' + $('#claimType').val()
				+ '&claimReasonType=' + that._selReason.find('option:selected').val()
				+ '&claimReasonDetail=' + that._txtReason.val()
				+ '&allListYn=' + that._allListYn
				+ '&dealType=' + that._dealType
				+ '&isCargoItem=' + $('#isCargoItem').val()
				+ '&returnCargoType=' + $('#returnCargoType').val()
				+ '&pickupName=' + that._pickupName.val()
				+ '&pickupPhone=' + that._pickupPhone.val()
				+ '&pickupAddr1=' + that._pickupAddr1.val()
				+ '&pickupAddr1Street=' + that._pickupAddr1Street.val()
				+ '&pickupAddr2=' + that._pickupAddr2.val()
				+ '&pickupZipcode=' + that._pickupZipcode.val()
				+ '&pickupCvsCd=' + that._pickupCvsCd.val()
				+ '&pickupCvsBranchCd=' + that._pickupCvsBranchCd.val()
				+ '&pickupCvsBranchNm=' + that._pickupCvsBranchNm.val()
				+ '&pickupCvsTelNo=' + that._pickupCvsTelNo.val()
				+ '&pickupCorp=' + (that._selPickupCorp.length > 0 ? that._selPickupCorp.val() : '')
				+ '&pickupNumber=' + (that._txtPickupNumber.length > 0 ? that._txtPickupNumber.val() : '')
				+ '&pickupSendYn=' + $('input[name="__rdo_sendyn"]:checked').val()
				+ '&pickupSelect=' + (that._selRefundType.length > 0 ? that._selRefundType.val() : '')
				+ '&repaymentTotalCashAmount=' + that._repaymentTotalCashAmount.val(); //PLP-2035 간편결제 PAYCO_즉시할인시 부분취소 불가
		$('.__deals').each(function() { params += '&deals=' + this.value });
		$('.__counts').each(function() { params += '&counts=' + this.value });
		return actionUrl + params;
	},

	submitGroupRefundDelivery: function(that) {
		var actionUrl = TMON.claim.htAPI.receiveClaimGroupForDeliveryProc;
		var params = '?mainBuySrl=' + that._mainBuySrl
				+ '&mainDealSrl=' + that._mainDealSrl
				+ '&deliveryGroupSrl=' + $('#deliveryGroupSrl').val()
				+ '&claimStatus=' + that._claimStatus
				+ '&claimType=' + $('#claimType').val()
				+ '&mainDealSrls=' + $('.__dealSrls').map(function() { return this.value; }).get()
				+ '&claimReasonTypes=' + that._selReason.map(function() { return this.value; }).get()
				+ '&claimReasonDetails=' + that._txtReason.map(function() { return this.value; }).get()
				+ '&allListYn=' + that._allListYn
				+ '&dealType=' + that._dealType
				+ '&isCargoItem=' + $('#isCargoItem').val()
				+ '&returnCargoType=' + $('#returnCargoType').val()
				+ '&pickupName=' + that._pickupName.val()
				+ '&pickupPhone=' + that._pickupPhone.val()
				+ '&pickupAddr1=' + that._pickupAddr1.val()
				+ '&pickupAddr1Street=' + that._pickupAddr1Street.val()
				+ '&pickupAddr2=' + that._pickupAddr2.val()
				+ '&pickupZipcode=' + that._pickupZipcode.val()
				+ '&pickupCvsCd=' + that._pickupCvsCd.val()
				+ '&pickupCvsBranchCd=' + that._pickupCvsBranchCd.val()
				+ '&pickupCvsBranchNm=' + that._pickupCvsBranchNm.val()
				+ '&pickupCvsTelNo=' + that._pickupCvsTelNo.val()
				+ '&pickupCorp=' + (that._selPickupCorp.length > 0 ? that._selPickupCorp.val() : '')
				+ '&pickupNumber=' + (that._txtPickupNumber.length > 0 ? that._txtPickupNumber.val() : '')
				+ '&pickupSendYn=' + $('input[name="__rdo_sendyn"]:checked').val()
				+ '&pickupSelect=' + (that._selRefundType.length > 0 ? that._selRefundType.val() : '')
				+ '&repaymentTotalCashAmount=' + that._repaymentTotalCashAmount.val(); //PLP-2035 간편결제 PAYCO_즉시할인시 부분취소 불가
		$('.__deals').each(function() { params += '&deals=' + this.value });
		$('.__counts').each(function() { params += '&counts=' + this.value });
		return actionUrl + params;
	},

	submitExchange: function(that) {
		// submit 전에 반품 수거지 정보를 등록
		that.submitModifyReturnPickup();

		var actionUrl = TMON.claim.htAPI.receiveClaimForDeliveryProc;
		var params = '?mainBuySrl=' + that._mainBuySrl
				+ '&mainDealSrl=' + that._mainDealSrl
				+ '&claimStatus=' + that._claimStatus
				+ '&claimType=' + $('#claimType').val()
				+ '&claimReasonType=' + that._selReason.val()
				+ '&claimReasonDetail=' + that._txtReason.val()
				+ '&allListYn=' + that._allListYn
				+ '&dealType=' + that._dealType
				+ '&isCargoItem=' + $('#isCargoItem').val()
				+ '&returnCargoType=' + $('#returnCargoType').val()
				+ '&deliveryName=' + that._pickupName.val()
				+ '&deliveryPhone=' + that._pickupPhone.val()
				+ '&deliveryAddr1=' + that._pickupAddr1.val()
				+ '&deliveryAddr1Street=' + that._pickupAddr1Street.val()
				+ '&deliveryAddr2=' + that._pickupAddr2.val()
				+ '&deliveryZipcode=' + that._pickupZipcode.val()
				+ '&pickupName=' + that._pickupName.val()
				+ '&pickupPhone=' + that._pickupPhone.val()
				+ '&pickupAddr1=' + that._pickupAddr1.val()
				+ '&pickupAddr1Street=' + that._pickupAddr1Street.val()
				+ '&pickupAddr2=' + that._pickupAddr2.val()
				+ '&pickupZipcode=' + that._pickupZipcode.val()
				+ '&pickupCorp=' + (that._selPickupCorp.length > 0 ? that._selPickupCorp.val() : '')
				+ '&pickupNumber=' + (that._txtPickupNumber.length > 0 ? that._txtPickupNumber.val() : '')
				+ '&pickupSendYn=' + $('input[name="__rdo_sendyn"]:checked').val()
				+ '&pickupSelect=' + (that._selRefundType.length > 0 ? that._selRefundType.val() : '');
		$('.__deals').each(function() { params += '&deals=' + this.value });
		$('.__counts').each(function() { params += '&counts=' + this.value });
		return actionUrl + params;
	},

	submitGroupExchange: function(that) {
		// submit 전에 반품 수거지 정보를 등록
		that.submitModifyReturnPickup();

		var actionUrl = TMON.claim.htAPI.receiveClaimGroupForDeliveryProc;
		var params = '?mainBuySrl=' + that._mainBuySrl
				+ '&mainDealSrl=' + that._mainDealSrl
				+ '&deliveryGroupSrl=' + $('#deliveryGroupSrl').val()
				+ '&claimStatus=' + that._claimStatus
				+ '&claimType=' + $('#claimType').val()
				+ '&mainDealSrls=' + $('.__dealSrls').map(function() { return this.value; }).get()
				+ '&claimReasonTypes=' + that._selReason.map(function() { return this.value; }).get()
				+ '&claimReasonDetails=' + that._txtReason.map(function() { return this.value; }).get()
				+ '&allListYn=' + that._allListYn
				+ '&dealType=' + that._dealType
				+ '&isCargoItem=' + $('#isCargoItem').val()
				+ '&returnCargoType=' + $('#returnCargoType').val()
				+ '&deliveryName=' + that._pickupName.val()
				+ '&deliveryPhone=' + that._pickupPhone.val()
				+ '&deliveryAddr1=' + that._pickupAddr1.val()
				+ '&deliveryAddr1Street=' + that._pickupAddr1Street.val()
				+ '&deliveryAddr2=' + that._pickupAddr2.val()
				+ '&deliveryZipcode=' + that._pickupZipcode.val()
				+ '&pickupName=' + that._pickupName.val()
				+ '&pickupPhone=' + that._pickupPhone.val()
				+ '&pickupAddr1=' + that._pickupAddr1.val()
				+ '&pickupAddr1Street=' + that._pickupAddr1Street.val()
				+ '&pickupAddr2=' + that._pickupAddr2.val()
				+ '&pickupZipcode=' + that._pickupZipcode.val()
				+ '&pickupCorp=' + (that._selPickupCorp.length > 0 ? that._selPickupCorp.val() : '')
				+ '&pickupNumber=' + (that._txtPickupNumber.length > 0 ? that._txtPickupNumber.val() : '')
				+ '&pickupSendYn=' + $('input[name="__rdo_sendyn"]:checked').val()
				+ '&pickupSelect=' + (that._selRefundType.length > 0 ? that._selRefundType.val() : '');
		$('.__deals').each(function() { params += '&deals=' + this.value });
		$('.__counts').each(function() { params += '&counts=' + this.value });
		return actionUrl + params;
	},

	submitModifyReturnPickup: function() {
		// update form
		this._pickupName.val($.trim($('#__frm_pickup_name').val()));
		this._pickupPhone.val($('#__frm_pickup_phone1').val() + '-' + $('#__frm_pickup_phone2').val() + '-' + $('#__frm_pickup_phone3').val());
		this._pickupPhone1.val($('#__frm_pickup_phone1').val());
		this._pickupPhone2.val($('#__frm_pickup_phone2').val());
		this._pickupPhone3.val($('#__frm_pickup_phone3').val());
		this._pickupZipcode.val($('#__frm_pickup_zipcode').val());
		this._pickupAddr1.val($.trim($('#__frm_pickup_addr1').html()));
		this._pickupAddr1Street.val($.trim($('#__frm_pickup_addr1Street').html()));
		this._pickupAddr2.val($.trim($('#__frm_pickup_addr2').val()));
		this._pickupCvsCd.val('');
		this._pickupCvsBranchCd.val('');
		this._pickupCvsBranchNm.val('');
		this._pickupCvsTelNo.val('');
		this.updateReturnPickupData();
	},

	updateReturnPickupData: function() {
		$('#newPickupName').html(this._pickupName.val());
		$('#newPickupPhone').html(this._pickupPhone1.val() + '-' + this._pickupPhone2.val() + '-' + this._pickupPhone3.val());
		$('#newPickupZipcode').html(this._pickupZipcode.val());
		var objAddrSt = $('#__addr_st');
		objAddrSt.find('span').html(this._pickupAddr1Street.val()).show();
		$('#__addr_no').find('span').html(this._pickupAddr1.val());
		$('#__addr_re').html(this._pickupAddr2.val() + ' (' + this._pickupZipcode.val() + ')');
		var isAddrStreet = (this._pickupAddr1Street.val() != '');
		if (isAddrStreet) {
			objAddrSt.show();
		} else {
			objAddrSt.hide();
		}
		this._divReturnPickupModify.hide();
		this._divReturnPickupDefault.show();
		this._isPickupModifying = false;
	},

	_onClickAccount: function(obj) {
		if (this._chgacc.is(':checked')) {
			this._bnknm.attr('disabled', false).val('');
			this._accnm.attr('disabled', false).val('');
			this._ownnm.attr('disabled', false).val('');
			this._figacc.prop('checked', false).attr('disabled', false);
		} else {
			console.log('off');
			this._bnknm.attr('disabled', true).val(this._oldBankBankName);
			this._accnm.attr('disabled', true).val(this._oldBankAccName);
			this._ownnm.attr('disabled', true).val(this._oldBankOwnName);
			this._figacc.prop('checked', true).attr('disabled', true);
		}
	},

	_onChangeBankName: function(obj) {
		this._haveToAuth = true;
		if (this._bnknm.val() == '') {
			this._bankId = '';
			this._bankKcpCode = '';
		} else {
			var data = this._bnknm.val().split('||');
			this._bankId = data[0];
			this._bankKcpCode = data[1];
		}
	},

	_onChangeAccountName: function(obj) {
		this._haveToAuth = true;
	},

	_onChangeOwnName: function(obj) {
		this._haveToAuth = true;
	},

	_onClickAuthAccount: function(obj) {
		if (this._haveToAuth) {
			if (!this._isAuthNow) {
				this._isAuthNow = true;
				// 인증하기
				this._bankAccName = this._accnm.val();
				this._bankOwnName = this._ownnm.val();
				TMON.claim.util.getBankAccountAuth(this, function(obj, result, msg) {
					if (result) {
						// 성공시
						obj._isValidAcc = true;
						obj._haveToAuth = false;
						alert(msg);
					} else {
						obj._isValidAcc = false;
						alert('계좌 인증에 실패했습니다: ' + msg);
					}
					obj._isAuthNow = false;
				});
			} else {
				alert('계좌 인증 중 입니다. 잠시만 기다려주세요.');
			}
		} else {
			// 인증 불필요
		}
	},

	_onChangeSelReason: function(obj) {
		// 환불예정액 표시
		this.calRepaymentAmount();
	},

	_onInputReason: function(obj) {
		var limit = 50;
		var textLen = obj.val().length;
		if (textLen > limit) {
			alert(limit + '자 까지 입력 가능합니다.');
			obj.val(obj.val().substring(0, limit));
			textLen = limit;
		}
		obj.parent().parent().find('p.cnt').html(textLen + ' / ' + limit);
	},

	_onClickNumberZipcode: function(we, data) {
		var zip = $('#__frm_pickup_zipcode');
		var addr1 = $('#__frm_pickup_addr1');
		var addr1Street = $('#__frm_pickup_addr1Street');
		var addr2 = $('#__frm_pickup_addr2');
		zip.val(data.zip1);
		addr1.html(data.addr1);
		addr1Street.html('').parent().hide();
		addr2.val('').focus();
	},

	_onClickStreetZipcode: function(we, data) {
		var zip = $('#__frm_pickup_zipcode');
		var addr1 = $('#__frm_pickup_addr1');
		var addr1Street = $('#__frm_pickup_addr1Street');
		var addr2 = $('#__frm_pickup_addr2');
		zip.val(data.zip1);
		addr1.html(data.addr1);
		addr1Street.html(data.addr1_street).parent().show();
		addr2.val('').focus();
	},

	_onClickBtnCvsReturn: function() {
		TMON.claim.util.openHtmlLayer('#__ly_cvs_return');
	},

	_onClickBtnPopupNearbyCvs: function() {
		TMON.claim.util.openWebViewLink('가까운 편의점 찾기', 'http://www.cvsnet.co.kr/GIS/chzero/m_search.jsp');
	},

	_onChangeRdoSendyn: function() {
		var value = $('input[name="__rdo_sendyn"]:checked').val();
		var message = "편의점 픽업 주문의 반품수거지는\n1.상품을 수취하신 경우 최근 배송지(편의점 제외)로,\n2.수취하지 않으신 경우 주문하신 편의점 주소지로\n반영되니 꼭 확인 후 진행해 주세요.";
		if (value == 'Y') {
			this._divSendynYes.show();
			this._divSendynNo.hide();
			this._divRefundTypeCV2.hide();
			this._divSendynPickupInfo.hide(); // 반품수거지 정보 제거
		} else {
			this._divSendynNo.show();
			this._divSendynYes.hide();
			if (this._selRefundType.length > 0) {
				this._onChangeRefundType();
			} else {
				this.displayChangeZipcodeInfo(); // 반품수거지 정보 추가
			}

			if(this._pickupCvsCd.val() != '') {
				alert(message);
			}
		}
		this._divSendynWrap.show();
	},

	_onChangeRefundType: function() {
		var value = this._selRefundType.find('option:selected').val();
		switch (value) {
			case '':
				this._divRefundTypeDefault.show();
				this._divRefundTypeHD.hide();
				this._divRefundTypeCV.hide();
				this._divRefundTypeCV2.hide();
				this._divSendynPickupInfo.hide(); // 반품수거지 정보 제거
				break;
			case 'HD':
				this._divRefundTypeHD.show();
				this._divRefundTypeCV.hide();
				this._divRefundTypeCV2.hide();
				this.displayChangeZipcodeInfo(); // 반품수거지 정보 추가
				this._divRefundTypeDefault.hide();
				break;
			default:
				this._divRefundTypeCV.show();
				this._divRefundTypeCV2.show();
				this._divSendynPickupInfo.hide(); // 반품수거지 정보 제거
				this._divRefundTypeHD.hide();
				this._divRefundTypeDefault.hide();
				break;
		}
	},

	_onClickBtnModifyReturnPickup: function() {
		this._divReturnPickupDefault.hide();
		this._divReturnPickupModify.show();
		this._isPickupModifying = true;
	},

	_onClickBtnCancelModifyReturnPickup: function() {
		this.updateReturnPickupData();
	},

	_onClickBtnSubmitModifyReturnPickup: function() {
		var frmPickupName = $('#__frm_pickup_name');
		var frmPickupPhone2 = $('#__frm_pickup_phone2');
		var frmPickupPhone3 = $('#__frm_pickup_phone3');
		var frmPickupAddr1 = $('#__frm_pickup_addr1');
		var frmPickupAddr2 = $('#__frm_pickup_addr2');
		if (frmPickupName.val() == '') {
			alert('이름을 입력해주세요.');
			frmPickupName.focus();
		} else if (frmPickupPhone2.val() == '') {
			alert('연락처를 입력해주세요.');
			frmPickupPhone2.focus();
		} else if (!frmPickupPhone2.val().match(/^[0-9]{3,4}$/)) {
			alert('연락처는 숫자로만 입력해주세요.');
			frmPickupPhone2.focus();
		} else if (frmPickupPhone3.val() == '') {
			alert('연락처를 입력해주세요.');
			frmPickupPhone3.focus();
		} else if (!frmPickupPhone3.val().match(/^[0-9]{3,4}$/)) {
			alert('연락처는 숫자로만 입력해주세요.');
			frmPickupPhone3.focus();
		} else if (frmPickupAddr1.html() == '') {
			alert('수거지 주소를 입력해주세요.');
			this._btnSearchZipcode.focus();
		} else if (frmPickupAddr2.val() == '') {
			alert('수거지 주소의 나머지 항목을 입력해주세요.');
			frmPickupAddr2.focus();
		} else if (frmPickupAddr2.val().length > 50) {
			alert('수거지 주소는 50자 이내로 입력해주세요.');
			frmPickupAddr2.focus();
		} else if (!TMON.claim.util.isAllowChar($.trim(frmPickupAddr2.val()))) {
			alert('주소에 사용불가 문자(\', ", <, >, \\)가 있습니다.');
			frmPickupAddr2.focus();
		} else {
			this.submitModifyReturnPickup();
		}
	},

	_onClickBtnSubmit: function(obj) {
		if (!this.bIsSubmitted) {
			this.bIsSubmitted = true;
			var that = this;
			setTimeout(function() {
				that.bIsSubmitted = false;
			}, 3000);

			var method = this._btnSubmit.data('method');
			if (this[method]) {
				if (this.validate()) {
					if (this._hasBankAccount) {
						this.updateAccountBeforeSave(this[method], this);
					} else {
						this.submitForm(this[method], this);
					}
				}
			} else {
				console.log(method + ' is not found');
			}
		}
	},

	_onClickBtnCancel: function(obj) {
		// 클레임은 취소시 반드시 전 페이지로
		window.history.back();
	}
};