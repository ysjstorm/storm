var claimUtil = function(){};

claimUtil.prototype = {
    /**
     * 예외 페이지에서 레이어 노출
     * @param sMessage 레이어에 노출할 메세지
     */
    openExceptionLayer : function(sMessage){
        $.template("exception_layer", '<div id="exception_layer"><div class="dimmed2"></div><div class="cl_layer"><div class="layer_out"><div class="layer_inr"><div class="cont3"><span class="ico_layer_check"></span><p class="tit">\${message}</p><br></div><div class="btns"><button type="button" class="bt_blu">확인</button></div><br><button type="button" class="bt_cls"><span class="blind">닫기</span></button></div></div></div></div>');

        var welExceptionLayer = $.tmpl("exception_layer", { "message" : sMessage }).appendTo("#ct");
        var welBtnExceptionLayerClose = welExceptionLayer.find(".bt_cls");
        var welBtnExceptionLayerConfirm = welExceptionLayer.find(".bt_blu");

        welBtnExceptionLayerClose.on("click", function(){
            welExceptionLayer.remove();
        });

        welBtnExceptionLayerConfirm.on("click", function(){
            welExceptionLayer.remove();
        });
    },

    /**
     * 구매취소,취소요청,환불요청,교환요청 완료 레이어
     * @param sActionUrl 요청 처리 URL
     * @param sRedirectUrl 처리완료 후 이동 URL
     */
    openCancelDoneLayer : function(sActionUrl, sRedirectUrl){
        if (sActionUrl != '') {
            $.ajax({
                type: "GET",
                url: sActionUrl,
                dataType: "json",
                success: function(r) {
                    if (r && r.data.result == true) {
                        $.template('cancel_done_layer', '<div id="cancel_done_layer" style="position:fixed;z-index:1000;width:100%;height:100%;top:50%;visibility:hidden"><div class="dimmed2"></div><div id="cancel_done_layer_main"></div></div>');
                        var doneLayer = $.tmpl("cancel_done_layer").appendTo("#ct");
                        var doneAction = function() {
                            // 앱에서는 웹뷰가 새로 떠서 클레임이 보여지므로 웹뷰를 닫아준다.
                            if (TMON.view_mode == 'app') {
                                TMON.claim.util.refreshList();
                                TMON.app.callApp('webview', 'closeWebView', true);
                            } else {
                                document.location.href = sRedirectUrl;
                            }
                        };
                        var doneCallback = function() {
                            var innerHeight = (doneLayer.find('.cl_layer').height() + $('.hdr').height()) >> 1;
                            doneLayer.css({'margin-top':(-innerHeight)+'px','visibility':'visible'});
                            $("#cancel_dismissed_close").on("click", doneAction);
                            $("#cancel_dismissed").on("click", doneAction);
                        };
                        doneLayer.find('#cancel_done_layer_main').load('/m/mytmon/receiveClaimDone/' + r.data.message, doneCallback);
                    } else {
                        alert(r.data.message);
                    }
                },
                error: function(xhr, status, error) {
                    alert('진행 중 오류가 발생했습니다. 다시 한 번 시도해주세요.');
                }
            });
        }
    },

    /**
     * html 삽입 레이어
     * 2015.09.16 수정 - .bt_cls,.bt_blu클릭시 콜백에 false값 / .bt_org2클릭시 콜백에 true값 리턴
     *
     * @param selector selector
     * @param callback 레이어를 닫은 후의 콜백함수
     */
    openHtmlLayer : function(selector, callback){
        var $selector = $(selector);
        if ($selector.length > 0) {
            var html = $selector.html();
            $.template("html_layer", '<div id="html_layer"><div class="dimmed2"></div><div id="html_layer_main"></div></div>');
            var htmlLayer = $.tmpl("html_layer").appendTo("#ct");
            // 화면 중앙(쯤)정렬
            htmlLayer.find('#html_layer_main').html(html).find('.cl_layer').css({'position': 'fixed', 'top': '20%'});
            // 닫기/취소 버튼
            htmlLayer.find('.bt_cls, .bt_blu').on('click', function(){
                htmlLayer.remove();
                (callback || function() {})(false);
            });
            // 확인 버튼
            htmlLayer.find('.bt_org2').on('click', function(){
                htmlLayer.remove();
                (callback || function() {})(true);
            });
        }
    },

    /**
     * 앵커 웹뷰로 연결
     * @param we jQuery click 이벤트
     * @param sTitle 웹뷰 헤더
     * @param htOptions 옵션 {
     *     isDelivery : delivery로 도메인을 강제하는 경우
     *     isViewMode : true이면 view_mode를 &로 추가
     *     sViewModeType : & 또는 ?
     *     isCloseOnly : iOS에서 닫기 버튼만 있는 헤더를 쓰는 경우 true, 입력하지 않으면 false
     *     isVersion : version과 app_os 파라미터 전달
     * }
     */
    openWebView : function(we, sTitle, htOptions){
        var welAnchor = $(we.currentTarget);

        we.preventDefault();
        if (TMON.view_mode === 'app') {
            var isDelivery = htOptions.isDelivery;
            var isViewMode = htOptions.isViewMode;
            var sViewModeType = htOptions.sViewModeType;
            var isCloseOnly = !!htOptions.isCloseOnly;
            var isVersion = !!htOptions.isVersion;
            var sVersion = "&version=" + TMON.util.gup("version");
            var sAppOS = "&app_os=" + TMON.util.gup("app_os");
            // 웹뷰 처리를 위해 변경한 url
            var sViewMode = isViewMode ? sViewModeType + "view_mode=" + TMON.view_mode : "";
            var sDomain = isDelivery ? TMON.claim.htURL.delivery : "";
            var sUrl = sDomain + welAnchor.attr("href") + sViewMode + sVersion + sAppOS;

            if (TMON.bIsIos) {
                TMON.app.callApp('webview', 'showView', sTitle, sUrl, isCloseOnly);
            } else {
                TMON.app.callApp('mytmon', 'showView', sTitle, sUrl, true);
            }
        } else {
            var sDealType = (!!htOptions.sDealType ? "?dealType=" + htOptions.sDealType : '');
            document.location.href = welAnchor.attr("href") + sDealType;
        }
    },

    /**
     * 링크로 웹뷰 연결
     * @param sTitle 웹뷰 헤더
     * @param sUrl 웹뷰 url
     */
    openWebViewLink : function(sTitle, sUrl){
        if (TMON.view_mode == 'app' && TMON.bIsIos) {
            TMON.app.callApp('webview', 'showView', sTitle, sUrl, true);
        } else if (TMON.view_mode == 'app' && TMON.bIsAndroid) {
            TMON.app.callApp('mytmon', 'showView', sTitle, sUrl, true);
        } else {
            var win = window.open(sUrl);
            win.focus();
        }
    },

    /**
     * 계좌인증
     * @param obj 호출자의 this 객체
     * @param callback 콜백함수
     * @returns {boolean}
     */
    getBankAccountAuth : function(obj, callback){
        if (obj._bankKcpCode != '' && obj._bankAccName != '' && obj._bankOwnName != '') {
            $.ajax({
                type: "POST",
                url: TMON.claim.htAPI.accountCheck,
                dataType: "json",
                data: {
                    kcpCode: obj._bankKcpCode,
                    accountNumber: obj._bankAccName,
                    accountOwner: obj._bankOwnName
                },
                success: function(r){
                    if (r && r.data.ret == 'OK') {
                        (callback||function(){})(obj, true, r.data.msg);
                    } else {
                        (callback||function(){})(obj, false, r.data.msg);
                    }
                },
                error: function(xhr, status, error){
                    (callback||function(){})(obj, false, '계좌 인증에 실패했습니다. 다시 한 번 시도해주세요.');
                }
            });
        } else {
            (callback||function(){})(obj, false, '계좌 인증에 필요한 정확한 정보를 입력해주세요.');
        }
        return false;
    },

    /**
     * 택배 운송장번호 체크
     * @param corpName 택배사이름
     * @param deliveryNumber 운송장번호
     * @returns {string}
     */
    checkValidateDeliveryNumber : function(corpName, deliveryNumber){
        var returnValue = 'ERROR';
        if (corpName != '' && deliveryNumber != '') {
            var param = '?deliveryCorpName=' + encodeURIComponent(corpName) + '&deliveryNumber=' + deliveryNumber;
            $.ajax({
                type: 'GET',
                async: false,
                url: TMON.claim.htAPI.checkDeliveryInfo + param,
                dataType: 'json',
                success: function(r) {
                    if (r && r.data.ret == 'OK') {
                        returnValue = 'OK';
                    } else {
                        returnValue = 'NOK';
                    }
                },
                error: function(xhr, status, error) {
                    returnValue = 'ERROR';
                }
            });
        }
        return returnValue;
    },

    isAllowChar : function(val) {
        var reg = /["'" | "\"" | "<" | ">" | "\\"]/;
        for (var i = 0; i < val.length; i++) {
            if (val.charAt(i) != ' ' && reg.test(val.charAt(i)) == true) {
                return false;
            }
        }
        return true;
    },

    /**
     * 현재 날짜가 해당 기간내일 경우 true 리턴
     *
     * @param startDate 시작일 (ex. 20150101 등의 숫자)
     * @param endDate 종료일
     * @returns {boolean}
     */
    isTodayIn : function(startDate, endDate) {
        var curDate = new Date();
        var curDay = parseInt(
            curDate.getFullYear() +
            (curDate.getMonth() < 10 ? '0' : '') + (curDate.getMonth() + 1) +
            (curDate.getDate() < 10 ? '0' : '') + curDate.getDate()
        );
        return (curDay >= startDate && curDay <= endDate);
    },

    /**
     * localStorage를 변경하여 이벤트가 발생하게 해서 목록을 새로고침 함
     */
    refreshList : function(){
        localStorage.setItem("__claim_list_reload", "true");
    },

    /**
     * href의 파라미터를 객체로 변환
     */
    convertParam : function(we){
        var sHref = $(we.currentTarget).attr("href").split("?")[1];
        var oData = {};

        sHref.replace(/([^=&]+)=([^&]*)/g, function(match, key, value) {
            oData[decodeURIComponent(key)] = decodeURIComponent(value);
        });

        return oData;
    },

    /**
     * 천단위 표시
     */
    addCommaToNumber : function(n){
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
};
