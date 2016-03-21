/**
 * 쇼핑백의 일반상품 관련 동작
 * @constructor
 */
var shoppingBagTicketItem = function(){
	this.init();
};

shoppingBagTicketItem.prototype = {
	init: function() {
		this.nCartTotalCount = parseInt($("#_cartLink").find(".badge").html(), 10) || 0; // 카트에 담긴 수

		this.cacheElement();
		this.setEvent();
		this.uncheckItem();
	},

	cacheElement: function(){
		this.welList = $("#_ticketItemList");
		this.nMaxSelectCount = parseInt(this.welList.attr("data-maxcount"), 10);
		this.sCartStatus = this.welList.attr("data-cartstatus");

		this.welItems = this.welList.find("ul.deal_lst2 li");
		this.welSlotList = $("#_selectedTicketItem");
		this.welSlotItems = $("#_selectedTicketItem").find("li");
		this.welBtnBuy = $("#_btnBuyTicketItem");

		this.htStatus = {
			"LOG_OFF_OR_NO_TICKET" : $("#_ticketLogOff"),
			"REMAIN" : $("#_ticketRemain"),
			"DISABLE" : $("#_ticketDisable"),
			"READY_TO_SEND" : $("#_ticketOverflow"),
			"NO_TICKET_AND_HAS_ITEM" : $("#_ticketNoTicket")
		};

		this.welExtra = $("#extra");
		this.welExtraInfo = $("#extra ._extraInfo");
		this.welTotalCountHeader = $("#_ticketItemHeader .cnt");
		this.welEmptyTicket = $("#_emptyTicket");
	},

	setEvent: function(){
		this.welList.on("click", "input[type=checkbox]", $.proxy(this.onClickCheck, this));
		this.welList.on("click", ".btn_delete", $.proxy(this.onClickDeleteItem, this)); // 상품 삭제
		this.welSlotList.on("click", ".btn_delete", $.proxy(this.onClickRemoveSlot, this));
		this.welBtnBuy.click($.proxy(this.onClickBuy, this));
	},

	/**
	 * 아이템 체크 후 구매 페이지로 갔다가 뒤로가기하면 체크가 남아있는 문제가 있어서 JS에서 해제해준다.
	 */
	uncheckItem : function(){
		this.welList.find("input[type=checkbox]").prop("checked", false);
	},

	onClickCheck : function(e){
		var wel = $(e.currentTarget);
		var welLi = wel.parents("li:first");

		if(wel.prop("checked") == true){
			this.addToSlot(welLi);
		}else{
			this.removeItemFromSlotByDealNo(welLi.attr("data-dealsrl"), welLi.attr("data-addedtimestamp"));
		}
	},

	addToSlot : function(welLi){
		var welSlot = this.welSlotItems.filter(".empty").eq(0);

		// 이미 3개가 다 찬 경우
		if(welSlot.length == 0){
			alert("3개의 상품을 모두 선택하였습니다.");
			welLi.find("input[type=checkbox]").prop("checked", false);
			return false;
		}

		welSlot.attr("data-maindealsrl", welLi.attr("data-maindealsrl"));
		welSlot.attr("data-dealsrl", welLi.attr("data-dealsrl"));
		welSlot.attr("data-addedtimestamp", welLi.attr("data-addedtimestamp"));
		welSlot.find("figure").css({
			"background-image" : "url(" + welLi.find("img").attr("src") + ")"
		});
		welSlot.removeClass("empty");
		this.toggleTicketBuyButtonAndSlotList();
	},

	toggleTicketBuyButtonAndSlotList : function(){
		// 아이템이 전부 슬롯에 찼을 경우, "발송요청하기"버튼에 disable 클래스를 업앤다
		if(this.welSlotItems.filter(".empty").length == 0){
			this.welBtnBuy.removeClass("disable");
		}else{
			this.welBtnBuy.addClass("disable");
		}

		// 슬롯이 모두 비었을 경우, 슬롯 리스트를 숨긴다
		if(this.welSlotItems.filter(".empty").length == this.welSlotItems.length) {
			this.welSlotList.hide();
		}else{
			this.welSlotList.show();
		}
	},

	removeItemFromSlotByDealNo : function(sDealNo, sTimestamp){
		var welSlot = this.welSlotItems.filter("[data-dealsrl=" + sDealNo + "][data-addedtimestamp=" + sTimestamp + "]");
		this.removeItemFromSlotByElement(welSlot);
	},
	
	removeItemFromSlotByElement : function(welSlot){
		if(welSlot.length == 0){
			return;
		}

		welSlot.addClass("empty");
		this.moveEmptySlotToEnd(welSlot);
		this.toggleTicketBuyButtonAndSlotList();
	},

	/**
	 * 삭제되어 빈 슬롯을 마지막으로 보낸다.
	 * @param welLi
	 */
	moveEmptySlotToEnd : function(welLi){
		welLi.appendTo(this.welSlotList);

		// 슬롯 위치가 바뀌면 welSlotItems의 순서와 매치가 안되기 때문에 다시 할당한다
		this.welSlotItems = $("#_selectedTicketItem").find("li");
	},

	onClickRemoveSlot : function(e){
		var welSlot = $(e.currentTarget).parents("li:first");
		this.removeItemFromSlotByElement(welSlot);
		this.uncheckItemByDealNo(welSlot.attr("data-dealsrl"), welSlot.attr("data-addedtimestamp"));
	},

	uncheckItemByDealNo : function(sDealNo, sTimestamp){
		this.welList.find("li[data-dealsrl=" + sDealNo + "][data-addedtimestamp=" + sTimestamp + "]  input[type=checkbox]").prop("checked", false);
	},

	getSelectedItems : function(){
		var aItems = [];

		for(var i= 0, max = this.welSlotItems.length; i<max; i++){
			var wel = this.welSlotItems.eq(i);
			var htItem = {};
			htItem.mainDealSrl = wel.attr("data-maindealsrl");
			htItem.dealSrl = wel.attr("data-dealsrl");
			htItem.addedTimestamp = wel.attr("data-addedtimestamp");
			htItem.count = 1; // 티켓 상품의 수량은 무조건 1개
			aItems.push(htItem);
		}

		return aItems;
	},

	onClickBuy : function(){
		if(this.welBtnBuy.hasClass("disable")){
			return false;
		}

		this.buyItem();
		return false;
	},

	buyItem : function(){
		$.ajax({
			type : 'POST',
			url : TMON.order.htAPI.tnSubmit + (TMON.view_mode == "app" ?  "?" + TMON.sAppQuery : ""),
			data : JSON.stringify(this.getSelectedItems()),
			dataType : 'json',
			contentType : "application/json;charset=UTF-8",
			success : $.proxy(this.cbBuy, this),
			error : function(res) {
                if(res.responseJSON.data.errorMessage){
					alert(res.responseJSON.data.errorMessage);
				}
			}
		});
	},

	cbBuy : function(res){
		if(res.data != null){
			location.href = res.data;
		}else{
			alert("구매정보를 확인해 주세요.");
		}
	},

	/**
	 * 상품 삭제
	 */
	onClickDeleteItem : function(e){
		if(confirm("해당 상품을 삭제하시겠습니까?") == false){
			return false;
		}

		var wel = $(e.currentTarget).parents("li:first");
		this.welRemove = wel;
		
		var htRemoveTnCartInfo = {};
		htRemoveTnCartInfo.selectCount = this.welItems.not(".sold_out").length;
		htRemoveTnCartInfo.disableCount = this.welItems.filter(".sold_out").length;
		var sItemStatus = wel.attr("data-status").trim();
		if(sItemStatus){
			htRemoveTnCartInfo.removedItemStatus = sItemStatus.split(",");
		}

		htRemoveTnCartInfo.removedItem = {};
		htRemoveTnCartInfo.removedItem.dealSrl = wel.attr("data-dealsrl");
		htRemoveTnCartInfo.removedItem.mainDealSrl = wel.attr("data-maindealsrl");
		htRemoveTnCartInfo.removedItem.addedTimestamp = wel.attr("data-addedtimestamp");

		$.ajax({
			type : 'POST',
			url : TMON.order.htAPI.removeT3Item,
			data : JSON.stringify(htRemoveTnCartInfo),
			dataType : 'json',
			contentType : "application/json; charset=UTF-8",
			success : $.proxy(this.cbDeleteItem, this),
			error : function(res) {
				if(res.responseJSON.data.errorMessage){
					alert(res.responseJSON.data.errorMessage);
				}
			}
		});
	},

	cbDeleteItem : function(res){
		if(res.data && res.data.tnCartStatusType){
			this.removeItemFromSlotByDealNo(this.welRemove.attr("data-dealsrl"), this.welRemove.attr("data-addedtimestamp"));
			this.welRemove.remove();
			this.showTicketExtraInfo(res.data.tnCartStatusType);
			this.updateExtraInfo(res.data);
			TMON.commonWear.updateShoppingbagCount();
		}
	},

	/**
	 * 티켓 상품 헤더와 리스트 사이에 있는 상태 표시를 바꾸는 역활
	 * @param sStatus
	 */
	showTicketExtraInfo : function(sStatus){
		this.welExtraInfo.hide();
		this.htStatus[sStatus].show();
	},

	updateExtraInfo : function(htData){
		this.welItems = this.welList.find("ul.deal_lst2 li");

		// 쇼핑백에 담긴 선택 가능한 개수
		this.welExtra.find("._extraAddedCount").html(htData.selectCount);

		// 쇼핑백에 담아야 하는 개수
		this.welExtra.find("._extraCountToSelect").html(htData.maxCount - htData.selectCount);

		// 발송 불가 상품 수
		this.welExtra.find("._extraDisabledCount").html(htData.disableCount);

		// 쇼핑백에 담긴 전체 개수
		var nTotalCount = htData.disableCount + htData.selectCount;
		this.welTotalCountHeader.html(nTotalCount); // 헤더의 전체 카운터 업데이트
		this.welExtra.find("._extraTotalCount").html(nTotalCount);
		if(nTotalCount == 0){ // 상품이 없을 경우 empty 레이어 노출
			this.welEmptyTicket.show();
		}

		if(this.sCartStatus == "READY_TO_SEND" && nTotalCount >= this.nMaxSelectCount){ // 티켓이 있고 3개 이상 쇼핑백에 아이템이 있을경우 체크박스 활성화
			this.enableCheckboxOfList();
		}else{
			this.disableCheckboxOfList();
		}
	},

	enableCheckboxOfList : function(){
		this.welList.find(".sbag_ticket_list").addClass("chkable");
	},

	disableCheckboxOfList : function(){
		this.welList.find(".sbag_ticket_list").removeClass("chkable");
	}
};