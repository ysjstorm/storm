/**
 * 카트 수량선택 레이어
 * @param htOptions
 */
var cartLayerQuan = function(htOptions) {
	this.init(htOptions);
};
cartLayerQuan.prototype = {
	htOptions : {
		sDealSrl : null,
		sSelectedCount : null,
		sDefaultMaxCount : null,
		cbResult : function(){}
	},

	sUrl : null,

	init : function(htOptions){
		$.extend(true, this.htOptions, htOptions);
		this.cacheElement();
		this.setEvent();
		this.initData();
	},

	cacheElement : function(){
		this.welLayerOptionCount = $('#__ly_quantity');
		this.welLayerQuantity = this.welLayerOptionCount.find('.prod_quantity');

		if (this.welLayerOptionCount.find('ul').length === 0) {
			$('<ul></ul>').appendTo(this.welLayerQuantity);
		}

		this.welSelectWrapUl = this.welLayerOptionCount.find('.prod_quantity ul');
		this.welSelectWrapLi = this.welSelectWrapUl.find('li');

		this.welBtnClose = this.welLayerOptionCount.find('.bt_ly_close');
	},

	setEvent : function(){
		this.welBtnClose.on('click', $.proxy(this.onClickBtnClose, this));
	},

	initData : function(){
		this.sUrl = TMON.cart.htAPI.getOption.replace(/(\{mainDealSrl})/g, this.htOptions.sDealSrl);
		this.getOptionData();
	},

	getOptionData : function(){
		$.ajax({
			type : 'GET',
			url : this.sUrl,
			dataType : 'json',
			contentType : 'application/json; charset=UTF-8',
			success : $.proxy(function(res){
				this.doDrawElements(res.data);
			}, this),
			error : $.proxy(function(res){
				//this.handleException(res);
				this.doDrawElements(res.data);
			}, this)
		});
	},

	handleException : function(res){
		alert('오류가 발생했습니다. 다시 한 번 시도해주세요.');
		this.onClickBtnClose();
	},

	doDrawElements : function(htData){
		var nMaxCount = 0;
		if (htData && htData.data) {
			nMaxCount = htData.oneManMaxCount;
		} else {
			nMaxCount = this.htOptions.sDefaultMaxCount;
		}

		var i, nCurrentLength = this.welSelectWrapLi.length;

		this.welSelectWrapUl.find('li button.selected').removeClass('selected');

		if (nMaxCount > 0 && nCurrentLength != nMaxCount) {
			if (nCurrentLength > nMaxCount) {
				// 선택 가능한 옵션 최대 갯수가 현재 레이어에 담고 있는 갯수보다 적을 때
				for (i = 0; i < nCurrentLength - nMaxCount; i++) {
					this.welSelectWrapUl.find('li').last().remove();
				}
			} else if (nCurrentLength < nMaxCount) {
				// 선택 가능한 옵션 최대 갯수가 현재 레이어에 담고 있는 갯수보다 많을 때
				for (i = 1; i <= nMaxCount - nCurrentLength; i++) {
					var wel = $('<li><button type="button"><span>' + (nCurrentLength + i) + '</span></button></li>').appendTo(this.welSelectWrapUl);
					wel.find('button').on('click', $.proxy(this.onClickBtnSelect, this));
				}
			}
		}

		this.welSelectWrapUl.find('li:nth-child(' + this.htOptions.sSelectedCount + ') button').addClass('selected');

		this.welLayerOptionCount.show();
	},

	onClickBtnClose : function(){
		this.welLayerOptionCount.hide();
	},

	onClickBtnSelect : function(e){
		var welSelect = $(e.currentTarget);

		this.welSelectWrapUl.find('li:nth-child(' + this.htOptions.sSelectedCount + ') button').removeClass('selected');
		welSelect.addClass('selected');
		this.onClickBtnClose();

		(this.htOptions.cbResult || function(){})(welSelect.find('span').html());
	}
};