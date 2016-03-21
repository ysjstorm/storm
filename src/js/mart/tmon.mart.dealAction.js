/**
 * 딜의 버튼 이벤트 (카트담기, 다른구성 더보기 등) 처리 함수, 안내 레이어 표시
 */

var martDealAction = function(){
    this.init();
};

martDealAction.prototype = {
    bIsAddingToCart : false,
    sCurrentCartKey : "",
    bIsShownOptionDealLayer : false,
    bIsShownOptionDetailPage : false,
    bIsLoadingOptionDeals : false,
    bIsShownAddCartHelpLayer : false,
    ERRORCODE_UNKNOWN : 200, // 알수없는 에러
    ERRORCODE_EXCESS_MAX_BUY : 401, // 최대구매수량 초과
    ERRORCODE_BUY_END : 402, // 매진/비활성화/판매기간 종료 된 딜
    LAYER_DISPLAY_TIMEOUT : 2000,
    aAddToCartQueue : [],

    init : function(){
        this.cacheElement();
        this.setEvent();
        this.showHelpLayer();
        this.loadCartKey();
    },

    cacheElement : function(){
        this.welContainer = $(".deal-list");
        this.welSuccessAddToCartLayer = $("#_layerSuccessAddToCart").clone(); // 선택한 상품이 카트에 담겼습니다. 20,000원 더 담으면 무료배송! 레이어
        this.welCartCounter = $(".cnt:first");
        this.welWin = $(window);

        this.welSelectLayer = $("#_selectCount");
        this.welSelectOptions = this.welSelectLayer.find("li");
        this.welBody = $("body");
    },

    setEvent : function(){
        this.welContainer.on("click", ".button_cart", $.proxy(this.onClickAddToCart, this)); // 개별딜의 카트담기
        this.welContainer.on("click", ".button_option", $.proxy(this.onClickLoadOption, this)); // 개별딜의 다른 구성 더보기

        $("#ct").on("click", ".select-number", $.proxy(this.showSelectCountLayer, this));
        this.welSelectLayer.on("click", "input", $.proxy(this.onSelectCountItem, this));
        this.welSelectLayer.on("click", ".close", $.proxy(this.closeSelectLayer, this));
    },

    /**
     * 개별딜의 카트 담기 클릭 핸들러
     */
    onClickAddToCart : function(e){
        // 이미 다른 카트 담기가 진행중이면 Queue에 저장해서 순차적으로 진행한다.
        if(this.bIsAddingToCart){
            this.addQueue(e.target);
            return;
        }

        this.bIsAddingToCart = true;
        this.addToCart(e.target);
    },

    /**
     * 카트 담기
     * @param elTarget 카트 담기 버튼 엘리먼트
     */
    addToCart : function(elTarget){
        this.welCurrentAddCart = $(elTarget).closest("li");
        var htDealNo = this.getDealNoFromElement(this.welCurrentAddCart);

        // 딜 카트 담기시 툴팁은 사라지고 카트담기 레이어 출력
        if(this.welOptionDealLayer && this.welCurrentAddCart.find("#_layerHintOptionDeal").length >= 0){
            // 카트담기 레이어와 툴팁이 겹치는 구간발생, 해당 액션에서만 파라미터로 툴팁을 빨리 숨기도록 처리리
            this.hideHelpOptionDeal(100);
        }

        $.ajax({
            url : TMON.htAPI.htMart.addToCart,
            data :{
                deal_id : htDealNo.sMainDealNo, // 구매 대상 딜 main_deal_srl
                option_ids : htDealNo.sOptionDealNo, // 옵션 deal_srl
                counts : parseInt(this.welCurrentAddCart.find(".select-number").html(), 10),
                cart_key : this.sCurrentCartKey
            },
            dataType : "jsonp",
            success : $.proxy(this.cbAddToCart, this),
            error : function(jqXHR, textStatus){
                if(textStatus == "abort"){
                    return;
                }
                alert("잠시 후 다시 시도해주세요.");
                return;
            }
        });

    },

    cbAddToCart : function(res){
        if(res.success == false){
            // 최대구매 수량 초과시에 수량 선택을 1로 초기화
            if(res.error_code == this.ERRORCODE_EXCESS_MAX_BUY){
                this.welCurrentAddCart.find(".select-number").html("1");
            }
            alert(res.error_msg);
            this.fetchQueue(); // Queue에 담긴 카트담기 수행
            return;
        }

        if(TMON.bLogin == false && res.cart_key){
            this.sCurrentCartKey = res.cart_key;
            // 카트 담시기에 Server side에서 쿠키값을 굽도록 변경하여 front-end에서 쿠키 굽는 코드를 제거한다.
            //this.writeCartKeyToCookie(res.cart_key);
        }

        // 카트담기 완료 레이어 위치를 1.옵션딜의 경우 li의 마지막에, 2.일반딜의 경우 앞에 넣어준다.
        if(this.welCurrentAddCart.attr("data-role") == "optionDeal"){
            this.welSuccessAddToCartLayer.appendTo(this.welCurrentAddCart);
        }else{
            this.welSuccessAddToCartLayer.prependTo(this.welCurrentAddCart.find("a:first"));
        }
        this.showSuccessAddToCartLayer();

        // 카트에 담긴 개수 표시
        this.welCartCounter.html(res.count).show();
        this.fetchQueue(); // Queue에 담긴 카트담기 수행
    },

    /**
     * 카트담기 레이어의 경우 하나의 엘리먼트로 사용하기 때문에 fadeout 에니메이션, 타이머 동작 중에
     * 다른 딜의 카트담기를 눌렀을 경우 reset해주는 처리까지 한다.
     */
    showSuccessAddToCartLayer : function(){
        if(this.nTimerSuccessAddToCart){ // 기존 타이머 제거
            clearTimeout(this.nTimerSuccessAddToCart);
            this.nTimerSuccessAddToCart = 0;
        }

        this.welSuccessAddToCartLayer.stop().animate({opacity:"100"}).show(); // 기존의 fadeout 에니메이션 cancelling 처리
        this.nTimerSuccessAddToCart = setTimeout($.proxy(function(){
            this.welSuccessAddToCartLayer.fadeOut();
        }, this), this.LAYER_DISPLAY_TIMEOUT);
    },


    /**
     * 개별딜의 다른구성 버튼 클릭시
     */
    onClickLoadOption : function(e){
        if(this.bIsLoadingOptionDeals){
            return false;
        }

        var wel = $(e.currentTarget);
        this.welCurrerntLoadOption = wel.closest("li");

        // 이미 열려 있을 경우 닫아 주고 리턴한다.
        if(wel.hasClass("open")){
            wel.removeClass("open");
            this.welCurrerntLoadOption.find(".option-list").hide();
            return false;
        }

        wel.addClass("loading open"); // 로딩 이미지 추가
        var htDealNo = this.getDealNoFromElement(this.welCurrerntLoadOption);
        this.bIsLoadingOptionDeals = true;
        var welCurrentAnker = this.welCurrerntLoadOption.find(".option-list");
        $.ajax({
            url : TMON.htAPI.htMart.getOptionDeals + "/" + htDealNo.sMainDealNo,
            data :{
                dealNo : htDealNo.sOptionDealNo,
                tlArea : welCurrentAnker.attr("data-tlarea"),
                tlCartArea : welCurrentAnker.attr("data-tlcartarea"),
                tlStartOrder : welCurrentAnker.attr("data-tlstartord")
            },
            success : $.proxy(this.cbLoadOption, this),
            error : function(jqXHR, textStatus){
                if(textStatus == "abort"){
                    return;
                }
                alert("잠시 후 다시 시도해주세요.");
                return;
            }
        });

        this.bIsShownOptionDealLayer && this.hideHelpOptionDeal();
    },

    cbLoadOption : function(res){
        this.bIsLoadingOptionDeals = false;
        this.welCurrerntLoadOption.find(".option-list").html(res.data).show();
        this.welCurrerntLoadOption.find(".button_option").removeClass("loading"); // 로딩 클래스 제거
    },

    getDealNoFromElement : function(wel){
        return {
            sMainDealNo : wel.attr("data-maindealno"),
            sOptionDealNo : wel.attr("data-dealno")
        }
    },

    /**
     * 로긴되지 않았을 경우 기존 사용하던 카트키를 가져온다.
     */
    loadCartKey : function(){
        this.sCurrentCartKey = TMON.bLogin ? "" : TMON.sCartKey;
    },

    /**
     * 안내 레이어 보이기
     */
    showHelpLayer : function(){
        if(TMON.util.getCookie("MART_SHOW_CARTHELP_LAYER") == "no"){
            this.showCartHelpLayer = function(){};
        }else{
            this.showCartHelpLayer();
        }

        if(TMON.util.getCookie("MART_SHOW_OPTIONDEAL_LAYER") == "no"){
            this.showHelpOptionDeal = function(){};
        }else{
            this.showHelpOptionDeal();
        }

        if(TMON.util.getCookie("MART_SHOW_DETAILPAGE_LAYER") == "no"){
            this.showHelpDetailPage = function(){};
        }else{
            this.showHelpDetailPage();
        }
    },

    /**
     * "클릭! 이 상품의 다른 구성을 바로 볼 수 있어요." 레이어
     * 레이어가 화면상에 표시됬을 경우, 해당레이어를 터치(클릭)했을 경우 숨긴다.
     * 원래는 "다른 구성"페이지로 이동했을 경우도 숨겨야 하지만 화면상에 표시됬을 경우와 중복되기 떄문에 조건에 넣지 않았다.
     */
    showHelpOptionDeal : function(){
        if(this.bIsShownOptionDealLayer){
            return;
        }

        /**
         * 솔드아웃 딜에서 툴팁 노출하지 않고 솔드아웃 이후 첫번째 딜에서 툴팁노출
         */
        var welTargetBtn = this.welContainer.find("li:not(.soldout, ._detailPageHelpLayer, ._cartHelpLayer) .button_option").first();

        if(welTargetBtn.length == 0){
            return;
        }

        // 레이어 위치가 옴겨진후 다른 카테고리 딜리스트가 불릴경우 레이어 엘리먼트가 사라지게 되므로 clone해서 사용한다.
        this.welOptionDealLayer = $("#_layerHintOptionDeal").clone();
        this.welOptionDealLayer.insertAfter(welTargetBtn).show();
        this.bIsShownOptionDealLayer = true;
        welTargetBtn.parents("li:first").addClass("_HelpOptionDealLayer");

        var nLayerTop = this.welOptionDealLayer.offset().top;
        var nLayerHeight = this.welOptionDealLayer.height();

        var wfnOnScroll = $.proxy(function(){
            // 화면상에 충분히 보여질 위치까지 스크롤 되었을 때, 사용자가 한번 봤다고 판단하여 다음에는 보여지지 않게 쿠키를 굽는다.
            if(this.welWin.scrollTop() + this.welWin.height() > nLayerTop + (nLayerHeight * 4)){
                this.writeCookieForOptionDealLayer();
                this.welWin.unbind("scroll", wfnOnScroll);
            }
        }, this);

        this.welWin.bind("scroll", wfnOnScroll);
        this.welOptionDealLayer.click($.proxy(function(){
            this.hideHelpOptionDeal();
            this.welWin.unbind("scroll", wfnOnScroll);
        }, this));
        wfnOnScroll();
    },

    /**
     * "다른 구성을 바로 볼수 있어요." 레이어를 숨긴다.
     */
    hideHelpOptionDeal : function(nFadeSpeed){
        var nFadeSpeed = nFadeSpeed || "fast";
        this.welOptionDealLayer.fadeOut(nFadeSpeed);
        this.writeCookieForOptionDealLayer();
        return false;
    },

    /**
     * 다음부터 "다른 구성을 바로 볼수 있어요." 레이어를 보여지기 않기 위헤 쿠키에 저장한다.
     */
    writeCookieForOptionDealLayer : function(){
        TMON.util.setCookie('MART_SHOW_OPTIONDEAL_LAYER', "no", {path : '/', expires : 0});
    },

    /**
     * "클릭! 다양한 옵션 확인을 위해 상세화면으로 이동해요." 레이어
     * 레이어가 화면상에 표시됬을 경우, 해당레이어를 터치(클릭)했을 경우 숨긴다.
     * 원래는 "다른 구성" 버튼을 클랙 했을 경우도 숨겨야 하지만 화면상에 표시됬을 경우와 중복되기 떄문에 조건에 넣지 않았다.
     */
    showHelpDetailPage : function(){
        if(this.bIsShownOptionDetailPage){
            return;
        }

        /**
         * 솔드아웃 딜에서 툴팁 노출하지 않고 솔드아웃 이후 첫번째 딜에서 툴팁노출
         */
        var welTargetBtn = this.welContainer.find("li:not(.soldout, ._HelpOptionDealLayer, ._cartHelpLayer) .notify-deal-detail").first().find(".notify");

        if(welTargetBtn.length == 0){
            return;
        }

        // 레이어 위치가 옴겨진후 다른 카테고리 딜리스트가 불릴경우 레이어 엘리먼트가 사라지게 되므로 clone해서 사용한다.
        this.welOptionDetailPage = $("#_layerHintDetailPage").clone();
        this.welOptionDetailPage.insertAfter(welTargetBtn).show();
        this.bIsShownOptionDetailPage = true;
        welTargetBtn.parents("li:first").addClass("_detailPageHelpLayer");

        var nLayerTop = this.welOptionDetailPage.offset().top;
        var nLayerHeight = this.welOptionDetailPage.height();

        var wfnOnScroll = $.proxy(function(){
            // 화면상에 충분히 보여질 위치까지 스크롤 되었을 때, 사용자가 한번 봤다고 판단하여 다음에는 보여지지 않게 쿠키를 굽는다.
            if(this.welWin.scrollTop() + this.welWin.height() > nLayerTop + (nLayerHeight * 4)){
                this.writeCookieForDetailPageLayer();
                this.welWin.unbind("scroll", wfnOnScroll);
            }
        }, this);

        this.welWin.bind("scroll", wfnOnScroll);
        this.welOptionDetailPage.click($.proxy(function(){
            this.hideHelpDetailPage();
            this.welWin.unbind("scroll", wfnOnScroll);
        }, this));
        wfnOnScroll();
    },

    /**
     * "상세 화면으로 이동해요." 레이어를 숨긴다.
     */
    hideHelpDetailPage : function(){
        this.welOptionDetailPage.fadeOut("fast");
        this.writeCookieForDetailPageLayer();
        return false;
    },

    /**
     * 다음부터 "상세 화면으로 이동해요." 레이어를 보여지기 않기 위헤 쿠키에 저장한다.
     */
    writeCookieForDetailPageLayer : function(){
        TMON.util.setCookie('MART_SHOW_DETAILPAGE_LAYER', "no", {path : '/', expires : 0});
    },

    /**
     * "카트에 바로 담아 보세요." 레이어
     * 레이어가 화면상에 표시됬을 경우, 해당레이어를 터치(클릭)했을 경우 숨긴다.
     */
    showCartHelpLayer : function(){
        if(this.bIsShownAddCartHelpLayer){
            return;
        }

        /**
         * 솔드아웃 딜에서 툴팁 노출하지 않고 솔드아웃 이후 첫번째 딜에서 툴팁노출
         */
        var welTargetBtn = this.welContainer.find("li:not(.soldout, ._HelpOptionDealLayer, ._detailPageHelpLayer)").first().find(".button_cart");

        if(welTargetBtn.length == 0){
            return;
        }

        // 레이어 위치가 옴겨진후 다른 카테고리 딜리스트가 불릴경우 레이어 엘리먼트가 사라지게 되므로 clone해서 사용한다.
        this.welCartHelpLayer = $("#_layerHintCart").clone();
        this.welCartHelpLayer.insertAfter(welTargetBtn).show();
        this.bIsShownAddCartHelpLayer = true;
        welTargetBtn.parents("li:first").addClass("_cartHelpLayer");

        var nLayerTop = this.welCartHelpLayer.offset().top;
        var nLayerHeight = this.welCartHelpLayer.height();

        var wfnOnScroll = $.proxy(function(){
            // 화면상에 충분히 보여질 위치까지 스크롤 되었을 때, 사용자가 한번 봤다고 판단하여 다음에는 보여지지 않게 쿠키를 굽는다.
            if(this.welWin.scrollTop() + this.welWin.height() > nLayerTop + (nLayerHeight * 4)){
                this.writeCookieForCartHelpLayer();
                this.welWin.unbind("scroll", wfnOnScroll);
            }
        }, this);

        this.welWin.bind("scroll", wfnOnScroll);
        this.welCartHelpLayer.click($.proxy(function(){
            this.hideCartHelpLayer();
            this.welWin.unbind("scroll", wfnOnScroll);
        }, this));
        wfnOnScroll();
    },

    /**
     * "카트에 바로 담아 보세요." 레이어를 숨긴다.
     */
    hideCartHelpLayer : function(){
        this.welCartHelpLayer.fadeOut("fast");
        this.writeCookieForCartHelpLayer();
        return false;
    },

    /**
     * 다음부터 "카트에 바로 담아 보세요." 레이어를 보여지기 않기 위헤 쿠키에 저장한다.
     */
    writeCookieForCartHelpLayer : function(){
        TMON.util.setCookie('MART_SHOW_CARTHELP_LAYER', "no", {path : '/', expires : 0});
    },

    /**
     * 수량선택 레이어 보이기
     * @param e
     */
    showSelectCountLayer : function(e){
        this.welSelectValue = $(e.target);
        var nCount = parseInt(this.welSelectValue.attr("data-buylimit")); // 해당 딜의 최대 구매 수량

        this.welSelectOptions.hide().slice(0, nCount).show(); // 딜의 최대 구매 수량 만큼만 옵션을 보여준다.
        this.welSelectLayer.removeClass("hide");

        // 화면 중앙으로 위치를 잡아준다.
        var nPositionTop = this.welWin.scrollTop() + ( this.welWin.height() / 2 - this.welSelectLayer.height() / 2 );
        this.welSelectLayer.css("top", nPositionTop);
        this.scrollSelectedElementToCenter(parseInt(this.welSelectValue.html(), 10));
        this.welBody.addClass("scroll_disable");
    },

    /**
     * 수량 선택 레이어 닫기
     */
    closeSelectLayer : function(){
        this.welSelectLayer.addClass("hide");
        this.welBody.removeClass("scroll_disable");
        this.welSelectLayer.find("input").prop("checked", false);

    },

    /**
     * 이전에 선택한 구매횟수를 화면 중간으로 오게 스크롤 한다.
     */
    scrollSelectedElementToCenter : function(nSelectedCount){
        var welScroll = this.welSelectLayer.find("section");
        var welTarget = welScroll.find("li").eq(nSelectedCount-1);
        welScroll.scrollTop(0);
        var nScroll = welTarget.position().top - (welScroll.height() / 2) + (welTarget.height() / 2);
        welScroll.scrollTop(nScroll);
        welTarget.find("input").prop("checked", true);
    },

    /**
     * 아이템을 선택했을 때
     */
    onSelectCountItem : function(e){
        var welSelectedInput = $(e.target);
        var nVal = welSelectedInput.val();
        this.welSelectValue.html(nVal);
        this.closeSelectLayer();
    },

    /**
     * 카트담기 AJAX call의 Queue에 추가한다.
     */
    addQueue : function(elTarget){
        this.aAddToCartQueue.push(elTarget);
    },

    /**
     * 카트담기 action queue에 담겨 있는 이벤트를 차례대로 수행한다.
     */
    fetchQueue : function(){
        if(this.aAddToCartQueue.length == 0){
            this.bIsAddingToCart = false;
            return;
        }

        this.addToCart(this.aAddToCartQueue.shift());
    }


};