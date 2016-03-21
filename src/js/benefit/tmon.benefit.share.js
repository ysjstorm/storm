/**
 * Marketing_share.js v1.2
 *
 * 마케팅워킹그룹 공통 라이브러리
 *   - SNS 공유기능: 2014.10.30
 *
 * @author Marketing WG, mornya@tmon.co.kr
 */
var MarketingShare = MarketingShare||{
    'vars': {
        'promotionId': TMON.benefit.htSNS.sPromotionID,
        'pmode': 'R',
        'isMobile': TMON.benefit.htSNS.sIsMobile,
        'isApp': TMON.benefit.htSNS.sIsApp,
        'isIos': TMON.benefit.htSNS.sIsIos,
        'appVersion': TMON.benefit.htSNS.sAppVersion,
        'isLimitVersion' : TMON.benefit.htSNS.sIsLimitVersion,
        /*
        'viewMode': function(){
            return MarketingShare.vars.isApp ? 'app' : 'web';
        },
        'appOS': function(){
            return MarketingShare.vars.isIos ? 'ios' : 'ad';
        },
        */
        'api': new TmonMobile( TMON.view_mode, TMON.app_os ),
        'isAlertSuccess': false,
        'successMessage': TMON.benefit.htSNS.sSuccessMessage,
        'onBefore': null,
        'onAfter': null
    },
    'state': {
        'shareRunning': false,
        'loginUrl': TMON.benefit.htSNS.sLoginUrl
    },

    /**
     * run - 공유기능 실행
     *
     * @return value:
     *   -2 : 내부 오류
     *   -1 : 오류 alert 출력됨 (티몬앱 버전 등), 마켓이동 필요
     *   0 : 오류 alert 출력됨, 마켓이동 불필요
     *   1 : 성공
     */
    'run': function(snsType, shareParam, shareHash){
        if (MarketingShare.state.shareRunning) {
            alert('공유하기 진행 중 입니다. 잠시만 기다려주세요.');
            setTimeout(function(){ MarketingShare.state.shareRunning = false; }, 3000); // 공유하기 중복처리 timeout 설정
            return 0;
        } else if (typeof MarketingShare.vars.onBefore == 'function') {
            var r = (MarketingShare.vars.onBefore)(snsType);
            if (!r) return -2;
        }

        if (MarketingShare.vars.isMobile == 'true' && MarketingShare.vars.isApp == 'true') {
            if (MarketingShare.vars.api == undefined || MarketingShare.vars.api == null) {
                // 모바일API 설정 오류시
                alert('내부오류: 티몬 모바일 API 연동 확인 필요');
                return -2;
            } else if (MarketingShare.vars.isApp == 'true' && MarketingShare.vars.isLimitVersion == 'true') {
                // 구버전 iOS 티몬앱에서 공유 기능이 안됨
                alert('현재 고객님의 앱 버전에서는 공유하기 프로모션 참여가 불가합니다. 최신버전 앱으로 업데이트 후 참여 부탁 드리겠습니다.');
                return -1;
            }
        }

        // 완료 후 callback 처리
        var callback = function(isSuccess){
            isSuccess = isSuccess||true;
            if (MarketingShare.vars.isAlertSuccess) {
                setTimeout(function(){ alert(MarketingShare.vars.successMessage); }, 5000); // 5초 후 alert
            }
            if (typeof MarketingShare.vars.onAfter == 'function') {
                (MarketingShare.vars.onAfter)(snsType, isSuccess);
            }
        };

        MarketingShare.state.shareRunning = true;

        // SNS참여기록을 반드시 남기고 SNS공유 실행
        $.ajax({
			'type' : 'POST',
            'cache': false,
            'url': '/api/social/click',
            'data': {'promotionID':MarketingShare.vars.promotionId,'snsType':snsType},
            'success': function(resp){
                if (resp.data.result.message == 'SUCC') {
                    Marketing.SNS.share.linkParam = shareParam;
                    switch (snsType) {
                        case 'kakaotalk':
                            if (MarketingShare.vars.isApp == 'true') {
                                // 티몬앱에서는 자체 공유기능 이용
                                // 웹버전 카톡 공유시 '티몬으로 가기' 버튼 클릭시 앱으로 이동 불가
                                var description = Marketing.SNS.share.description;
                                var link = Marketing.SNS.share.link + Marketing.SNS.share.linkParam;
                                if (MarketingShare.vars.pmode == 'D') {
                                    description += "\n[DEBUG]\nLink: " + link + " / image=" + (Marketing.SNS.share.imageKS||Marketing.SNS.share.image);
                                }
                                if (MarketingShare.vars.isLimitVersion == 'false') {
                                    // RC코드내장 티몬앱 버전
                                    MarketingShare.vars.api.callApp(
                                        'webview', 'webviewShare', snsType,
                                        description, link, '',
                                        (Marketing.SNS.share.imageKS || Marketing.SNS.share.image), link,
                                        'kakaotalk_shared-'+shareHash
                                    );
                                } else {
                                    MarketingShare.vars.api.callApp(
                                        'webview', 'webviewShare', snsType,
                                        description, link, '',
                                        (Marketing.SNS.share.imageKS || Marketing.SNS.share.image), link
                                    );
                                }
                                callback();
                            } else if (MarketingShare.vars.isMobile == 'true') {
                                Marketing.SNS.runKakaotalkShare((MarketingShare.vars.pmode == 'D'), callback);
                            } else {
                                alert('모바일에서만 공유가 가능합니다.');
                            }
                            break;
                        case 'kakaostory':
                            if (MarketingShare.vars.isApp == 'true') {
                                // 티몬앱에서는 자체 공유기능 이용
                                MarketingShare.vars.api.callApp(
                                    'webview', 'webviewShare', snsType,
                                    Marketing.SNS.share.description, Marketing.SNS.share.link+Marketing.SNS.share.linkParam, '',
                                    (Marketing.SNS.share.imageKS || Marketing.SNS.share.image), Marketing.SNS.share.link+Marketing.SNS.share.linkParam
                                );
                                callback();
                            } else if (MarketingShare.vars.isMobile == 'true') {
                                Marketing.SNS.runKakaostoryShare(callback);
                            } else {
                                Marketing.SNS.runKakaostoryPCShare(callback);
                            }
                            break;
                        case 'facebook':
                            if (MarketingShare.vars.isApp == 'true') {
                                MarketingShare.vars.api.callApp(
                                    'webview', 'webviewShare', snsType,
                                    Marketing.SNS.share.description, Marketing.SNS.share.link+Marketing.SNS.share.linkParam, '',
                                    (Marketing.SNS.share.imageFB || Marketing.SNS.share.image), Marketing.SNS.share.link+Marketing.SNS.share.linkParam
                                );
                                callback();
                            } else if (MarketingShare.vars.isMobile == 'true') {
                                Marketing.SNS.runFacebookUrlShare(callback);
                            } else {
                                Marketing.SNS.runFacebookShare(callback);
                            }
                            break;
                        case 'twitter':
                            Marketing.SNS.runTwitterShare(callback);
                            break;
                        case 'googleplus':
                            Marketing.SNS.runGooglePlusShare(callback);
                            break;
                        case 'line':
                            if (MarketingShare.vars.isApp == 'true') {
                                MarketingShare.vars.api.callApp(
                                    'webview', 'webviewShare', 'naverline',
                                    Marketing.SNS.share.description, Marketing.SNS.share.link+Marketing.SNS.share.linkParam, '', '', ''
                                );
                                callback();
                            } else if (MarketingShare.vars.isMobile == 'true') {
                                Marketing.SNS.runLineShare(callback);
                            } else {
                                alert('모바일에서만 공유가 가능합니다.');
                            }
                            break;
                        case 'band':
                            if (MarketingShare.vars.isApp == 'true') {
                                MarketingShare.vars.api.callApp(
                                    'webview', 'webviewShare', 'naverband',
                                    Marketing.SNS.share.description, Marketing.SNS.share.link+Marketing.SNS.share.linkParam, '', '', ''
                                );
                                callback();
                            } else {
                            	// bandapp:
                                Marketing.SNS.runBandUrlShare(callback);
                            }
                            break;
                        case 'urlcopy':
                            if (MarketingShare.vars.isApp == 'true') {
                                MarketingShare.vars.api.callApp(
                                    'webview', 'setClipboard', Marketing.SNS.share.description + ' ' + Marketing.SNS.share.link+Marketing.SNS.share.linkParam,
                                    '', '', '', '', ''
                                );
                                callback();
                            } else if (MarketingShare.vars.isMobile == 'true') {
                                alert('티몬 앱 혹은 PC에서만 공유가 가능합니다.');
                            } else {
                                callback(); // 데스크탑에서는 별도로 구현해야 함 (2014 연말프로모션 참고)
                            }
                            break;
                        default:
                            break;
                    }
                } else {
                    alert('진행 중 오류가 발생하였습니다.\n\n다시 한 번 시도해주세요.');
                }

                MarketingShare.state.shareRunning = false;
            },
            'error': function(req,stat,err){
                if (req.status == '502') {
                    alert('크롬 설정으로 인해 참여기록을 남길 수 없습니다.\n\n크롬 설정 > 트래픽 관리 > 데이터 사용량 줄이기 기능을 끄셔야 정상적으로 참여가 가능합니다');
                } else {
                    alert('서버 오류로 인해 참여기록을 남길 수 없습니다 (' + req.status + ')');
                }

                MarketingShare.state.shareRunning = false;
                return 0;
            }
        });

        return 1;
    }
};
/**
 * temp sns test code
 */
$('.share_sns button').each(function(idx, el){
	$(el).on('click', function(){
		if(TMON.benefit.htSNS.sIsLoggedIn == "false"){
			var bGotoLogin = confirm("SNS공유를 위해서는 로그인을 하셔야 합니다.\n로그인 페이지로 이동 하시겠습니까?")
			if(bGotoLogin){
				window.location.href = MarketingShare.state.loginUrl;
			}
			return;
		}
		var sSnsName = $(this).attr('class').split('_')[1];
		switch(sSnsName){
			case 'katalk': MarketingShare.run('kakaotalk', TMON.benefit.htSNS.linkParam, TMON.benefit.htSNS.sHashtags);
				break;
			case 'kastory': MarketingShare.run('kakaostory', TMON.benefit.htSNS.linkParam, TMON.benefit.htSNS.sHashtags);
				break;
			case 'facebook': MarketingShare.run('facebook', TMON.benefit.htSNS.linkParam, TMON.benefit.htSNS.sHashtags);
				break;
			case 'band': MarketingShare.run('band', TMON.benefit.htSNS.linkParam, TMON.benefit.htSNS.sHashtags);
				break;
			default :
				break;
		}
	});
});
