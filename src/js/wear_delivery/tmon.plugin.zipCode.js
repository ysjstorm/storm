/**
 * 상품 발송 요청 메인
 * @constructor
 */
var zipCode = function(oParent){
	this.oParent = oParent;
	this.init();
};

zipCode.prototype = {
	MAX_ADDRESS_LIST_COUNT : 100, // 화면에 표시할 리스트 최대 개수
	nTimer : 0,

	init: function() {
		this.cacheElement();
		this.setTemplate();
		this.setEvent();
		this.nOriginalWinHeight = this.welWin.height();
	},

	cacheElement : function(){
		this.welWin = $(window);
		this.welBody = $("body");
		this.welLayer = $("#_layerZipcode");

		//도로명 검색
		this.welStreetWrap = $("#_streetInput");
		this.welStreetInput = this.welStreetWrap.find(".inp_keyword");
		this.welStreetResultWrap = $("#_streetResult");
		this.welStreetResultContainer = this.welStreetResultWrap.find("tbody");
		this.welStreetResultEmpty = this.welStreetResultWrap.find(".empty");
		this.welStreetResultcount = this.welStreetResultWrap.find("._cnt");
		this.welStreetResultTable = this.welStreetResultWrap.find(".result_tbl");
		this.welStreetCounter = $("#_normalResultSt");
		this.welStreetCounterOver = $("#_overflowResultSt");

		// 지번 검색
		this.welAddrWrap = $("#_addrInput");
		this.welAddrInput = this.welAddrWrap.find(".inp_keyword");
		this.welAddrResultWrap = $("#_addrResult");
		this.welAddrResultContainer = this.welAddrResultWrap.find("tbody");
		this.welAddrResultEmpty = this.welAddrResultWrap.find(".empty");
		this.welAddrResultcount = this.welAddrResultWrap.find("._cnt");
		this.welAddrResultTable = this.welAddrResultWrap.find(".result_tbl");
		this.welCounter = $("#_normalResult");
		this.welCounterOver = $("#_overflowResult");

		this.welMenu = this.welLayer.find("ul.tab li");
	},

	setTemplate : function(){
		this.tplStreetItem = Handlebars.compile($("#zipcodeSearchZipResult").html()); // 도로명 검색 결과 아이템
		this.tplAreaItem = Handlebars.compile($("#zipcodeSearchAddressResult").html()); // 지번 검색 결과 아이템
	},

	setEvent: function() {
		this.welLayer.on("click", ".btn_detail_cancel", $.proxy(this.hide, this));
		this.welLayer.on("click", "ul.tab li", $.proxy(this.onClickTab, this));

		// 도로명 검색
		this.welStreetWrap.on("click", ".bt_del", $.proxy(this.onClickClearStreetInput, this)); // 입력창 클리어
		this.welStreetWrap.on("click", ".bt_srch", $.proxy(this.onClickSearchStreet, this)); // 검색
		this.welStreetResultContainer.on("click", "a", $.proxy(this.onSelectStreetAddress, this)); // 검색결과 선택

		// 지번 검색
		this.welAddrWrap.on("click", ".bt_del", $.proxy(this.onClickClearAddrInput, this)); // 입력창 클리어
		this.welAddrWrap.on("click", ".bt_srch", $.proxy(this.onClickSearchAddress, this)); // 검색
		this.welAddrResultContainer.on("click", "a", $.proxy(this.onSelectStreetAddress, this)); // 검색결과 선택
	},

	onClickTab : function(e){
		var welSel = $(e.currentTarget);
		var sClass = welSel.attr("data-class");

		this.welMenu.removeClass("on");
		welSel.addClass("on");

		this.welLayer.find("div._streetName, div._addr").hide();
		this.welLayer.find("." + sClass).show();
	},

	/**
	 * 도로명 검색, 검색어 제거
	 */
	onClickClearStreetInput : function(){
		this.welStreetInput.val("");
	},

	/**
	 * 도로명 검색, 검색어 제거
	 */
	onClickClearAddrInput : function(){
		this.welAddrInput.val("");
	},

	onClickSearchStreet : function(){
		var sVal = this.welStreetInput.val();

		if(!sVal){
			alert("주소명을 입력하셔야 합니다.");
			return;
		}

		this.getAddress(sVal, true);
	},

	onClickSearchAddress : function(){
		var sVal = this.welAddrInput.val();

		if(!sVal){
			alert("주소명을 입력하셔야 합니다.");
			return;
		}

		this.getAddress(sVal, false);
	},

	/**
	 * Android의 경우 키보드가 열려 있을때 화면에 떠 있는 레이어 크기가 줄어드는 문제 수정
	 */
	bindVirtualKeyboardEvent : function(){
		if(TMON.bIsAndroid){
			this.nTimer = setInterval($.proxy(this.onShowVirtualKeyboard, this), 300);
		}
	},

	unbindVirtualKeyboardEvent : function(){
		if(TMON.bIsAndroid) {
			clearInterval(this.nTimer);
			this.welBody.removeClass("active-input");
		}
	},

	/**
	 * Android의 경우 키보드가 열려 있을때 화면에 떠 있는 레이어 크기가 줄어드는 문제 수정
	 */
	onShowVirtualKeyboard : function(){
		if(this.welWin.height() < this.nOriginalWinHeight){
			this.welBody.addClass("active-input");
		}else{
			this.welBody.removeClass("active-input");
		}
	},

	show : function(){
		this.bindVirtualKeyboardEvent();
		TMON.commonWear.layerOpen();
		this.welLayer.show();
	},

	hide : function(){
		this.unbindVirtualKeyboardEvent();
		history.back();
		this.welLayer.hide();
	},

	reset : function(){

	},

	getAddress : function(sValue, bIsStreet){
		this.bIsStreet = bIsStreet;
		$.get(TMON.wearDelivery.htAPI.getPostCodeAjax,
			{
				input_data : sValue,
				flag : bIsStreet ? "street" : ""
		},
			$.proxy(this.cbGetAddress, this));
	},

	cbGetAddress : function(res){
		var bNoResult = false;
		var htData = null;

		if(!res.data){
			bNoResult = true;
		}else{
			htData = JSON.parse(res.data);
			bNoResult = !htData.result;
		}

		if(bNoResult){ // 검색 결과가 없으면
			this.bIsStreet ? this.showEmptyStreet() : this.showEmptyArea();
			return;
		}

		var aItems = htData.result.data.slice(0, this.MAX_ADDRESS_LIST_COUNT);
		var nCount = htData.result.data.length;

		if(this.bIsStreet){
			this.showStreetItem(aItems);
			this.welStreetResultcount.html(nCount);
		}else{
			this.showAreaItem(aItems);
			this.welAddrResultcount.html(nCount);
		}

		if(nCount > this.MAX_ADDRESS_LIST_COUNT){
			this.welStreetCounterOver.show();
			this.welStreetCounter.hide();

			this.welCounterOver.show();
			this.welCounter.hide();
		}else{
			this.welStreetCounterOver.hide();
			this.welStreetCounter.show();

			this.welCounterOver.hide();
			this.welCounter.show();
		}
	},

	showEmptyStreet : function(){
		this.welStreetResultTable.hide();
		this.welStreetResultEmpty.show();
		this.welStreetResultcount.html(0);
	},

	showEmptyArea : function(){
		this.welAddrResultTable.hide();
		this.welAddrResultEmpty.show();
		this.welAddrResultcount.html(0);
	},

	showStreetItem : function(aItems){
		this.welStreetResultTable.show();
		this.welStreetResultEmpty.hide();
		this.welStreetResultContainer.html(this.tplStreetItem({aItems : aItems}));
	},

	onSelectStreetAddress : function(e){
		var wel = $(e.currentTarget).parents("tr");
		var htData = {
			sZip : wel.attr("data-zip"), // 우편번호
			sStreet : wel.attr("data-street") || "", // 도로명 주소
			sAddress : wel.attr("data-address") // 지역 주소
		};
		this.oParent.afterSelectAddress(htData);
		this.hide();

		return false;
	},

	showAreaItem : function(aItems){
		this.welAddrResultTable.show();
		this.welAddrResultEmpty.hide();
		this.welAddrResultContainer.html(this.tplAreaItem({aItems : aItems}));
	}
};