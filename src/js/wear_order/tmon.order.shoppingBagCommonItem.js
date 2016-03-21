/**
 * 쇼핑백의 일반상품 관련 동작
 * @constructor
 */
var shoppingBagCommonItem = function(){
	this.init();
};

shoppingBagCommonItem.prototype = {
    nSelectTimer : 0,
    htData : { // AJAX 요청시 기본 데이터 구조
        actionType : "SELECT", // "UPDATE", "REMOVE"

        targetItems : [ // 수정이 일어난 아이템 데이터
            {
                dealSrl : 1234,
                mainDealSrl : 1234,
                count : 0,
                addedTimestamp : 0
            }
        ],

        selectedItems : [ // 선텍된 아이템 데이터
            {
                dealSrl : 1234,
                mainDealSrl : 1234,
                count : 0,
                addedTimestamp : 0
            }
        ]
    },

	init: function() {
        this.nCartTotalCount = parseInt($("#_cartLink").find(".badge").html(), 10) || 0; // 카트에 담긴 수
        this.oLayerCount = new shoppingBagCommonItemLayerCount(this);
        this.oOptionChange = new shoppingBagCommonItemOptionChange(this);
		this.cacheElement();
		this.setEvent();
	},

	cacheElement: function(){
        this.welWin = $(window);
        this.welList = $("#_commonItemList");
        this.welCheckAll = $("#_commonItemCheckAll");
        this.welTotalItemPrice = $("#_totalItemPrice"); // 상품금액 합계
        this.welTotalDelivary = $("#_totalDeliveryPrice"); // 배송비 합계
        this.welTotalPayment = $("#_totalPayment"); // 총 결제 금액

        this.welTotalPaymentHeader = $("#_commonItemHeader em.point"); // 헤더의 결제예정금액
        this.welTotalCountHeader = $("#_commonItemHeader .cnt"); // 헤더의 아이템 개수

        this.welEmpty = $("#_commonItemEmpty");
	},

	setEvent: function(){
        this.welCheckAll.click($.proxy(this.onClickCheckAll, this));
        this.welList.on("click", ".left_area > input", $.proxy(this.onSelectItem, this));
        this.welList.on("click", ".btn_delete", $.proxy(this.onDeleteItem, this));
        $("#_buy").click($.proxy(this.onBuyAll, this)); // 선택 아이템 전체구매
        this.welList.on("click", "._buyItem", $.proxy(this.onBuyItem, this)); // 각 아이템 구입하기
    },

    /**
     * 일반 상품 전체 선택 / 해제
     */
    onClickCheckAll : function(e){
        if(this.welCheckAll.is(":checked")){
            this.welList.find(".left_area > input").prop("checked", true);
        }else{
            this.welList.find(".left_area > input").prop("checked", false);
        }

        this.onSelectItem();
    },

    /**
     * 아이템 체크박스 선택시
     */
    onSelectItem : function(){
        if(this.nSelectTimer){
            return;
        }

        // 체크박스를 빠르게 계속 클릭하여 서버에 부하가 가는 문제가 있어서 0.5초마다 한번씩만 요청하게 수정
        this.nSelectTimer = setTimeout($.proxy(function(){
            this.htData.actionType = "SELECT";
            this.htData.targetItems = [];
            this.modifyItem();
            this.nSelectTimer = 0;
        }, this), 500);
    },

    onDeleteItem : function(e){
        if(!confirm("해당 상품을 삭제하시겠습니까?")){
            return false;
        }

        this.htData.actionType = "REMOVE";
        var welLi = $(e.currentTarget).parents("li:first");
        this.htData.targetItems = [this.getDealInfoByElement(welLi)];
        this.welRemoveLi = welLi;
        this.modifyItem();
    },

    onUpdateItem : function(welLi){
        this.htData.actionType = "UPDATE";
        this.htData.targetItems = [this.getDealInfoByElement(welLi)];
        this.modifyItem();
    },

    getDealInfoByElement : function(wel){
        return {
            dealSrl :  wel.attr("data-dealsrl"),
            mainDealSrl : wel.attr("data-maindealsrl"),
            count : parseInt(wel.find(".select_dp:first").text(), 10),
            addedTimestamp :  wel.attr("data-addedtimestamp")
        };
    },

    getItemData : function(){
        //선택된 아이템을 가져온다.
        this.htData.selectedItems = this.getSelectedItem();

        // 아이템 옵션 변경의 경우, 변경될 옵션 아이템은 제외하고, 변경 후의 딜옵션 정보를 넘겨야 한다.
        if(this.htData.actionType == "CHANGE"){
            this.htData.selectedItems.push(this.htChangeOptionInfo);
            this.oOptionChange.closeOptionLayer();
        }

        return this.htData;
    },

    /**
     * 선택된 아이템 리스트 반환
     * @returns {Array}
     */
    getSelectedItem : function(){
        var aSelectedItem = [];
        var welCheckbox = this.welList.find(".left_area > input");

        for(var i= 0, max=welCheckbox.length ; i<max; i++){
            if(welCheckbox.eq(i).prop("checked") == false){
                continue;
            }

            var welLi = welCheckbox.eq(i).parents("li:first");

            // 아이템 삭제일 경우, 삭제되는 아이템은 선택 아이템에서 제외한다.
            if(this.htData.actionType == "REMOVE" && welLi.attr("data-dealsrl") == this.welRemoveLi.attr("data-dealsrl")){
                continue;
            }

            // 아이템 옵션 변경의 경우, 변경될 옵션 아이템은 제외하고, 변경 후의 딜옵션 정보를 넘겨야 한다.
            if(this.htData.actionType == "CHANGE" && welLi.attr("data-dealsrl") == this.welChangeOptionOriginal.attr("data-dealsrl")){
                continue;
            }

            aSelectedItem.push(this.getDealInfoByElement(welLi));
        }

        return aSelectedItem;
    },

    modifyItem : function(){
        $.ajax({
            type : 'POST',
            url : TMON.order.htAPI.modifyCart,
            data : JSON.stringify(this.getItemData()),
            dataType : 'json',
            contentType : "application/json; charset=UTF-8",
            success : $.proxy(this.cbModifyItem, this),
            error : $.proxy(function(res) {
                if(res.responseJSON.data.errorCode || res.responseJSON.data.errorMessage){
                    this.handleDealExpection(res.responseJSON.data.errorCode, res.responseJSON.data.errorMessage, res.responseJSON.data.errorInfo);
                }
            }, this)
        });
    },

    cbModifyItem : function(res){
        // 삭제의 경우 해당 아이템을 화면에서 제거한다
        if(this.htData.actionType == "REMOVE"){
            this.removeItemFromView();
            TMON.commonWear.updateShoppingbagCount();
        }else if(this.htData.actionType == "CHANGE"){ //옵션 변경의 경우, 엘리먼트의 딜번호와 옵션을 변경해준다.
            this.changeItemOptionView();
        }

        this.update(res.data);
        this.htData.actionType = "";
    },

    update : function(htData){
        this.updateGroup(htData.groups);
        this.updateItemInfo(htData.deals);
        this.updateTotal(htData.cartAmount);
    },

    /**
     * 상품 정보 화면 업데이트
     * @param htGroups
     */
    updateItemInfo : function(htItems){
        for(var sDealNo in htItems) {
            var welItem = this.welList.find("li[data-dealsrl=" + sDealNo + "]");
            welItem.find(".price strong").html(TMON.util.numberWithComma(htItems[sDealNo].price)); // 가격 업데이트
        }
    },

    /**
     * 상품 그룹 업데이트
     * @param htGroups
     */
    updateGroup : function(htGroups){
        var welGroup = this.welList.find(".sbag_product_list");

        // 선택된 아이템이 없는 그룹의 경우 데이터가 넘어오지 않는다 -> 이경우엔 합계를 0으로 만들어주기 위해 해당 그룹의 데이터를 0으로 채워 넣는다
        var htAllGroupData = {};
        for(var i= 0, max = welGroup.length; i<max; i++){
            var sGroupId = welGroup.eq(i).attr("data-groupno");
            if(htGroups[sGroupId]){
                htAllGroupData[sGroupId] = htGroups[sGroupId];
            }else{
                htAllGroupData[sGroupId] = {};
                htAllGroupData[sGroupId].buyAmount = 0;
                htAllGroupData[sGroupId].deliveryAmount = 0;
                htAllGroupData[sGroupId].totalAmount = 0;
            }
        }

        for(var sGroupId in htAllGroupData){
            var welGroup = this.welList.find(".sbag_product_list[data-groupno=" + sGroupId + "]");
            welGroup.find("._itemPrice").html(TMON.util.numberWithComma(htAllGroupData[sGroupId].buyAmount)); // 상품 금액
            welGroup.find("._itemDeliveryPrice").html(TMON.util.numberWithComma(htAllGroupData[sGroupId].deliveryAmount)); // 배송비
            welGroup.find("._totalItemPrice").html(TMON.util.numberWithComma(htAllGroupData[sGroupId].totalAmount)); // 전체 금액
        }
    },

    /**
     * 전체 금액 업데이트
     * @param htData
     */
    updateTotal : function(htData){
        this.welTotalItemPrice.html(htData ? TMON.util.numberWithComma(htData.buyAmount) : 0); // 상품금액 합계
        this.welTotalDelivary.html(htData ? TMON.util.numberWithComma(htData.deliveryAmount) : 0); // 배송비 합계
        this.welTotalPayment.html(htData ? TMON.util.numberWithComma(htData.totalAmount) : 0); // 총 결제 금액
        this.welTotalPaymentHeader.html(htData ? TMON.util.numberWithComma(htData.totalAmount) : 0); // 헤더의 결제 예정 금액
    },

    /**
     * 화면에서 아이템 제거
     */
    removeItemFromView : function(){
        var welGroup = this.welRemoveLi.parents(".sbag_product_list:first");
        this.welRemoveLi.remove();

        if(welGroup.find("li").length == 0){ // 다른 옵션 아이템이 없을 경우 그룹 삭제
            welGroup.remove();
        }

        var nItemCount = this.welList.find("li").length;
        this.welTotalCountHeader.html(nItemCount); //헤더의 아이템 카운트 업데이트
        if(nItemCount == 0){
            this.showEmpty();
        }
    },

    showEmpty : function(){
        this.welList.find(".order_title:first").hide();
        this.welList.find(".sbag_total:first").hide();

        this.welEmpty.show();
    },

    /**
     * 선택상품 전체구매
     */
    onBuyAll : function(){
        var aSelectedItems = this.getSelectedItem();
        if(aSelectedItems.length == 0){
            alert("상품을 선택해 주세요.");
            return;
        }

        $.ajax({
            type : 'POST',
            url : TMON.order.htAPI.gnSubmit + (TMON.view_mode == "app" ?  "?" + TMON.sAppQuery : ""),
            data : JSON.stringify(this.getSelectedItem()),
            dataType : 'json',
            contentType : "application/json;charset=UTF-8",
            success : $.proxy(this.cbBuyAll, this),
            error : $.proxy(function(res) {
                if(res.responseJSON.data.errorCode || res.responseJSON.data.errorMessage){
                    this.handleDealExpection(res.responseJSON.data.errorCode, res.responseJSON.data.errorMessage, res.responseJSON.data.errorInfo);
                }
            }, this)
        });
    },

    /**
     * 상품 구매시 에러처리
     */
    handleDealExpection : function(sErrorCode, sErrorMsg, htErrorInfo){
        var sMsg = "";
        var htDealInfo = {};

        if(htErrorInfo.dealSrl){
            htDealInfo = this.getDealTitleByDealSrl(htErrorInfo.dealSrl);
        }

        switch(sErrorCode){
            case "ORDER_000" : // 시스템 오류
                sMsg = sErrorMsg + "\n" + htErrorInfo.message; // "시스템 오류 입니다."
                break;
            case "ORDER_100" : // 필수 파라미터에 오류
                sMsg = sErrorMsg + "\n" + htErrorInfo.message; // "필수 파라미터에 오류가 있습니다."
                break;
            case "CART_101" : // 존재하지 않는 딜 번호
                sMsg = sErrorMsg; // "유효하지 않은 딜입니다."
                break;
            case "CART_102" : // 최소 구매 수량 미달
                if(this.htData.actionType == "CHANGE") { // 옵션 변경의 경우
                    sMsg = "선택하신 옵션의 최소 구매수량은 " + htErrorInfo.available + "개 입니다.\n" + htErrorInfo.available +"개 이상으로 수량 변경 후 옵션을 변경해주세요.";
                }else{
                    sMsg = htDealInfo.sTitle + " 상품의 구매 가능한 최소수량은 ‘" + htErrorInfo.available + "’입니다.";
                }
                break;
            case "CART_103" : // 최대 구매 수량 초과
                if(this.htData.actionType == "CHANGE") { // 옵션 변경의 경우
                    sMsg = "선택하신 옵션의 최대 구매수량은 " + htErrorInfo.available + "개 입니다.\n" + htErrorInfo.available +"개 이하로 수량 변경 후 옵션을 변경해주세요.";
                }else if(htDealInfo.bIsMainDeal){ // 메인딜일 경우
                    sMsg = htDealInfo.sTitle + " 상품의 최대 구매 수량은 '" + htErrorInfo.available + "’입니다.";
                }else{ // 옵션 딜일 경우
                    sMsg = htDealInfo.sTitle + " 상품의 해당 옵션 최대 구매 수량을 " + htErrorInfo.available + "개로 변경합니다.";
                    htDealInfo.welLi.find("._btnChangeCount").attr("data-maxbuycount", htErrorInfo.available);
                    htDealInfo.welLi.find(".select_dp").html(htErrorInfo.available);
                }

                break;
            case "CART_104" : // 매진
                sMsg = htDealInfo.sTitle + " 상품은 매진되었습니다.";
                this.setItemAsSoldout(htDealInfo.welLi);
                break;
            case "CART_105" : // 일시 정지
                sMsg = htDealInfo.sTitle + " 상품은 현재 판매하지 않습니다.";
                this.setItemAsSoldout(htDealInfo.welLi);
                break;
            case "CART_106" : // 판매기간 불일치
                sMsg = htDealInfo.sTitle + " 상품은 판매기간이 아닙니다.";
                this.setItemAsSoldout(htDealInfo.welLi);
                break;
            case "CART_107" : // 바로 구매 전용 딜
                sMsg = htDealInfo.sTitle + " 상품은 카트 담기 불가 딜 입니다.";
                this.setItemAsSoldout(htDealInfo.welLi);
                break;
        }

        if(sMsg){
            alert(sMsg);
        }else if(sErrorMsg){
            alert(sErrorMsg);
        }

        if(htDealInfo.welLi && htDealInfo.welLi.length){
            this.welWin.scrollTop(htDealInfo.welLi.offset().top - 70); // 해당 엘리먼트로 스크롤 해준다.
        }

        this.htData.actionType = "";
    },

    /**
     * 매진, 판매종료시에 아이템을 선택되지 않게 한다.
     * @param welLi
     */
    setItemAsSoldout : function(welLi){
        welLi.addClass("sold_out");
        welLi.find("input[type=checkbox]").remove(); // 체크 박스 제거
        welLi.find("span.checkbox_custom").remove(); // 체크 박스 제거
    },

    /**
     *
     * @param nDealSrl 메인딜 또는 옵션딜 넘버 둘중 하나
     */
    getDealTitleByDealSrl : function(nDealSrl){
        // 메인딜 넘버인지 확인
        var welLi = this.welList.find("li[data-maindealsrl='"+nDealSrl+"']");
        var bIsMainDeal = true;

        if(welLi.length == 0){
            welLi = this.welList.find("li[data-dealsrl='"+nDealSrl+"']");
            bIsMainDeal = false;
        }

        var sTitle = welLi.find("a.product_name").eq(0).text();
        return {
            welLi : welLi,
            sTitle : sTitle,
            bIsMainDeal : bIsMainDeal
        }
    },

    cbBuyAll : function(res){
        if(!res.data){
            alert("구매정보를 확인해 주세요.");
            return;
        }

        if(TMON.view_mode == 'app') {
            var sQuery = (res.data.indexOf("?") < 0 ? "?" : "&") + TMON.sAppQuery + "&_sendAfterLogin=plz";
            TMON.app.callApp('cart', 'goBuy', res.data + sQuery);
        }else{
            location.href = res.data;
        }
    },

    onBuyItem : function(e){
        var welLi = $(e.currentTarget).parents("li:first");
        var aItem = [
            this.getDealInfoByElement(welLi)
        ];

        $.ajax({
            type : 'POST',
            url : TMON.order.htAPI.gnSubmit + (TMON.view_mode == "app" ?  "?" + TMON.sAppQuery : ""),
            data : JSON.stringify(aItem),
            dataType : 'json',
            contentType : "application/json;charset=UTF-8",
            success : $.proxy(this.cbBuyItem, this),
            error : $.proxy(function(res) {
                if(res.responseJSON.data.errorCode){
                    this.handleDealExpection(res.responseJSON.data.errorCode, res.responseJSON.data.errorMessage, res.responseJSON.data.errorInfo);
                }
            }, this)
        });

        return false;
    },

    cbBuyItem : function(res){
        if(!res.data){
            alert("구매정보를 확인해 주세요.");
            return;
        }

        if(TMON.view_mode == 'app') {
            var sQuery = (res.data.indexOf("?") < 0 ? "?" : "&") + TMON.sAppQuery + "&_sendAfterLogin=plz";
            TMON.app.callApp('cart', 'goBuy', res.data + sQuery);
        }else{
            location.href = res.data;
        }
    },

    /**
     * 수량 변경 완료 후
     * tmon.order.shoppingBagCommonItemLayerCount.js 에서 불려진다.
     * @param welLi
     */
    changeCount : function(welLi){
        this.onUpdateItem(welLi);
    },

    /**
     * 옵션 변경 완료 후
     * tmon.order.shoppingBagCommonItemOptionChange.js 에서 호출된다
     */
    changeOption : function(welLi, htSelectedInfo, aOptionName){
        this.htData.actionType = "CHANGE";
        this.welChangeOptionOriginal = welLi;
        this.aChangedOptionName = aOptionName;
        this.nChangedOptionRestCount = parseInt(htSelectedInfo.sRestCount, 10); // 바뀐 최대 구매 수량

        var htOriginal = this.getDealInfoByElement(welLi); // 바뀌기 전 아이템
        var htChanged = { // 바뀐 후 아이템
            dealSrl : htSelectedInfo.sDealNo,
            mainDealSrl : htSelectedInfo.sMainDealNo,
            count : htOriginal.count
        };

        this.htChangeOptionInfo = htChanged;
        this.htData.targetItems = [htOriginal, htChanged];
        this.modifyItem();
    },

    /**
     * 옵션 변경후 엘리먼트에 딜번호와 옵션 정보를 변경해 준다.
     */
    changeItemOptionView : function(){
        this.welChangeOptionOriginal.attr("data-maindealsrl", this.htChangeOptionInfo.mainDealSrl);
        this.welChangeOptionOriginal.attr("data-dealsrl", this.htChangeOptionInfo.dealSrl);

        // 옵션 이름 업데이트
        this.welChangeOptionOriginal.find("span.option").eq(0).html(this.aChangedOptionName[0]);
        this.welChangeOptionOriginal.find("button._changeOption").attr("data-optiondepth1", this.aChangedOptionName[0]);
        this.welChangeOptionOriginal.find("span.option").eq(1).html(this.aChangedOptionName[1]);
        this.welChangeOptionOriginal.find("button._changeOption").attr("data-optiondepth2", this.aChangedOptionName[1]);

        // 옵션 최대 선택 수량 업데이트
        this.welChangeOptionOriginal.find("._btnChangeCount").attr("data-maxbuycount", this.nChangedOptionRestCount);
    }
};