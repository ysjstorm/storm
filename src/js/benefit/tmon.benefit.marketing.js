/**
 * Marketing.js v1.2
 *
 * 마케팅워킹그룹 공통 라이브러리
 *   - SNS연동기능: 2014.02.17
 *   - UI기능 (DimmedLayer, ScrollingAnchor 등): 2014.02.17
 *   - PLAY기능: 2014.05.08
 *
 * @author Marketing WG, mornya@tmon.co.kr
 */
var Marketing = Marketing||{
    'common': {
        /**
         * includeScript
         *
         * 주의: https://로 시작하는 URL은 Android Browser에서 스크립트 로딩이 안됨.
         */
        'includeScript': function(id, src, callback){
            if (!document.getElementById(id)) {
                var head = document.getElementsByTagName('head')[0];
                var script = document.createElement('script');
                var loaded = false;
                script.type = 'text/javascript';
                script.charset = 'utf-8';
                script.id = id;
                script.src = src;
                script.onreadystatechange = function(){
                    if (((this.readyState=='loaded') || (this.readyState=='complete')) && loaded) return;
                    loaded = true;
                    if ($.browser.msie && ($.browser.version == '7.0' || $.browser.version == '8.0')) { (callback||function(){})(true); }
                };
                script.onload = function(){ if (callback) callback(true); };
                head.appendChild(script);
            } else {
                (callback||function(){})(false);
            }
        },
        'window': function(href, name, width, height, callback){
            if (!href.match(/(_ableBrowserOpen)/)) {
                href += (href.match(/[\?]/g) ? '&':'?') + '_ableBrowserOpen=plz';
            }
            var win = window.open(href,name,'width='+width+'px,height='+height+'px,left='+((screen.width-width)>>1)+',top='+((screen.height-height)>>1));
            if (win) {
                win.focus();
            } else {
                // iOS 모바일에서는 window.open시 undefined
                document.location.href = href;
            }
            (callback||function(){})();
        }
    },
    'SNS': {
        // SNS연동시 기본적으로 설정 해줘야 할 값들
        'share': {
            'appId': TMON.benefit.htSNS.sAppId,
            'name': TMON.benefit.htSNS.sName,
            'description': TMON.benefit.htSNS.sDescription,
            'messageKT': TMON.benefit.htSNS.sMessageKT,
            'messageKS': TMON.benefit.htSNS.sMessageKS,
            'link': TMON.benefit.htSNS.sLink,
            'linkParam': TMON.benefit.htSNS.linkParam,
            'hashtags': TMON.benefit.htSNS.sHashtags,
            'image': TMON.benefit.htSNS.sImage,
            'imageFB': TMON.benefit.htSNS.sImageFB,
            'imageKT': TMON.benefit.htSNS.sImageKT,
            'imageKS': TMON.benefit.htSNS.sImageKS
        },

        /**
         * initFacebook
         *
         * 페이스북API 초기화
         */
        'initFacebook': function(callback){
            Marketing.common.includeScript('facebook-jssdk','//connect.facebook.net/ko_KR/sdk.js#xfbml=1&appId='+Marketing.SNS.share.appId+'&version=v2.2',
                function(result){
                    if (result) {
                        window.fbAsyncInit = function(){
                            FB.init({'appId':Marketing.SNS.share.appId,'cookie':true,'status':true,'xfbml':true,'version':'v2.2'});
                            FB.Event.subscribe('auth.login', function(response){ window.location.reload(); });
                            FB.Event.subscribe('auth.logout', function(response){ window.location.reload(); });
                            FB.getLoginStatus(function(response){
                                if (response && (response.status == 'connected')) {
                                    userId = response.authResponse.userID;
                                    FB.api('/me/permissions', function(response){
                                        if ((response.data[0].publish_stream == undefined) && (response.data[0].read_stream == undefined)) {
                                            FB.login(function(response){},{scope:'read_stream, publish_stream'});
                                        }
                                    });
                                }
                            });
                            (callback||function(){})(true);
                        };
                    } else {
                        (callback||function(){})(false);
                    }
                }
            );
        },

        /**
         * runFacebookShare
         *
         * 페이스북 공유 (PC)
         */
        'runFacebookShare': function(callbackFunc){
            Marketing.SNS.initFacebook(function(result){
                FB.ui({
                    'method':'feed',
                    'name':Marketing.SNS.share.name,
                    'caption':(Marketing.SNS.share.caption || Marketing.SNS.share.link),
                    'link':(Marketing.SNS.share.link+Marketing.SNS.share.linkParam || Marketing.SNS.share.caption),
                    'description':Marketing.SNS.share.description,
                    'picture':(Marketing.SNS.share.imageFB || Marketing.SNS.share.image)
                }, function(response){
                    if (callbackFunc && response && response.post_id) { (callbackFunc)(); }
                });
            });
            return false;
        },

        /**
         * runFacebookShare
         *
         * 페이스북 공유 (Mobile)
         */
        'runFacebookUrlShare': function(callbackFunc){
            var href = 'http://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(Marketing.SNS.share.link+Marketing.SNS.share.linkParam);
            Marketing.common.window(href,'facebookurl',550,440,callbackFunc);
            return false;
        },

        /**
         * runKakaotalkShare
         *
         * 카카오톡 공유 (Mobile)
         */
        'runKakaotalkShare': function(isTest, callbackFunc){
            try {
                var label = Marketing.SNS.share.messageKT;
                var link = Marketing.SNS.share.link + Marketing.SNS.share.linkParam;
                Marketing.common.includeScript('kakaotalk-jssdk','/shared/m/js/benefit/kakao.min.js',function(result){
                    if (result) {
                        // 1회만 선언되도록 처리
                        if (isTest) {
                            Kakao.init('6f542ced357469c59bc7e9a5e7bfdf47');
                            label += '\n[DEBUG]\nLink: ' + link;
                        } else {
                            Kakao.init('e8b19d280bb9df5d250126b5ac1f391e');
                            //Kakao.init('bc25f5edd21c5ef65bee500f3e106ca2');
                        }
                    }
                    Kakao.Link.sendTalkLink({
                        image: {src:(Marketing.SNS.share.imageKT || Marketing.SNS.share.image), width:"300", height:"200"},
                        label: Marketing.SNS.share.messageKT,
                        webButton: {text:"티몬으로 이동", url:link},
                        fail: function(){ alert('지원하지 않는 플랫폼 입니다.'); }
                    });
                    Kakao.Link.cleanup();
                    (callbackFunc||function(){})();
                });
            } catch (e) { console.log(e); }
            return false;
        },

        /**
         * runKakaostoryShare
         *
         * 카카오스토리 공유 (Mobile)
         */
        'runKakaostoryShare': function(callbackFunc){
        	var sTitle = Marketing.SNS.share.messageKS.split("/n")[0],
        		sDesc = Marketing.SNS.share.messageKS.split("/n")[1];
            try {
                Marketing.common.includeScript('kakaostory-jssdk','/shared/m/js/benefit/kakao.link.js',function(){
                    kakao.link("story").send({
                        post: Marketing.SNS.share.link+Marketing.SNS.share.linkParam,
                        appid: "m.tmon.co.kr",
                        appver: "1.0",
                        appname: "티몬",
                        urlinfo: JSON.stringify({
                            type: 'article',
                            title: sTitle,
                            desc: sDesc,
                            imageurl: [(Marketing.SNS.share.imageKS || Marketing.SNS.share.image)]
                        })
                    });
                    (callbackFunc||function(){})();
                });
            } catch (e) { console.log(e); }
            return false;
        },

        /**
         * runKakaostoryPCShare
         *
         * 카카오스토리 공유 (PC)
         */
        'runKakaostoryPCShare': function(callbackFunc){
            var href = 'https://story.kakao.com/share?url=' + encodeURIComponent(Marketing.SNS.share.link+Marketing.SNS.share.linkParam);
            Marketing.common.window(href,'kakaostory',550,440,callbackFunc);
            return false;
        },

        /**
         * runBandShare
         *
         * 밴드 공유 (Mobile)
         */
        'runBandShare': function(callbackFunc){
        	//안드 모바일에서 앱 ? 앱 : 스토
        		//location.href = 'intent://create/post?text='+ encodeURIComponent(Marketing.SNS.share.name+'\n'+Marketing.SNS.share.link+Marketing.SNS.share.linkParam); +'#Intent;package=com.nhn.android.band;end';
        	//애플 셋타임으로 앱호출->호출없으면 스토어 
        		//앱호출 
        		//location.href = 'bandapp://' + param;
        		//스토어
        		//location.href = 'itms-apps://itunes.apple.com/app/id542613198?mt=8';
        	
            var href = 'bandapp://create/post?text=' + encodeURIComponent(Marketing.SNS.share.name+'\n'+Marketing.SNS.share.link+Marketing.SNS.share.linkParam);
            Marketing.common.window(href,'band',550,440,callbackFunc);
            return false;
        },

        /**
         * runBandUrlShare
         *
         * 밴드 공유 (PC)
         */
        'runBandUrlShare': function(callbackFunc){
            var href = 'http://www.band.us/plugin/share?body=' + encodeURIComponent(Marketing.SNS.share.name+'\n'+Marketing.SNS.share.link+Marketing.SNS.share.linkParam);
            Marketing.common.window(href,'band',550,665,callbackFunc);
            return false;
        }
    }
};