var main = function() {
    this.init();
};

main.prototype = {

    init : function(){
        this.setup();
        this.initTopBackBtn(); // 상단 네비게이션의 뒤로가기 버
        this.initBackBtn(); // 하단 네비게이션의 뒤로가기 버튼
        this.initTopBtn(); // 맨위로가기 버튼
        this.showTopDownloadLink();
        this.setEventCategoryInfoLayer();
        this.setFooterLink();

        //모바일 웹 환경인 경우
        if(TMON.bIsMobileWeb){
            this.initLazyLoad();
        }

        this.showRunAppLayer();
        this.fixPositioningKeyboardInIOS();
    },

    /**
     * 기존 모바일에 있던 소스코드인데 정확히 무슨 일을 하는 코드인지 확실치 않음, 모바일 APP과 관련된 코드 일것 같음.
     */
    setup : function(){
        if (window.alert_orig == null) {
            window.alert_orig = window.alert;

            if (TMON.app_os == 'ios'){
                window.alert = function() {
                    var msg = arguments[0] || '';
                    document.location.href = 'alert:' + encodeURIComponent(msg);
                }
            }
        }

        var CommonWebInterface = function(){};

        CommonWebInterface.prototype = {
            status : "ing",

            checkStatus : function(){
                return this.status;
            },

            setStatus : function(){
                this.status = status;
            }
        };

        TMON.app.registerWebInterface('common', new CommonWebInterface());

        window.checkStatus = function(){
            return TMON.app.callWeb('common', 'checkStatus');
        };

        window.setStatus = function(){
            TMON.app.callWeb('common', 'setStatus');
        };
    },

    setTitle : function(title) {
        document.title = title + ' - 티몬 모바일';
        if(TMON.view_mode == 'web'){
            $('#web_header_title').text(title);
        }
    },

    getURLParam : function(sname) {
        var params = location.search.substr(location.search.indexOf("?")+1);
        var sval = "";
        params = params.split("&");
        for (var i=0; i<params.length; i++) {
            temp = params[i].split("=");
            if ([temp[0]] == sname) {
                sval = temp[1];
                break;
            }
        }
        return sval;
    },

    matchURL : function(pattern) {
        var path = location.pathname;
        var re = new RegExp(pattern);
        return re.test(path);
    },

    gaPageView : function() {
        if (TMON.view_mode != 'app'){
            return;
        }

        TMON.app.callApp("ga", "setPageViewTracking", location.pathname);
    },

    gaEcommerce : function (transaction, items) {
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            TMON.app.callApp('ga', 'setEcommerceTrackingByItem', item.id.toString(), item.name, item.sku, item.category, parseInt(item.price), parseInt(item.quantity), item.currency);
        }

        TMON.app.callApp('ga', 'setEcommerceTracking', transaction.id.toString(), transaction.affiliation, parseInt(transaction.revenue), parseInt(transaction.tax), parseInt(transaction.shipping), transaction.currency);
    },

    gaSendEvent : function(eventMap) {
        TMON.app.callApp("ga", "setEventTracking", eventMap.eventCategory, eventMap.eventAction, eventMap.eventLabel, parseInt(eventMap.eventValue));
    },

    gaEventTracking : function(category, action, label, value, fieldMap) {
        if (TMON.view_mode != 'app')
            return;

        category = TMON.app_os.toUpperCase() + "_" + category;

        label = label || '';
        value = value || 0;
        fieldMap = fieldMap || null;

        if (category && action) {
            if (fieldMap)
                TMON.app.callApp("ga", "setEventTracking", category, action, label, parseInt(value), fieldMap);
            else
                TMON.app.callApp("ga", "setEventTracking", category, action, label, parseInt(value));
        }
    },

    hasoffersEcommerce : function(transaction, items) {
        transaction.currencyCode = transaction.currency;
        delete transaction.currency;

        for (var i = 0; i < items.length; i++){
            items[i].currencyCode = items[i].currency;
            delete items[i].currency;
        }

        transaction.items = items;

        var jsonStr = JSON.stringify(transaction);

        TMON.app.callApp("tmon_hasoffers", "setPurchaseTracking", jsonStr);
    },

    hasoffersRegister : function(userNo, age, gender) {
        if (userNo) {
            if (gender == "M")
                gender = "0";
            else if (gender == "F")
                gender = "1";

            TMON.app.callApp("tmon_hasoffers", "setRegisterTraking", userNo, null, null, age, gender);
        }
    },

    /**
     * 뒤로가기 버튼
     */
    initBackBtn : function(){
        $("#_naviBackBtn").click(function(){
            history.back();
            return false;
        });
    },

    initTopBtn : function(){
        var welNaviTop = $("#_naviToTop");
        welNaviTop.click(function() {
            $('html, body').scrollTop(0);
        });

        var onScrollTop = function(){
            if($(window).scrollTop() > $(window).height()/2){
                welNaviTop.fadeIn(500);
            }else{
                welNaviTop.fadeOut(500);
            }
        };

        $(window).bind('scroll', onScrollTop);
        onScrollTop();
    },

    /**
     * 최상단 앱 다운로드 링크
     */
    showTopDownloadLink : function(){
        $('.app_dwld_cls').click(function() {
            TMON.util.setCookie('_show_app_download_topline', 'no', {path : '/', expires : 0});
            $('.app_dwld').hide("slow");
            return false;
        });
        $('.app_dwld_bn').click($.proxy(function(){
            TMON.app.runAppOrInstall('tmon://main?launch_path=', 'tmonapp://launch?launch_path=', '');
            return false;
        }, this));
    },

    /**
     * 푸터에 있는 "티몬 상품을 카테고리별로 빠르게 확인할 수 있어요" 레이어 컨트롤
     */
    setEventCategoryInfoLayer : function(){
        $('#_btnCloseCateInfoLayer').click($.proxy(function(){
            TMON.util.setCookie('_show_cat_info_layer', 'no', {path : '/', expires : 7});
            $('#_cateInfoLayer').hide('slow');
        }, this));
    },

    /**
     * 푸터 영역 링크 이벤트
     */
    setFooterLink : function(){
        // 이용약관
        $("#_showTermOfSerivce").click($.proxy(function(){
            if(TMON.view_mode != 'web') {
                TMON.app.callApp('policy', 'termsOfService', '이용 약관');
                return false;
            }
        }, this));

        // 사업자 정보
        $("#_showCompanyInfo").click($.proxy(function(){
            if(TMON.view_mode != 'web') {
                TMON.app.callApp('policy', 'companyInfo', '사업자 정보');
                return false;
            }
        }, this));


        // 개인정보 취급방식
        $("#_showPrivacy").click($.proxy(function(){
            if(TMON.view_mode != 'web') {
                TMON.app.callApp('policy', 'privacy', '개인정보 취급방침');
                return false;
            }
        }, this));

        // 청소년 보호정책
        $("#_showYouthPolicy").click($.proxy(function(){
            if(TMON.view_mode != 'web') {
                TMON.app.callApp('policy', 'youthpolicy', '청소년 보호정책');
                return false;
            }
        }, this));
    },

    /**
     * 이미지 레이지 로딩
     */
    initLazyLoad : function(){
        $('img.lazy').lazyload({
            threshold: 6000
        });
    },

    /**
     * app launch/download layer
     * 앱 구동/설치 layer를 표시해야 하는 경우 처리
     * 일부 마케팅 특정 채널에서는 사용하지 않음(/entry/index.php에서 쿠키처리)
     */
    showRunAppLayer : function(){
        var welLayer = $("#_launchLayer");
        var sCookieName = welLayer.attr("data-cookiename");

        if(welLayer.length == 0){
            return;
        }

        if($.cookie(sCookieName) != null) {
            return ;
        }

        var currentUrl = window.location.href.toLowerCase();
        var aDealDetail = currentUrl.match("/deal/detaildaily/([0-9]+)");

        var sPlatform = TMON.bIsAndroid ? "android" :
                        TMON.bIsIos ? "ios" :
                        "";
        var gaLabel = welLayer.attr("data-jp") + "_" + welLayer.attr("data-layertitle");
        var sEventCategory = 'app_Launch_Layer_' + sPlatform;

        ga('send', 'event', sEventCategory, 'show', gaLabel);

        $("#_btnRunApp").click(function(){
            var sIosLaunchUrl = welLayer.attr("data-ioslaunchurl");
            var sAndroidLaunchUrl = welLayer.attr("data-adlaunchurl");

            ga('send', 'event', sEventCategory, 'run', gaLabel);
            welLayer.hide();

            if(aDealDetail) {
                TMON.launchApp.goDeal(welLayer.attr("data-jp"), welLayer.attr("data-ln"), aDealDetail[1]);
            } else {
                window.location.href = TMON.bIsIos ? sIosLaunchUrl :
                    TMON.bIsAndroid ? sAndroidLaunchUrl :
                        "";
            }
            return false;
        });

        $("#_btnDownLater").click(function(){
            var nViewLimitDays = parseInt(welLayer.attr("data-viewlimitdays"), 10);

            ga('send', 'event', sEventCategory, 'close', gaLabel);
            $.cookie(sCookieName, 'blocked',{expires : nViewLimitDays, path:'/'});
            welLayer.hide();
            return false;
        });
    },

    initTopBackBtn : function(){
        $("#_btnBackBtn").click($.proxy(function(){
            if(TMON.sListUrl){
                location.href = TMON.sListUrl;
            }else{
                history.back();
            }
        }, this));
    },

    /**
     * IOS 7 이하에서 fixed된 엘리먼트가 Virtual 키보드가 열려있을 경우 틀어지는 문제 수정
     */
    fixPositioningKeyboardInIOS : function(){
        var aIOSInfo = TMON.util.getIOSVersion();
        if(!aIOSInfo){
            return false;
        }

        // IOS version이 7 이하 일경우만 실행
        if(aIOSInfo[0] >= 8){
            return false;
        }

        var welBody = $("body");
        $('input, textarea').on('focus',function(){
            welBody.addClass('fixfixed');
        });
        $('input, textarea').on('blur',function(){
            welBody.removeClass('fixfixed');
        });
    }


};


$(function(){
    $.ajaxSetup({
        cache: false,
        timeout : 60000 // 타임아웃 1분
    });
    TMON.oMain = new main();
});