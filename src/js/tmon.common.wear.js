/**
 * 벨류 페션 모든 페이지에서 사용하는 유틸리티성 메써드 모음
 */

TMON.commonWear = {
    sGNCartCookieName : 'TMON_CART_GN', // 일반 상품 쿠키 이름
    sT3CartCookieName : 'TMON_CART_T3', // 티켓 상품 쿠키 이름

    /**
     * layer가 열렸을 때 Scroll 처리, layer=open 해시쿼리 추가
     */
    layerOpen : function (){
        var htHash = TMON.wear.oHashbang.getState();
        if(htHash.layer != 'open') {
            TMON.wear.oHashbang.setState("", {"layer": "open"});
        }
        var nWindowScroll = $(window).scrollTop();
        $('body').css({'position':'fixed', 'margin-top':'-'+nWindowScroll+'px' ,'left':'0','right':'0'});
    },

    /**
     * hashchange event 가 발생할 때 상태값에 따라 이벤트 발생
     */
    checkHashQuerystring : function(){
        var htHash = TMON.wear.oHashbang.getState();

        if(htHash.layer != 'open'){
            /* layer 닫기 */
            $('.ly_wrapper').hide();
            var nWindowScroll = $('body').css('margin-top') || 0;
            nWindowScroll = parseInt(nWindowScroll);
            if(nWindowScroll < 0){
                nWindowScroll = nWindowScroll * -1;
            }
            $('body').css({'position':'static', 'top':'auto' ,'left':'auto','right':'auto', 'margin-top':'0', '-webkit-backface-visibility':'hidden'}).scrollTop(nWindowScroll);
        }
    },

    getCartKeyFromCookie : function(){
        return {
            sCartKeyNormal : TMON.util.getCookie(this.sGNCartCookieName) || "",
            sCartKeyTicket3 : TMON.util.getCookie(this.sT3CartCookieName) || ""
        };
    },

    setGNCartKeyToCookie : function(sCartKey){
        TMON.util.setCookie(this.sGNCartCookieName, sCartKey, {path : '/', expires : 0});
    },

    setT3CartKeyToCookie : function(sCartKey){
        TMON.util.setCookie(this.sT3CartCookieName, sCartKey, {path : '/', expires : 0});
    },

    /**
     * 상단 및 슬라이드 메뉴의 쇼핑백 아이콘의 카운트를 업데이트한다.
     * @param nCount
     */
    updateShoppingbagCount : function(){
        var htCartKey = this.getCartKeyFromCookie();
        if (htCartKey.sCartKeyNormal == ''){
            htCartKey.sCartKeyNormal = 'null';
        }
        var d = new Date();
        var sApiUrl = TMON.wear.htAPI.getCartCount.replace('{cartKey}', htCartKey.sCartKeyNormal) + '?__stamp='+d.getHours()+d.getMinutes()+d.getSeconds();
        $.ajax({
            url: sApiUrl,
            dataType: "json",
            success: function(res){
                var nCount = res.data;
                $("#_cartLink").find(".badge").attr("data-count", "n"+nCount).html(nCount); // 상단의 쇼핑백 카운트 업데이트
                $("#_slideCartLink").find(".badge").attr("data-count", "n"+nCount).html(nCount); // 슬라이드 메뉴의 쇼핑백 카운트 업데이트

                // 앱을 경우 callApp을 통해 카트키도 같이 넘긴다.
                if(TMON.view_mode == 'app') {
                    if(nCount == ''){nCount = 0}
                    nCount = parseInt(nCount);
                    TMON.app.callApp('wear', 'updateWearCartCount', nCount, htCartKey.sCartKeyNormal, htCartKey.sCartKeyTicket3);
                }
            },
            error: function (jqXHR, textStatus) {
                if (textStatus == "abort") {
                    return;
                }
                alert("일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
                return;
            }
        });
    },

    /**
     * delivery_ui 에서는 getCartCount API 를 만들 수 없어서, header 에 있는 값을 호출하도록 한다.
     */
    updateShoppingbagCountOnDeliveryUI : function(nCount){
        var htCartKey = this.getCartKeyFromCookie();
        if (htCartKey.sCartKeyNormal == ''){
            htCartKey.sCartKeyNormal = 'null';
        }
        $("#_cartLink").find(".badge").attr("data-count", "n"+nCount).html(nCount); // 상단의 쇼핑백 카운트 업데이트
        $("#_slideCartLink").find(".badge").attr("data-count", "n"+nCount).html(nCount); // 슬라이드 메뉴의 쇼핑백 카운트 업데이트
        if(TMON.view_mode == 'app') {
            if(nCount == ''){nCount = 0}
            nCount = parseInt(nCount);
            TMON.app.callApp('wear', 'updateWearCartCount', nCount, htCartKey.sCartKeyNormal, htCartKey.sCartKeyTicket3);
        }
    },

    updateDeliveryCount : function (nCount){
        if(TMON.view_mode == 'app') {
            if(nCount == ''){nCount = 0}
            nCount = parseInt(nCount);
            TMON.app.callApp('wear', 'updateWearDeliveryCount', nCount);
        }
    },

    setTitleCallApp : function(sType, sTitlename){
        if(TMON.view_mode == 'app') {
            TMON.app.callApp('wear', 'setTitle', sType, sTitlename);
        }
    },

    /**
     * 스크롤 Up or Down일때 각각 해당 클래스를 넣고 빼고 해준다.
     * @param sClassScrollUp {String} Scroll Up일 때 추가되는 클래스
     * @param sCalssScrollDown {String} Scroll Down일 때 추가되는 클래스
     */
    setClassByScrollUpDownEvent : function(sClassScrollUp, sCalssScrollDown){
        var welWin = $(window);
        var welBody = $("body");
        var nLastTop = 0;

        $(window).bind('mousewheel', function(event) {
            var nTop = welWin.scrollTop();

            if(nTop > nLastTop){ // Scroll down
                welBody.removeClass(sClassScrollUp).addClass(sCalssScrollDown);
            }else if(nTop < nLastTop){ // Scroll Up
                welBody.removeClass(sCalssScrollDown).addClass(sClassScrollUp);
            }
            nLastTop = nTop;
        });
    }
};
