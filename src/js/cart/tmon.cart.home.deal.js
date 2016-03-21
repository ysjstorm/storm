/**
 * 카트 홈 딜컨트롤
 * @param htOptions
 */
var cartHomeDeal = function(htOptions) {
	this.init(htOptions);
};
cartHomeDeal.prototype = {
	htElement : {},

	htItem : {
		mainDealSrl : 0,
		dealSrl : 0,
		count : 0,
		addedTimestamp : 0
	},

	// AJAX 요청시 기본 데이터 구조
	htRequestData : {
		actionType : '', // SELECT, CHANGE, REMOVE, UPDATE
		targetItems : [], // htItem, 수정이 일어난 아이템 데이터
		selectedItems : [] // htItem, 선텍된 아이템 데이터
	},

	htMessage : {
		update : {
			CART_102_D : '%name% 상품의 구매 가능한 최소수량은 %minCount%개 입니다.',
			CART_102_O : '현재 옵션의 구매 가능한 최소수량은 %minCount%개 입니다.',
			CART_103_D : '%name% 상품의 최대 구매수량은 %maxCount%개 입니다.',
			CART_103_D_BUY : '%name% 상품의 구매 가능 수량은 %enableBuyCount%개 입니다. 구매하신 내역이 없는지 확인해 주세요.',
			CART_103_O : '현재 옵션의 최대 구매수량은 %maxCount%개 입니다.',
			CART_103_O_BUY : '현재 옵션의 구매 가능 수량은 %enableBuyCount%개 입니다. 구매하신 내역이 없는지 확인해 주세요.',
			CART_OVER : '현재 옵션의 최대 구매수량은 %available%개 입니다.'
		}
	},

	bIsActiveItemBuy : false,
	bIsActiveItemUpdate : false,
	nOldCartCount : 0,

	init : function(htOptions){
		$.extend(true, this, htOptions);
		this.cacheElement();
		this.setEvent();
		this.initPage();
	},

	cacheElement : function() {
		this.welWin = $('body');
		this.welTotalCount = $('header.ct_header .all_chk');
		this.welNavTopCartCount = $('nav.top .bt.gocrt em.cnt');
		this.welBannerSuperMart = $('.bnr_mart');
		this.welBannerCouponDC = $('.ct_prod_wp.ct_total .bnr_coupon_dc');

		this.welBtnAllCheckbox = $('.ct_header > label.chk_type > input[type="checkbox"]'); // 전체 체크박스
		this.welBtnGroupCheckbox = $('.prod_header > label.chk_type > input[type="checkbox"]'); // 그룹별 체크박스
		this.welBtnBuy = $('.ct_prod_wp.ct_total .bt_submit'); // 구매하기

		this.welBtnDealDetail = $('.prod .prod_tit a'); // 딜상세 이동 영역
		this.welBtnOptionCheckbox = $('.prod > label > input[type="checkbox"]'); // 각 옵션별 체크박스
		this.welBtnOptionQuan = $('.item .info .bt_cnt'); // 각 옵션별 수량선택
		this.welBtnOptionRemove = $('.item .info .bt_del'); // 각 옵션별 삭제
		this.welBtnOptionSelectOption = $('.item a.op_select'); // 각 옵션별 상품상세에서 옵션 선택하기

		this.welTotalPrice = $('.ct_prod_wp.ct_total');
		this.welTotalBenefitPoint = this.welTotalPrice.find('.benefit');
		this.welTotalPriceBuy = this.welTotalPrice.find('em[data-amount="buy"]'); // 총 상품 금액
		this.welTotalPriceDiscount = this.welTotalPrice.find('em[data-amount="discount"]'); // 총 추가할인 금액
		this.welTotalPriceDelivery = this.welTotalPrice.find('em[data-amount="delivery"]'); // 총 배송 금액
		this.welTotalPriceTotal = this.welTotalPrice.find('em[data-amount="total"]'); // 총 구매 금액
		this.welTotalPriceDiscountTxt = this.welTotalPrice.find('.dc_txt_area');
		this.welTotalPriceDiscountAmt = this.welTotalPrice.find('.dc_amt_area');
	},

	setEvent : function(){
		this.welBtnAllCheckbox.on('click', $.proxy(this.onClickBtnAllCheckbox, this));
		this.welBtnGroupCheckbox.on('click', $.proxy(this.onClickBtnGroupCheckbox, this));
		this.welBtnBuy.on('click', $.proxy(this.onClickBtnBuy, this));

		this.welBtnDealDetail.on('click', $.proxy(this.onClickBtnDealDetail, this));
		this.welBtnOptionCheckbox.on('click', $.proxy(this.onClickBtnOptionCheckbox, this));
		this.welBtnOptionQuan.on('click', $.proxy(this.onClickBtnOptionQuan, this));
		this.welBtnOptionRemove.on('click', $.proxy(this.onClickBtnOptionRemove, this));
		this.welBtnOptionSelectOption.on('click', $.proxy(this.onClickBtnOptionSelectOption, this));
	},

	initPage : function(){
		var htCountInfo = this.getTotalCountInfo();
		if (htCountInfo.count !== htCountInfo.total) {
			// 구매페이지에서 뒤로가기시 체크박스 해제된 내용에 대한 업데이트 처리
			this.requestAction('SELECT');
		}
		this.setTotalCountInfo(htCountInfo); // 카트 카운트 정보
		this.requestBenefitInfo(); // 구매혜택 정보
		this.requestCouponInfo(); // 카트할인 정보
	},

	/**
	 * 전체 선택된 최종 아이템을 리턴
	 * @param aExcept 예외 아이템
	 * @returns {Array}
	 */
	getTotalItemData : function(aExcept){
		var aSelectedItem = [];
		var welCheckbox = $('.prod > label > input[type="checkbox"]:checked');

		if (!!aExcept) {
			aExcept = (aExcept instanceof Array ? aExcept : [aExcept]);
		}

		welCheckbox.closest('.prod').find('.item').each($.proxy(function(i, e){
			var wel = $(e);
			var sDealSrl = wel.data('dealSrl');
			var sOptionSrl = wel.data('optionSrl');

			if (!!aExcept) {
				for (var ex in aExcept) {
					if (aExcept.hasOwnProperty(ex)) {
						if (aExcept[ex].data('dealSrl') !== sDealSrl || aExcept[ex].data('optionSrl') !== sOptionSrl) {
							aSelectedItem.push(this.getItemRequestData(wel));
						}
					}
				}
			} else {
				aSelectedItem.push(this.getItemRequestData(wel));
			}
		}, this));

		return aSelectedItem;
	},

	getElementBySrl : function(dealSrl, optionSrl){
		var wel;
		if (!!optionSrl) {
			// 옵션 딜로 찾기
			var welOptions = $('.item[data-option-srl="' + optionSrl + '"]');
			wel = (welOptions.length > 0 ? welOptions.eq(0) : null);
		} else {
			var welDeals = $('.prod[data-deal-srl="' + dealSrl + '"]');
			wel = (welDeals.length > 0 ? welDeals.eq(0) : null);
		}
		return wel;
	},

	/**
	 * getItemData
	 * @param welOption 딜 옵션 (.item 클래스)
	 */
	getItemRequestData : function(welOption){
		var welQuan = welOption.find('.info .quantity');
		return {
			mainDealSrl : welOption.data('dealSrl'),
			dealSrl : welOption.data('optionSrl'),
			count : (welQuan.length > 0 ? welQuan.html().replace(/(,)/g, '') : 0),
			addedTimestamp : welOption.data('added-timestamp')
		};
	},

	setItemData : function(welTarget, nCount){
		var welOption = welTarget.closest('.item');
		var welDeal = welOption.closest('.prod');
		var welGroup = welDeal.closest('section.ct_prod_wp');

		if (nCount === 0) {
			this.requestAction('REMOVE', welOption, $.proxy(function(){
				welOption.remove(); // 딜 옵션 제거

				if (welDeal.find('.item').length === 0) {
					welDeal.remove(); // 딜 제거
				}
				if (welGroup.find('.prod').length === 0) {
					if (welGroup.data('groupType') === 'supermart') {
						// 슈퍼마트 배너 존재시 제거
						this.welBannerSuperMart.hide();
					}
					welGroup.remove(); // 딜 그룹 제거
				}

				this.setAllInfoUpdate();
			}, this)); // Ajax call
		} else {
			welOption.find('.quantity').html(TMON.util.numberWithComma(nCount)); // 입력된 딜 옵션 갯수 표시
			this.requestAction('UPDATE', welOption); // Ajax call
		}
	},

	requestAction : function(actionType, wel, cbFunc){
		var htRequestData = this.htRequestData;
		htRequestData.actionType = actionType;
		htRequestData.targetItems = [];
		htRequestData.selectedItems = [];

		switch (actionType) {
			case 'SELECT':
				if (wel) {
					htRequestData.selectedItems.push(this.getItemRequestData(wel));
				} else {
					htRequestData.selectedItems = this.getTotalItemData();
				}
				break;
			case 'CHANGE':
				htRequestData.selectedItems.push(this.getItemRequestData(wel));
				break;
			case 'UPDATE':
				htRequestData.selectedItems = this.getTotalItemData();
				wel.each($.proxy(function(i, e){
					htRequestData.targetItems.push(this.getItemRequestData($(e)));
				}, this));
				break;
			case 'REMOVE':
				htRequestData.selectedItems = this.getTotalItemData(wel);
				wel.each($.proxy(function(i, e){
					htRequestData.targetItems.push(this.getItemRequestData($(e)));
				}, this));
				break;
		}

		this.setAllInfoUpdate();
		this.requestDataUpdate(htRequestData, cbFunc);
	},

	requestBenefitInfo : function(){
		$.ajax({
			type : 'POST',
			url : TMON.cart.htAPI.getBenefit,
			data : JSON.stringify(this.getTotalItemData()),
			dataType : 'json',
			contentType : 'application/json; charset=UTF-8',
			success : $.proxy(function(res){
				if (res && res.data && res.data.length > 0) {
					var nPoint = 0;

					$('.prod').attr('data-benefit', 0); // 전체 구매혜택 금액 초기화

					for (var obj in res.data) {
						if (res.data.hasOwnProperty(obj)) {
							nPoint += parseInt(res.data[obj].point, 10);
							$('.prod[data-deal-srl="' + res.data[obj].mainDealSrl + '"]').attr('data-benefit', res.data[obj].point);
						}
					}

					this.setTotalBenefitAmountInfo();
				}
			}, this),
			error : $.proxy(function(res){ this.handleGetException(res); }, this)
		});
	},

	requestCouponInfo : function(){
		var aDealSrl = [];
		var welCheckbox = $('.prod > label > input[type="checkbox"]:checked');
		welCheckbox.each($.proxy(function(i, e){
			var wel = $(e).closest('.prod');
			wel.each($.proxy(function(i, e){
				aDealSrl.push(parseInt($(e).attr('data-deal-srl'), 10));
			}, this));
		}, this));

		$.ajax({
			type : 'POST',
			url : TMON.cart.htAPI.getCoupon + '?dealNoArray=' + aDealSrl.join(','),
			dataType : 'json',
			contentType : 'application/json; charset=UTF-8',
			success : $.proxy(function(res){
				if (res && res.data) {
					var bIsShowCouponBanner = false;

					for (var obj in res.data) {
						if (res.data.hasOwnProperty(obj)) {
							// 카트할인 딱지 표시
							var wel = $('.prod[data-deal-srl="' + obj + '"] .ico_ctsale');
							if (res.data[obj] === 'CART') {
								wel.addClass('d_show');
							} else {
								wel.removeClass('d_show');
							}
							// 구매버튼 위 카트할인 메시지 표시여부
							if (bIsShowCouponBanner === false) {
								var welBnr = wel.closest('.prod').find('label > input[type="checkbox"]:checked');
								if (welBnr.length > 0) {
									bIsShowCouponBanner = true;
								}
							}
						}
					}

					if (bIsShowCouponBanner) {
						this.welBannerCouponDC.addClass('d_show');
					} else {
						this.welBannerCouponDC.removeClass('d_show');
					}
				}
			}, this),
			error : $.proxy(function(res){ this.handleGetException(res); }, this)
		});
	},

	checkValidateData : function(cbFunc){
		var bIsValidate = true;
		var htSelectedCount = this.getTotalCountInfo();
		if (htSelectedCount.total === 0) {
			alert('구매할 상품이 없습니다.');
			bIsValidate = false;
		} else if (htSelectedCount.count === 0) {
			alert("구매할 상품을 선택해 주세요.");
			bIsValidate = false;
		}

		var welCheckbox = $('.prod > label > input[type="checkbox"]:checked');
		welCheckbox.each($.proxy(function(i, e){
			var welItem = $(e).closest('.prod').find('.item');
			welItem.each($.proxy(function(i, e){
				var wel = $(e);
				if (wel.hasClass('item_dimmed')) {
					this.moveFocusToDeal(wel.closest('.prod'), function(){
						alert('현재 구매 불가능한 상품이 있습니다.\n해당 상품을 확인하신 후 다시 주문해 주세요.');
					});
					bIsValidate = false;
					return false;
				} else if (wel.find('.quantity').html() === '0') {
					this.moveFocusToDeal(wel.closest('.prod'), function(){
						alert('옵션을 선택하지 않은 상품이 있습니다. 옵션 선택 후 구매해 주세요.');
					});
					bIsValidate = false;
					return false;
				}
			}, this));
			if (bIsValidate === false) {
				return false;
			}
		}, this));

		if (bIsValidate == true) {
			cbFunc();
		}
	},

	requestDataUpdate : function(htRequestData, cbFunc){
		if (!this.bIsActiveItemUpdate && !this.bIsActiveItemBuy) {
			this.bIsActiveItemUpdate = true; // 중복클릭 방지
			this.disableAllCheckbox(true);
			setTimeout($.proxy(function(){
				this.bIsActiveItemUpdate = false;
				this.disableAllCheckbox(false);
			}, this), 2000);

			var sFormData = JSON.stringify({
				key : null,
				mNo : null,
				actionType : htRequestData.actionType,
				selectedItems : htRequestData.selectedItems,
				targetItems : htRequestData.targetItems
			});

			var sCallUrl = TMON.cart.htAPI.modifyCart;
			if (TMON.view_mode === 'app') {
				// 앱일 경우 쿠키값을 얻지 못해 서버에서 내려온 쿠키값을 다시 넘겨줌
				sCallUrl += '/' + TMON.cart.htEtc.sAppCookieKey;
			}

			$.ajax({
				type : 'POST',
				url : sCallUrl,
				data : sFormData,
				dataType : 'json',
				contentType : 'application/json; charset=UTF-8',
				success : $.proxy(function(res){
					if (res && res.data) {
						this.updateViewAfterRequestUpdate(res.data);
						this.disableAllCheckbox(false);
						this.requestBenefitInfo(); // 구매혜택 금액 정보 호출 및 표시
						this.setAllInfoUpdate();
						this.bIsActiveItemUpdate = false; // 중복클릭방지 해제
						(cbFunc||function(){})();
					} else {
						alert('오류가 발생했습니다. 다시 한 번 시도해주세요.');
					}
				}, this),
				error : $.proxy(function(res){ this.handleUpdateException(res); }, this)
			});
		}
	},

	requestDataSubmit : function(){
		if (!this.bIsActiveItemBuy && !this.bIsActiveItemUpdate) {
			this.bIsActiveItemBuy = true;
			this.disableAllCheckbox(true);
			setTimeout($.proxy(function(){
				this.bIsActiveItemBuy = false;
				this.disableAllCheckbox(false);
			}, this), 3000);

			this.checkValidateData($.proxy(function(){
				var sFormData = JSON.stringify(this.getTotalItemData());

				$.ajax({
					type : 'POST',
					url : TMON.cart.htAPI.buyCart + '?serverName=' + TMON.cart.htEtc.sServerName,
					data : sFormData,
					dataType : 'json',
					contentType : 'application/json; charset=UTF-8',
					success : $.proxy(function(res){
						if (res && res.data) {
							// 구매 페이지로 이동
							//var bIsWelfare = $('.cart').data('useWelfare');
							if (TMON.view_mode == 'app') {
								var sUrl = res.data + (res.data.indexOf('?') < 0 ? '?' : '&') + TMON.sAppQuery + '&_sendAfterLogin=plz';
								TMON.app.callApp('cart', 'goBuy', sUrl);
							} else {
								window.location.href = res.data;
							}
						} else {
							alert('오류가 발생했습니다. 다시 한 번 시도해주세요.');
						}
					}, this),
					error : $.proxy(function(res){ this.handleUpdateException(res); }, this)
				});
			}, this));
		} else {
			alert('데이터 처리중 입니다.');
		}
	},

	updateViewAfterRequestUpdate : function(htData){
		var htGroups = htData.groups;
		var htDeals = htData.deals;
		var htAmount = htData.cartAmount;

		// 그룹 데이터 업데이트
		var welGroup = $('section.ct_prod_wp .prod');
		welGroup.each($.proxy(function(i, e){
			var welDeal = $(e);
			var htGroup = htGroups[welDeal.attr('data-group-no')];

			if (!htGroup) {
				htGroup = {
					buyAmount : 0,
					discountAmount : 0,
					deliveryIfAmount : 0,
					deliveryAmount : 0,
					totalAmount : 0
				}
			}

			var welPrice = welDeal.closest('.prod_w').find('.prd_price');
			welPrice.find('em[data-amount="buy"]').html(TMON.util.numberWithComma(htGroup.buyAmount)); // 상품 금액
			welPrice.find('em[data-amount="discount"]').html(TMON.util.numberWithComma(-htGroup.discountAmount)); // 추가할인 금액
			welPrice.find('em[data-amount="delivery"]').html(TMON.util.numberWithComma(htGroup.deliveryAmount)); // 배송비 차감 금액
			welPrice.find('em[data-amount="total"]').html(TMON.util.numberWithComma(htGroup.totalAmount)); // 배송비 차감 금액

			// 조건부 배송비 표시
			var welGroup = welDeal.closest('.ct_prod_wp');
			var bIsSuperMartGroup = (welGroup.attr('data-group-type') === 'supermart'); // 슈퍼마트 여부
			var welDeliCond = welPrice.find('.txt_deli_cond');
			welDeliCond.find('span.amt').html(TMON.util.numberWithComma(htGroup.deliveryIfAmount));

			if (htGroup.deliveryAmount > 0) {
				welDeliCond.find('span.txt').addClass('d_show');
				if (bIsSuperMartGroup) {
					this.welBannerSuperMart.show(); // 슈퍼마트 무료배송 배너 보이기
				}
			} else {
				welDeliCond.find('span.txt').removeClass('d_show');
				if (bIsSuperMartGroup) {
					this.welBannerSuperMart.hide(); // 슈퍼마트 무료배송 배너 감추기
				}
			}

			// 추가할인 표시
			if (htGroup.discountAmount > 0) {
				welPrice.find('.dc_txt_area').addClass('d_show');
				welPrice.find('.dc_amt_area').addClass('d_show');
			} else {
				welPrice.find('.dc_txt_area').removeClass('d_show');
				welPrice.find('.dc_amt_area').removeClass('d_show');
			}
		}, this));

		// 전체 구매금액 데이터 업데이트
		this.welTotalPriceBuy.html(TMON.util.numberWithComma(htAmount.buyAmount)); // 총 상품 금액
		this.welTotalPriceDiscount.html(TMON.util.numberWithComma(-htAmount.discountAmount)); // 총 추가할인 금액
		this.welTotalPriceDelivery.html(TMON.util.numberWithComma(htAmount.deliveryAmount)); // 총 배송 금액
		this.welTotalPriceTotal.html(TMON.util.numberWithComma(htAmount.totalAmount)); // 총 구매 금액
		if (htAmount.discountAmount > 0) {
			this.welTotalPriceDiscountTxt.addClass('d_show');
			this.welTotalPriceDiscountAmt.addClass('d_show');
		} else {
			this.welTotalPriceDiscountTxt.removeClass('d_show');
			this.welTotalPriceDiscountAmt.removeClass('d_show');
		}

		// 상품 데이터 업데이트
		for (var sOptionSrl in htDeals) {
			if (htDeals.hasOwnProperty(sOptionSrl)) {
				var welOption = welGroup.find('.item[data-option-srl="' + sOptionSrl + '"]');
				welOption.find('.bt_cnt').attr('data-max-buycount', htDeals[sOptionSrl].availableCount); // 구매 가능 수량
				welOption.find('.quantity')
					.html(TMON.util.numberWithComma(htDeals[sOptionSrl].selectCount)) // 선택한 수량
					.attr('data-old-value', htDeals[sOptionSrl].selectCount); // 이전 선택한 수량에 선택한 수량 적용
				welOption.find('.price .num').html(TMON.util.numberWithComma(htDeals[sOptionSrl].price)); // 상품 가격

				var welDc = welOption.find('.price .dc'); // 추가할인 금액
				welDc.find('.amt').html(TMON.util.numberWithComma(-htDeals[sOptionSrl].discount));
				if (htDeals[sOptionSrl].discount > 0) {
					welDc.addClass('d_show');
				} else {
					welDc.removeClass('d_show');
				}

				if (htDeals[sOptionSrl].status.length > 0) {
					for (var type in htDeals[sOptionSrl].status) {
						if (htDeals[sOptionSrl].status.hasOwnProperty(type)) {
							var sStatusType = htDeals[sOptionSrl].status[type];
							welOption.find('.op_txt_out, .out_soldout, .out_closed').removeClass('d_show');
							welOption.closest('.prod').find('.ico_deadline, .txt_pc').removeClass('d_show');
							switch (sStatusType) {
								case 'HURRY_UP':
									welOption.find('.op_txt_out').addClass('d_show');
									break;
								case 'SOLDOUT':
									welOption.find('.out_soldout').addClass('d_show');
									break;
								case 'CLOSED':
									welOption.find('.out_closed').addClass('d_show');
									break;
								case 'TODAY_CLOSE':
									welOption.closest('.prod').find('.ico_deadline').addClass('d_show');
									break;
								case 'PC_ONLY':
									welOption.closest('.prod').find('.txt_pc').addClass('d_show');
									break;
							}
						}
					}
				}
			}
		}
	},

	handleGetException : function(res){
		console.log('CART: Request Get exception: ');
		console.log(res);
	},

	handleUpdateException : function(res){
		console.log('CART: Request Update exception: ');
		console.log(res);

		if (res && res.responseJSON && res.responseJSON.data) {
			var resData = res.responseJSON.data;
			var sErrorCode = resData.errorCode;
			var sErrorMsg = resData.errorMessage;
			var htErrorInfo = resData.errorInfo;
			var htDealInfo = null;
			var sMessage = '';
			var bIsRefresh = false;

			switch (sErrorCode) {
				case 'ORDER_000': // 시스템 오류
				case 'ORDER_100': // 필수 파라미터에 오류
					sMessage = sErrorMsg + '\n' + htErrorInfo.message;
					break;
				case 'CART_102': // 최소 구매 수량 미달
				case 'CART_103': // 최대 구매 수량 초과
					var nOldValue = 0, nNewValue = 0;
					var bIsDeal = true;
					var wel, sType;

					htDealInfo = this.getElementBySrl(htErrorInfo.dealSrl);
					if (htDealInfo.length === 0) {
						// 옵션 딜인 경우
						bIsDeal = false;
						htDealInfo = this.getElementBySrl(null, htErrorInfo.dealSrl);
						wel = htDealInfo.closest('.prod');
					} else {
						wel = htDealInfo;
					}

					// 변경된 옵션수량을 원래 옵션수량으로 변경
					wel.find('.item').each($.proxy(function(i, e){
						var wel = $(e).find('.quantity');
						nOldValue = wel.attr('data-old-value'); // wel.data 아님
						nNewValue = parseInt(wel.html().replace(/(,)/g, ''), 10);
						if (nOldValue !== nNewValue) {
							wel.html(TMON.util.numberWithComma(nOldValue));
						}
						return false;
					}, this));

					// 메시지 처리
					if (nNewValue > htErrorInfo.available) {
						sMessage = TMON.cart.util.getFormatMessage(this.htMessage.update.CART_OVER, {
								available : htErrorInfo.available
							});
					} else {
						if (bIsDeal) {
							sType = (sErrorCode === 'CART_103' && htErrorInfo.buyCount > 0 ? '_BUY' : '');
							sMessage = TMON.cart.util.getFormatMessage(this.htMessage.update[sErrorCode + '_D' + sType], {
									name : htDealInfo.find('.prod_name').text(),
									minCount : htErrorInfo.minCount,
									maxCount : htErrorInfo.maxCount,
									enableBuyCount : htErrorInfo.maxCount - htErrorInfo.buyCount
								});
						} else {
							sType = (sErrorCode === 'CART_103' && htErrorInfo.buyCount > 0 ? '_BUY' : '');
							sMessage = TMON.cart.util.getFormatMessage(this.htMessage.update[sErrorCode + '_O' + sType], {
									minCount : htErrorInfo.minCount,
									maxCount : htErrorInfo.maxCount,
									enableBuyCount : htErrorInfo.maxCount - htErrorInfo.buyCount
								});
						}
					}
					break;
				case 'CART_101': // 존재하지 않는 딜 번호
				case 'CART_104': // 매진
				case 'CART_105': // 일시 정지
				case 'CART_106': // 판매기간 불일치
				case 'CART_107': // 바로 구매 전용 딜
				default:
					sMessage = sErrorMsg;
					htDealInfo = this.getElementBySrl(null, htErrorInfo.dealSrl);
					bIsRefresh = true;
					break;
			}

			var fnDoPost = function(sMessage, bIsRefresh){
				alert(sMessage);
				this.bIsActiveItemBuy = false;
				this.bIsActiveItemUpdate = false;
				if (bIsRefresh) {
					window.location.reload();
				}
			};

			if (sMessage || sErrorMsg) {
				if (htDealInfo && htDealInfo.length > 0) {
					// 해당 엘리먼트로 스크롤
					var welDeal = htDealInfo.hasClass('prod') ? htDealInfo : htDealInfo.closest('.prod');
					this.moveFocusToDeal(welDeal, $.proxy(function(){
						fnDoPost(sMessage || sErrorMsg, bIsRefresh);
					}, this));
				} else {
					fnDoPost(sMessage || sErrorMsg, bIsRefresh);
				}
			}
		}
	},

	moveFocusToDeal : function(welDeal, cbFunc){
		if (welDeal.hasClass('highlight')) {
			console.log('remove ' + welDeal.attr('data-deal-srl') + ' / ' + welDeal.attr('data-option-srl'));
			welDeal.removeClass('highlight');
		}

		this.welWin.stop().animate({scrollTop : welDeal.offset().top - 70}, '500', 'swing', function(){
			welDeal.addClass('highlight');
			(cbFunc || function(){})();
		});
	},

	getTotalCountInfo : function(){
		var welTotal = $('section.ct_prod_wp .prod');
		var welCount = welTotal.find('label > input[type="checkbox"]:checked');
		return {
			total : welTotal.length,
			count : welCount.length
		};
	},

	setTotalCountInfo : function(htCountInfo){
		var htResult = htCountInfo || this.getTotalCountInfo();

		this.welTotalCount.find('.cnt').html('<i class="num">' + htResult.count + '</i> / ' + htResult.total);

		if (this.nOldCartCount !== htResult.total) {
			if (TMON.view_mode === 'app') {
				TMON.app.callApp('cart', 'itemCountChanged', htResult.total);
				this.nOldCartCount = htResult.total;
			} else {
				if (htResult.total > 0) {
					this.welNavTopCartCount.html(htResult.total);
					this.welNavTopCartCount.show();
				} else {
					this.welNavTopCartCount.hide();
				}
			}
		}

		// 카트에 담긴 상품이 없어질 경우 빈카트 페이지로 이동
		if (htResult.total === 0) {
			TMON.cart.util.loadView();
		}
	},

	getTotalBenefitAmountInfo : function(){
		var nSumBenefit = 0;
		var welSelected = $('section.ct_prod_wp .prod > label > input[type="checkbox"]:checked');
		welSelected.each($.proxy(function(i, e){
			var wel = $(e);
			var nPoint = wel.closest('.prod').attr('data-benefit');
			nSumBenefit += parseInt(nPoint, 10);
		}, this));
		return nSumBenefit;
	},

	setTotalBenefitAmountInfo : function(){
		var nBenefitPoint = this.getTotalBenefitAmountInfo();
		this.welTotalBenefitPoint.find('em strong').html(TMON.util.numberWithComma(nBenefitPoint));
		if (nBenefitPoint > 0) {
			this.welTotalBenefitPoint.show();
		} else {
			this.welTotalBenefitPoint.hide();
		}
	},

	setCouponDiscountInfo : function(){
		var bIsShowCouponDC = false;
		var welSelected = $('section.ct_prod_wp .prod > label > input[type="checkbox"]:checked');
		welSelected.each($.proxy(function(i, e){
			var wel = $(e).closest('.prod').find('.ico_ctsale');
			if (wel.hasClass('d_show')) {
				bIsShowCouponDC = true;
				return false;
			}
		}, this));

		if (bIsShowCouponDC) {
			this.welBannerCouponDC.addClass('d_show');
		} else {
			this.welBannerCouponDC.removeClass('d_show');
		}
	},

	setAllInfoUpdate : function(){
		this.setTotalCountInfo(); // 카트 카운트 변경
		this.setTotalBenefitAmountInfo(); // 구매혜택 금액
		this.setCouponDiscountInfo(); // 하단 카트쿠폰할인 메시지 표시
	},

	setControlCheckbox : function(){
		var welGroup = $('section.ct_prod_wp');
		// 그룹 선택 체크
		welGroup.each($.proxy(function(i, e){
			var welDeal = $(e);
			var welDeals = welDeal.find('.prod > label > input[type="checkbox"]:not(:disabled)');
			var welCheckedDeals = welDeal.find('.prod > label > input[type="checkbox"]:checked:not(:disabled)');
			if (welDeals.length > 0) {
				if (welDeals.length !== welCheckedDeals.length) {
					welDeal.find('.prod_header > label > input[type="checkbox"]').prop('checked', false);
				} else {
					welDeal.find('.prod_header > label > input[type="checkbox"]').prop('checked', true);
				}
			}
		}, this));
		// 전체 선택 체크
		var welGroups = welGroup.find('label:first-child > input[type="checkbox"]:not(:disabled)');
		var welCheckedGroups = welGroup.find('label:first-child > input[type="checkbox"]:checked:not(:disabled)');
		if (welGroups.length > 0) {
			if (welGroups.length !== welCheckedGroups.length) {
				$('.ct_header > label > input[type="checkbox"]').prop('checked', false);
			} else {
				$('.ct_header > label > input[type="checkbox"]').prop('checked', true);
			}
		}
	},

	disableAllCheckbox : function(bIsDisabled){
		$('.ct_header > label:not(.chk_disabled) > input[type="checkbox"], .prod_header > label:not(.chk_disabled) > input[type="checkbox"], .prod > label:not(.chk_disabled) > input[type="checkbox"]')
			.prop('disabled', bIsDisabled);
	},

	onClickBtnAllCheckbox : function(){
		$('.prod_header > label:not(.chk_disabled) > input[type="checkbox"], .prod > label:not(.chk_disabled) > input[type="checkbox"]')
			.prop('checked', this.welBtnAllCheckbox.is(':checked'));
		this.requestAction('SELECT');
	},

	onClickBtnGroupCheckbox : function(e){
		var wel = $(e.currentTarget);
		wel.closest('.ct_prod_wp').find('.prod > label:not(.chk_disabled) > input[type="checkbox"]').prop('checked', wel.is(':checked'));
		this.requestAction('SELECT', null, $.proxy(this.setControlCheckbox, this));
	},

	onClickBtnDealDetail : function(e){
		e.preventDefault();
		var sDealSrl = $(e.currentTarget).closest('.prod').attr('data-deal-srl');
		if (TMON.view_mode === 'app') {
			TMON.app.callApp('cart', 'showDeal', parseInt(sDealSrl,10));
		} else {
			var sUrl = TMON.cart.htURL.dealDetail.replace(/\{mainDealSrl}/g, sDealSrl);
			TMON.cart.util.loadView(sUrl);
		}
	},

	onClickBtnOptionCheckbox : function(){
		this.requestAction('SELECT', null, $.proxy(this.setControlCheckbox, this));
	},

	onClickBtnOptionQuan : function(e){
		e.preventDefault();

		if (this.bIsActiveItemUpdate === false) {
			var welThis = $(e.currentTarget);
			var welQuantity = welThis.find('.quantity');
			var sDefaultMaxCount = welThis.attr('data-max-buycount');
			var sDealSrl = welThis.closest('div.item').attr('data-deal-srl');
			var nOldValue = welQuantity.html().replace(/(,)/g, '');

			welQuantity.attr('data-old-value', nOldValue);

			// 수량선택 레이어 오픈
			var oCartLayerQuan = new cartLayerQuan({
				sDealSrl : sDealSrl,
				sSelectedCount : nOldValue,
				sDefaultMaxCount : sDefaultMaxCount,
				cbResult : $.proxy(function(nResult){ this.setItemData(welThis, nResult); }, this)
			});
		}
	},

	onClickBtnOptionRemove : function(e){
		if (this.bIsActiveItemBuy === false && this.bIsActiveItemUpdate === false) {
			this.setItemData($(e.currentTarget), 0);
		}
	},

	onClickBtnOptionSelectOption : function(e){
		e.preventDefault();
		var sDealSrl = $(e.currentTarget).closest('.item').attr('data-deal-srl');
		//TMON.cart.util.loadView(TMON.cart.htURL.dealDetail);
		if (TMON.view_mode === 'app') {
			TMON.app.callApp('cart', 'addDealOption', parseInt(sDealSrl,10));
		} else {
			var sUrl = TMON.cart.htURL.dealDetail.replace(/\{mainDealSrl}/g, sDealSrl);
			TMON.cart.util.loadView(sUrl);
		}
	},

	onClickBtnBuy : function(e){
		e.preventDefault();

		// 복지카드 회원 관련 처리
		/*
		var bIsWelfare = $('.cart').attr('data-welfare');
		if (bIsWelfare === true) {
			var oCartLayerWelfare = new cartLayerWelfare({
				cbResult : $.proxy(function(){
					this.requestDataSubmit();
				}, this));
		} else {
			this.requestDataSubmit();
		}*/
		this.requestDataSubmit();
	}
};