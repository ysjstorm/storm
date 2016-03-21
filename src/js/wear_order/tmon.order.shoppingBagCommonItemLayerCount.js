/**
 * 쇼핑백의 수량 선택 레이어 동작
 * @constructor
 */
var shoppingBagCommonItemLayerCount = function(oCommonItem){
    this.oCommonItem = oCommonItem;
	this.init();
};

shoppingBagCommonItemLayerCount.prototype = {
	init: function() {
		this.cacheElement();
		this.setEvent();
	},

	cacheElement: function(){
        this.welLayer = $("#_layerSelectCount");
        this.welSelectOptions = this.welLayer.find("li");
	},

	setEvent: function(){
		$("#_commonItemList").on("click", "._btnChangeCount", $.proxy(this.onClickChangeCount, this));
		this.welLayer.find(".btn_detail_cancel:first").click($.proxy(this.hideLayer, this));
		this.welLayer.on("click", "input", $.proxy(this.onSelect, this));
    },

	onClickChangeCount : function(e){
		var wel = $(e.currentTarget);
		var welWrap = wel.parents(".price_area:first");
        this.welCurrent = welWrap; // 현재 수정중인 레이어
		this.showLayer(welWrap, parseInt(wel.attr("data-maxbuycount"), 10));
	},

	onSelect : function(e){
        var wel = $(e.currentTarget);
        var nSelectedCount = parseInt(wel.val(), 10);
        this.welCurrent.find(".select_dp").text(nSelectedCount);
        this.oCommonItem.changeCount(this.welCurrent.parents("li:first"));
        this.hideLayer();
	},

	showLayer : function(welCountWrap, nMaxCount){
		var welCountDisplay = welCountWrap.find(".select_dp");
		TMON.commonWear.layerOpen();
		var nCurrentCount = parseInt(welCountDisplay.text(), 10);
        this.welLayer.show();

		this.scrollSelectedElementToCenter(nCurrentCount);
        this.welSelectOptions.hide().slice(0, nMaxCount).show(); // 딜의 최대 구매 수량 만큼만 옵션을 보여준다.

	},

	hideLayer : function(){
		history.back();
		this.welLayer.hide();
        this.welSelectOptions.find("input").prop("checed", false);
	},

	/**
	 * 이전에 선택한 구매횟수를 화면 중간으로 오게 스크롤 한다.
	 */
	scrollSelectedElementToCenter : function(nSelectedCount){
		var welScroll = this.welLayer.find(".ly_contents");
		var welTarget = this.welSelectOptions.eq(nSelectedCount-1);
		welScroll.scrollTop(0);
		var nScroll = welTarget.position().top - (welScroll.height() / 2) + (welTarget.height() / 2);
		welScroll.scrollTop(nScroll);
		welTarget.find("input").prop("checked", true);
	}

};