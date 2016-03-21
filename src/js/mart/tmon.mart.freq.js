/**
 * 자주산 상품 페이지에서 필요한 이벤트를 처리한다.
 */
var martFreq = function(){
    this.init();
};


martFreq.prototype = {
    bIsAddingToCart : false,
    bIsBuyingNow : false,

    init : function(){
        this.cacheElement();
        this.setEvent();
        this.updateSelectedCounter();
    },

    cacheElement : function(){
        this.welSelectedCounter = $("#_selectedCounter");
        this.welFreqDealContainer = $("#_freqDealList");
        this.welBtnCheckAll = $("#check_all");
        this.welFreqCheckBoxs = this.welFreqDealContainer.find("input[name='check_freq']");
        this.welBtnBuyNow = $("#_btnBuyNow");
        this.welExcessAddToCartLayer = $("#_layerCartExcessCount"); // 선택한 상품이 카트에 담겼습니다. 1인당 최대 구매수량 초과 상품 ...  레이어
        this.welSuccessAddToCartLayer = $("#_layerSuccessAddToCart"); // 선택한 상품이 카트에 담겼습니다. 20,000원 더 담으면 무료배송! 레이어
        this.welCartCounter = $(".cnt:first"); // 카트 담긴 개수 표시 엘리먼트
    },

    setEvent : function(){
        this.welBtnCheckAll.click($.proxy(this.checkAll, this)); // 전체선택
        this.welBtnBuyNow.click($.proxy(this.buyNow, this)); // 바로구매 버튼
        $("#_btnAddSelectedToCart").click($.proxy(this.addSelectedToCart, this)); // 선택된 딜 카트담기

        // 체크박스 클릭시 선택된 카운터 변경
        this.welFreqDealContainer.on("change", "input[name='check_freq']", $.proxy(function(){
            this.updateSelectedCounter();
        }, this));
    },

    /**
     * 전체 선택
     */
    checkAll : function(){
        if(this.welBtnCheckAll.is(":checked")){
            this.welFreqCheckBoxs.prop("checked", true);
        }else{
            this.welFreqCheckBoxs.prop("checked", false);
        }

        this.updateSelectedCounter();
    },

    /**
     * 체크된 버튼 엘리먼트 리스트를 반환
     * @returns {*}
     */
    getSelectedCheckBoxElement : function(){
        return this.welFreqDealContainer.find("input[name='check_freq']:checked");
    },

    /**
     * 바로 구매 이벤트 핸들러
     */
    buyNow : function(){
        if(this.bIsBuyingNow){
            reutrn;
        }
        this.bIsBuyingNow = true;
        var aDealInfo = this.getSelectedDealInfo();

        if(aDealInfo.length == 0){
            this.bIsBuyingNow = false;
            alert("상품을 선택해주세요.");
            return;
        }

        $.ajax({
            url : TMON.htAPI.htMart.buyNowMulti,
            data :{
                deal_infos : aDealInfo.join(",")
            },
            dataType : "jsonp",
            success : $.proxy(this.cbBuyNow, this),
            error : function(){
                alert("잠시 후 다시 시도해주세요.");
                return;
            }
        });
    },

    cbBuyNow : function(res){
        this.bIsBuyingNow = false;
        if(res.count == 0){
    		alert("1인당 최대 구매수량을 초과한 상품, 매진 및 판매종료된 상품이 있어 바로구매가 불가능합니다. 상품의 수량을 다시 확인해 주세요.");
            return false;
    	}

        // 바로구매한 상품중에 success가 false가 하나라도 있던지, modified가 true인 상품이 하나라도 있으면 alert을 띄운후 이동한다.
        if(this.checkStatusDeal(res.cart_deal)){
            alert("1인당 최대 구매수량을 초과한 상품, 매진 및 판매종료된 상품은 자동 제외되거나 수량조절 됩니다.");
        }

        // 바로구매시에 카트키를 TMON_CART2로 쿠키에 저장한다.
        TMON.util.setCookie('TMON_CART2', res.cart_key, {path : '/', expires : 0});
        // 카트키를 가지고 바로구매 페이지로 이동한다.
        location.href = this.welBtnBuyNow.attr("data-uri") + "/" + res.cart_key +"?from=direct";
    },

    /**
     * 바로구매한 상품중에 success가 false가 하나라도 있던지, modified가 true인 상품이 하나라도 있으면 true를 리턴한다.
     */
    checkStatusDeal : function(aDealList){
        for(var i = 0, max = aDealList.length; i<max ; i++){
            if(aDealList[i].success == false || aDealList[i].modified == true){
                return true;
            }
        }
        return false;
    },

    /**
     * 선택된 딜의 배열 정보를 넘긴다.
     * return ["메일딜시리얼|딜시리얼|수량|", "메일딜시리얼|딜시리얼|수량|", ..... ]
     */
    getSelectedDealInfo : function(){
        var aDeal = [];
        var welSelectedCheckBox = this.getSelectedCheckBoxElement();

        for(var i= 0, max=welSelectedCheckBox.length; i<max; i++){
            var wel = welSelectedCheckBox.eq(i).closest("li");
            var htDeal = this.getDealNoFromElement(wel);
            aDeal.push(htDeal.sMainDealNo + "|" + htDeal.sOptionDealNo + "|" +  parseInt(wel.find(".select-number").html(), 10));
        }
        return aDeal;
    },

    /**
     * 엘리먼트의 attribute에 들어 있는 딜넘버를 리턴한다.
     * @param wel
     * @returns {{sMainDealNo: *, sOptionDealNo: *}}
     */
    getDealNoFromElement : function(wel){
        return {
            sMainDealNo : wel.attr("data-maindealno"),
            sOptionDealNo : wel.attr("data-dealno")
        }
    },

    /**
     * 선택된 딜 개수 카운터를 업데이트 한다.
     */
    updateSelectedCounter : function(){
        var welSelected = this.getSelectedCheckBoxElement();
        this.welSelectedCounter.html(welSelected.length);
    },

    /**
     * 선택된 딜을 카트에 추가한다.
     */
    addSelectedToCart : function(){
        if(this.bIsAddingToCart){
            return;
        }
        this.bIsAddingToCart = true;

        var aDealInfo = this.getSelectedDealInfo();

        if(aDealInfo.length == 0){
            this.bIsAddingToCart = false;
            alert("상품을 선택해주세요.");
            return;
        }

        $.ajax({
            url : TMON.htAPI.htMart.addToCartMulti,
            data :{
                deal_infos : aDealInfo.join(",")
            },
            dataType : "jsonp",
            success : $.proxy(this.cbAddSelectedToCart, this),
            error : function(){
                alert("잠시 후 다시 시도해주세요.");
                this.bIsAddingToCart = false;
            }
        });
    },

    cbAddSelectedToCart : function(res){
        this.bIsAddingToCart = false;
        this.welCartCounter.html(res.count).show(); // 카트 담긴 개수 업데이트
        var aDeals = res.cart_deal;

        var bIsAllSuccess = true; // 카트 담기 모두 성공
        var bIsAnyoneSuccess = false; // 카트담기 일부 성공
        var bIsAnyoneModified = false; // 카트담기 일부 수량이 조절되어 담김
        for(var i= 0, max=aDeals.length; i<max; i++){
            var htDeal = aDeals[i];
            if(htDeal.success == false){
                bIsAllSuccess = false;
            }
            if(htDeal.success == true){
                bIsAnyoneSuccess = true;
            }
            if(htDeal.modified == true){
                bIsAnyoneModified = true
            }
        }

        if(bIsAllSuccess && !bIsAnyoneModified){ // 수량 조절 없이 카트담기 모두 성공시 : 카트담기 완료 안내
            this.welSuccessAddToCartLayer.show().delay(2000).fadeOut();
        }else if(bIsAnyoneSuccess){ // 일부 상품 제외 또는 수량 조절시(= 하나라도 성공시) : 카트담기 완료 + 일부상품 제외 안내
            this.welExcessAddToCartLayer.show().delay(2000).fadeOut();
        }else{ // 모두 실패
            alert("1인당 최대 구매수량을 초과한 상품, 매진 및 판매종료된 상품이 있습니다. 상품의 수량을 다시 확인해 주세요.");
        }

    }

};