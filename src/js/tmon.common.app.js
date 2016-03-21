/**
 * App 과 관련된 함수를 모아 두었다.
 */

TMON.app = {
    interfaceMap : {},

    /**
     * 웹에서 앱을 호출 할 때 사용
     * 예를 들어,
     * callApp(‘webview’, ‘uploadImage’, 'Test From Browser’) 는
     * window 객체를 사용 시 window.tmon_ad_webview.uploadImage("Test From Browser”); 과 같은 것 같습니다.
     * @param type
     * @param func
     * @param arg1
     * @param arg2
     * @param more
     */
    callApp : function(type, func, arg1, arg2, more) {
        if(TMON.view_mode != 'app'){
            return;
        }

        if(!type){
            return;
        }

        /**
         * 작업자 : 표준화플랫폼 장재원, 주문WG 최유환
         * m.js의 this.app_os == 'ios'부분 앱 쪽에서 app_os 파라미터 넣어주지 않아서 TMON.bIsIos로 대체 처리
         * 앱쪽에서 파라미터 처리작업 완료시 m.js의 callApp메소드 해당 라인 확인하여 common.app.js 수정
         * m.js의 TmonMobile 모듈 초기화시 view_mode/app_os 받아와서 사용함
         */

        if( TMON.bIsIos ) {
            var url = 'tmon-ios://' + type + '/' + func;
            if(arguments.length > 2){
                var sep = '?';
                for (var i = 2; i < arguments.length; i++) {
                    url += sep + (i - 2) + '=' + encodeURIComponent(arguments[i]);
                    sep = '&';
                }
            }

            var iframe = document.createElement('IFRAME');
            iframe.setAttribute('src', url);
            document.documentElement.appendChild(iframe);
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        }else if(TMON.app_os == 'ad'){
            var interface_name = "";
            if(type == "tmon_hasoffers"){
                interface_name = type;
            }else{
                interface_name = 'tmon_ad_' + type;
            }

            if (window[interface_name] == null){
                return;
            }

            if (window[interface_name][func] == null){
                return;
            }

            var args = Array.prototype.slice.call(arguments, 2);
            window[interface_name][func].apply(window[interface_name], args);
        }
    },

    /**
     * 앱에서 웹을 호출할 때 사용
     * @param type
     * @param func
     * @param arg1
     * @param arg2
     * @param more
     * @returns {*}
     */
    callWeb : function(type, func, arg1, arg2, more) {
        if(TMON.view_mode != 'app'){
            return;
        }

        if(this.interfaceMap[type] == null){
            return;
        }

        if(this.interfaceMap[type][func] == null){
            return;
        }

        var args = Array.prototype.slice.call(arguments, 2);
        return this.interfaceMap[type][func].apply(this.interfaceMap[type], args);
    },

    registerWebInterface : function(type, interface_obj) {
        this.interfaceMap[type] = interface_obj;
    },

    runAppOrInstall : function(ad_url_scheme, ios_url_scheme, ad_referrer) {
        var start = new Date();
        var mat_ad_url = $.cookie('_mat_ad_url');
        var mat_ios_url = $.cookie('_mat_ios_url');

        setTimeout(function() { //설치된 앱으로 이동하지 못한 경우 처리
            //app 실행후 다시 브라우저로 왔을때 setTimeout이 실행되는 경우가 있으므로
            //2초 이내에 setTimeout 이 실행된 경우에만 앱 설치페이지로 이동함
            var re_start = new Date();
            var datediff = re_start.getTime() - start.getTime();
            if (datediff > 2000) {
                return;
            }

            if (TMON.bIsAndroid){
                //do nothing
            }else if(TMON.bIsIos){
                //app store 이동
                window.location.href = 'https://itunes.apple.com/kr/app/timon-tmon/id463434588?mt=8&uo=4';
            }else{
                //모바일 웹으로 이동
                //window.location.href = '/', 마트페이지의 경우 루트가 없으므로 루트 경로로 이동하지 않게 한다.
                return false;
            }
        }, 1000);

        if(TMON.bIsAndroid){
            if (mat_ad_url) {
                window.location.href = mat_ad_url;
            }else{
                if (ad_referrer) {
                    ad_url_scheme += "&" + ad_referrer;
                }
                window.location.href = "market://details?id=com.tmon&url=tmon://" + encodeURIComponent(ad_url_scheme.replace("tmon://", "")) + (ad_referrer ? "&referrer=" + encodeURIComponent(ad_referrer) : "");
            }
        }else if(TMON.bIsIos) {
            if (mat_ios_url){
                window.location.href = mat_ios_url;
            }else{
                window.location.href = ios_url_scheme;
            }
        }else{
            //모바일 웹으로 이동
            //window.location.href = '/', 마트페이지의 경우 루트가 없으므로 루트 경로로 이동하지 않게 한다.
            return false;
        }
    }
};
