/**
 * SnsShare.js v6
 * (App / Mobile only)
 *
 * @author mornya
 * @param htProps 옵션 (위키 참고: https://wiki.tmon.co.kr/pages/viewpage.action?pageId=21504934)
 * @constructor
 */
var SnsShare = function(htProps){
	this.init(htProps);
};
SnsShare.prototype = {
	// SDK URL 설정
	htSdkUrl : {
		sFacebook : '//connect.facebook.net/ko_KR/sdk.js',
		sTwitter : '//platform.twitter.com/widgets.js',
		sKakao : '//developers.kakao.com/sdk/js/kakao.min.js',
		sGoogle: '//apis.google.com/js/platform.js'
	},

	// 링크 URL 설정
	htLinkUrl : {
		sFacebook : 'https://www.facebook.com/sharer/sharer.php',
		sFacebookFollow : 'https://www.facebook.com/',
		sTwitter : 'https://twitter.com/share',
		sTwitterFollow : 'https://twitter.com/',
		sLine : 'http://line.naver.jp/R/msg/text/',
		sBand : 'http://www.band.us/plugin/share',
		sGoogleplus : 'https://plus.google.com/share',
		sEmail : 'mailto:',
		sGmail : 'https://mail.google.com/mail/'
	},

	// SNS 종류별 실행할 메소드 정의
	htMethods : {
		// [share/tag(0/1), callFunction, apiType(0/1/2/3/4=none/fb/tw/go/kk)]
		'facebook' : [0, 'shareFacebook', 1],
		'twitter' : [0, 'shareTwitter', 0], // API 불필요
		'kakaotalk' : [0, 'shareKakaoTalk', 4],
		'kakaostory' : [0, 'shareKakaoStory', 4],
		'band' : [0, 'shareBand', 0],
		'line' : [0, 'shareLine', 0],
		'googleplus' : [0, 'shareGooglePlus', 0],
		'email' : [0, 'shareEmail', 0],
		'gmail' : [0, 'shareGmail', 0],
		'facebook-like' : [1, 'setTag4FacebookLike', 1],
		'facebook-comments-count' : [1, 'setTag4FacebookCommentsCount', 1],
		'facebook-comments' : [1, 'setTag4FacebookComments', 1],
		'facebook-follow' : [1, 'setTag4FacebookFollow', 1],
		'twitter-tweet' : [1, 'setTag4TwitterTweet', 2],
		'twitter-follow' : [1, 'setTag4TwitterFollow', 2],
		'google-plusone' : [1, 'setTag4GooglePlusone', 3],
		'google-follow' : [1, 'setTag4GoogleFollow', 3]
	},

	// 각종 프로퍼티 설정
	htProps : {
		sSelector : '.share',
		htAppId : {
			sFacebook : '261083260580516',
			sKakao : 'e8b19d280bb9df5d250126b5ac1f391e'
		},
		sTitle : 'TMON', // 공유 제목
		sContent : '이 페이지를 공유합니다.', // 공유 내용
		sUrl : window.location.href, // 공유 할 URL
		sHashTags : '티몬,티켓몬스터', // 트위터 해시태그 (콤마로 구분)
		sImage : '', // 공유 할 이미지 (200x200)
		htFacebook : { // 페이스북용 설정
			sCaption : null, // 포스팅시 노출될 캡션 (null시 htProps.sUrl값)
			bUseOAuth : true,
			sProfileUrl : 'tmonkr', // 팬페이지 URL
			nProfileId : 194806033875286, // 팬페이지 ID
			aPermissions : ['public_profile'], // 기본 퍼미션만 있어야 함!
			sColorScheme : 'light',
			nNumPosts : 10,
			cbOnLogin : function(){ window.location.reload(); },
			cbOnLogout : function(){ window.location.reload(); },
			cbOnLike : function(){},
			cbOnUnlike : function(){}
		},
		htTwitter : { // 트위터용 설정
			sScreenName : '@tmonkr'
		},
		htKakaotalk : { // 카카오톡용 설정
			sMessage : '',
			sImageForApp : '' // 앱용 이미지 (300x200)
		},
		htKakaostory : { // 카카오스토리용 설정
			bUseOAuth : false,
			sPermission : 'F', // F:친구에게만 공개, A:전체 공개, M:나만 보기
			sImageForApp : '' // 앱용 이미지 (300x200)
		},
		htGoogle : {
			sPageId : '111432258262189392153' // 티몬 오피셜(plus.google.com/111432258262189392153)
		},
		fnCallApp : null, // callApp을 커스터마이징 해야할 때
		cbOnBefore : function(){},
		cbOnCompleted : function(){}
	},

	bIsShareRunning : false,

	init: function(htProps){
		this.cacheElement();
		this.getOpenGraphTag(); // 페이지 내 OG태그 읽어오기

		if (htProps !== undefined) {
			this.htSavedProps = htProps;
			$.extend(true, this.htProps, htProps); // merge recursively
		} else {
			this.htSavedProps = {};
		}

		this.prepareShare();
	},

	cacheElement: function(){
		this.welHead = $('html > head');
	},

	prepareShare: function(){
		// preparing sns share event
		var usage = {};
		$(this.htProps.sSelector).each($.proxy(function(i, e){
			var welEl = $(e);
			var sType = welEl.data('type');
			var aDest = this.htMethods[sType];
			usage[aDest[2]] = true;
			if (aDest !== undefined && aDest[0] === 0) {
				welEl.on('click', $.proxy(function(e){
					e.preventDefault();
					this.onClickShare(aDest[1], sType);
				}, this));
			} else {
				($.proxy(this[aDest[1]], this))(welEl);
			}
		}, this));

		if (!!usage['1']) this.initFacebook();
		if (!!usage['2']) this.initTwitter();
		if (!!usage['3']) this.initGoogle();
		if (!!usage['4']) this.initKakao();
	},

	/**
	 * OG 태그가 페이지내에 존재할 경우 값을 읽어온다.
	 */
	getOpenGraphTag: function(){
		var getMetaProperty = $.proxy(function(propName, defaultValue){
			var oElement = this.welHead.find('meta[property="' + propName + '"]');
			return (!oElement || oElement.length === 0) ? defaultValue : $.trim(oElement.attr('content'));
		}, this);

		this.htProps.sTitle = getMetaProperty('og:title', this.htProps.sTitle);
		this.htProps.sImage = getMetaProperty('og:image', this.htProps.sImage);
		this.htProps.sContent = getMetaProperty('og:description', this.htProps.sContent);
		this.htProps.sUrl = getMetaProperty('og:url', this.htProps.sUrl);
		this.htProps.htAppId.sFacebook = getMetaProperty('fb:app_id', this.htProps.htAppId.sFacebook);

		if (this.htProps.sImage && this.htProps.sImage[0] === '/') {
			this.htProps.sImage = 'http://' + window.location.host + this.htProps.sImage;
		}
	},

	/**
	 * 동적 스크립트 로딩
	 * 주의: SSL에서는 Android Browser에서 스크립트 로딩이 안될 수 있음.
	 */
	loadScript: function(sId, sSrc, cbFunc){
		if (!document.getElementById(sId)) {
			var head = document.getElementsByTagName('head')[0];
			var script = document.createElement('script');
			var loaded = false;
			script.type = 'text/javascript';
			script.charset = 'utf-8';
			script.id = sId;
			script.src = sSrc;
			script.onreadystatechange = function(){
				if (((this.readyState=='loaded') || (this.readyState=='complete')) && loaded) return;
				loaded = true;
				if ($.browser.msie && $.inArray(parseInt($.browser.version), [7,8]) != -1) {
					(cbFunc||function(){})(true); // IE 7,8
				}
			};
			script.onload = function(){ (cbFunc||function(){})(true); };
			head.appendChild(script);
		} else {
			(cbFunc||function(){})(false);
		}
	},

	/**
	 * 공유 완료시 실행
	 * arguments: (snsType, isSuccess, ...)
	 * @private
	 */
	completeEvent: function(){
		this.htProps.cbOnCompleted(arguments);
		this.bIsShareRunning = false;
	},

	/**
	 * 맵을 URL 파라미터로 변환
	 * @param sUrl the url
	 * @param htParam the param
	 * @returns {string}
	 */
	mapToParam: function(sUrl, htParam){
		var result = $.map(htParam, function(sValue, sKey){
			return sKey + '=' + encodeURIComponent(sValue);
		});
		return sUrl + (result.length > 0 ? ('?' + result.join('&')) : '');
	},

	/**
	 * 공유 실행시 페이지를 새창으로 띄운다.
	 * @param sUrl the url
	 * @param htParam the param
	 * @param sName the name
	 * @param aSize the size
	 * @param bIsSuccess is success
	 */
	openWindow: function(sUrl, htParam, sName, aSize, bIsSuccess){
		var sHref = this.mapToParam(sUrl, htParam);
		if (TMON.view_mode === 'app') {
			if (!sHref.match(/(_ableBrowserOpen)/)) {
				sHref += (sHref.match(/[\?]/g) ? '&' : '?') + '_ableBrowserOpen=plz';
			}
		}
		//var nWidth = aSize[0];
		//var nHeight = aSize[1];
		var oWin = window.open(sHref, '__sns_share_' + sName);
		if (!!oWin) {
			oWin.focus();
		} else {
			// iOS 모바일에서는 window.open시 undefined
			window.location.href = sHref;
		}
		this.completeEvent(sName, bIsSuccess); // callback
	},

	onClickShare: function(sMethod, sType){
		if (this.bIsShareRunning) {
			alert('공유하기 진행 중 입니다. 잠시만 기다려주세요.');
		} else {
			this.bIsShareRunning = true;

			var that = this;
			setTimeout(function(){
				that.bIsShareRunning = false;
			}, 2000); // 공유하기 중복처리 timeout 설정

			// 공유하기 전 이벤트 함수 실행 (false로 리턴되면 공유하기 실행하지 않음)
			if (this.htProps.cbOnBefore(sType) !== false) {
				(this[sMethod])();
			}
		}
	},

	/**
	 * 페이스북 SDK 초기화
	 * @see https://developers.facebook.com/docs/javascript/quickstart/v2.5
	 */
	initFacebook: function(){
		window.fbAsyncInit = $.proxy(function(){
			FB.init({
				appId : this.htProps.htAppId.sFacebook,
				version : 'v2.5',
				cookie : true,
				status : true,
				xfbml : true
			});

			// 로그인시 콜백
			FB.Event.subscribe('auth.login', $.proxy(function(response){ this.htProps.htFacebook.cbOnLogin(response); }, this));
			// 로그아웃시 콜백
			FB.Event.subscribe('auth.logout', $.proxy(function(response){ this.htProps.htFacebook.cbOnLogout(response); }, this));
			// like 버튼 클릭시: like일때 콜백
			FB.Event.subscribe('edge.create', $.proxy(function(response){ this.htProps.htFacebook.cbOnLike(response); }, this));
			// like 버튼 클릭시: unlike일때 콜백
			FB.Event.subscribe('edge.remove', $.proxy(function(response){ this.htProps.htFacebook.cbOnUnlike(response); }, this));
		}, this);

		this.loadScript('facebook-jssdk', this.htSdkUrl.sFacebook);
	},

	/**
	 * 트위터 SDK 초기화
	 * @see https://dev.twitter.com/web/overview
	 */
	initTwitter: function(){
		this.loadScript('twitter-jssdk', this.htSdkUrl.sTwitter);
	},

	/**
	 * 구글플러스 SDK 초기화
	 */
	initGoogle: function(){
		window.___gcfg = {
			lang : 'ko-KR',
			parsetags : 'onload'
		};
		this.loadScript('google-jssdk', this.htSdkUrl.sGoogle);
	},

	/**
	 * 카카오 SDK 초기화
	 */
	initKakao: function(){
		// 별도로 지정된 카카오톡 메시지/이미지를 사용
		this.htProps.htKakaotalk.sMessage =
			this.htProps.htKakaotalk.sMessage || (this.htProps.sTitle + '\n' + this.htProps.sContent);
		this.htProps.htKakaotalk.sImageForApp =
			this.htProps.htKakaotalk.sImageForApp || this.htProps.sImage;
		this.htProps.htKakaostory.sImageForApp =
			this.htProps.htKakaostory.sImageForApp || this.htProps.sImage;

		window.kakaoAsyncInit = $.proxy(function(){
			Kakao.init(this.htProps.htAppId.sKakao);
		}, this);
		this.loadScript('kakao-jssdk', this.htSdkUrl.sKakao);
	},

	/**
	 * API 오브젝트가 완료될 때까지 대기 후 콜백
	 * @param sName the API name
	 * @param cbFunc the callback function
	 */
	waitApiReady: function(sName, cbFunc){
		if (!!window[sName]) {
			cbFunc(window[sName]);
		} else {
			var nTi = setInterval(function(){
				if (!!window[sName]) {
					clearTimeout(nTi);
					cbFunc(window[sName]);
				}
			}, 200);
		}
	},

	/**
	 * 페이스북 공유
	 */
	shareFacebook: function(){
		if (TMON.view_mode === 'app') {
			(this.htProps.fnCallApp || TMON.app.callApp)(
				'webview', 'webviewShare', 'facebook',
				this.htProps.sTitle, this.htProps.sUrl, this.htProps.sContent,
				this.htProps.sImage, this.htProps.sUrl
			);
			this.completeEvent('facebook', true);
		} else {
			if (!!this.htProps.htFacebook.bUseOAuth) {
				// initialize if not defined, and run share
				this.waitApiReady('FB', $.proxy(function(){
					var cbFunc = $.proxy(this.completeEvent, this);
					FB.ui({
						method : 'feed',
						name : this.htProps.sTitle,
						caption : this.htProps.htFacebook.sCaption || this.htProps.sUrl,
						link : this.htProps.sUrl,
						description : this.htProps.sContent,
						picture : this.htProps.sImage
					}, function(response) {
						// 페이스북 공유 완료시 콜백
						var bResult = (response && response.post_id);
						cbFunc('facebook', bResult);
					});
				}, this));
			} else {
				this.openWindow(this.htLinkUrl.sFacebook, {
					u : this.htProps.sUrl
				}, 'facebook', [550, 440], true);
			}
		}
	},

	/**
	 * 트위터 공유
	 */
	shareTwitter: function(){
		this.openWindow(this.htLinkUrl.sTwitter, {
			text : (this.htProps.sTitle + '\n' + this.htProps.sContent),
			url : this.htProps.sUrl,
			hashtags : this.htProps.sHashTags
		}, 'twitter', [550, 440], true);
	},

	/**
	 * 카카오톡 공유
	 * @see https://developer.kakao.com/docs/js-reference
	 */
	shareKakaoTalk: function(){
		if (TMON.view_mode === 'app') {
			// 티몬앱에서는 자체 공유기능 이용
			// 웹버전 카톡 공유시 '티몬으로 가기' 버튼 클릭시 앱으로 이동 불가
			(this.htProps.fnCallApp || TMON.app.callApp)(
				'webview', 'webviewShare', 'kakaotalk',
				this.htProps.htKakaotalk.sMessage, this.htProps.sUrl, '',
				this.htProps.htKakaotalk.sImageForApp, this.htProps.sUrl
			);
			this.completeEvent('kakaotalk', true);
		} else {
			// initialize if not defined, and run share
			this._executeKakaoTalkApi();
		}
	},

	/**
	 * 카카오톡 SDK 초기화
	 * @see https://developer.kakao.com/docs/js-reference
	 * @private
	 */
	_executeKakaoTalkApi: function(){
		this.waitApiReady('Kakao', $.proxy(function(){
			Kakao.Link.sendTalkLink({
				label : this.htProps.htKakaotalk.sMessage,
				image : {
					src : this.htProps.htKakaotalk.sImageForApp,
					width : '300',
					height : '200'
				},
				webButton : {
					text : '웹으로 연결',
					url : this.htProps.sUrl
				},
				installTalk : true,
				fail : function(){
					alert('카카오톡 공유는 현재 iOS와 안드로이드 운영체제에서만 지원됩니다.');
				}
			});
			Kakao.Link.cleanup();
			this.completeEvent('kakaotalk', true);
		}, this));
	},

	/**
	 * 카카오스토리 공유
	 */
	shareKakaoStory: function(){
		if (TMON.view_mode === 'app') {
			// 티몬앱에서는 자체 공유기능 이용
			(this.htProps.fnCallApp || TMON.app.callApp)(
				'webview', 'webviewShare', 'kakaostory',
				this.htProps.sTitle, this.htProps.sUrl, this.htProps.sContent,
				this.htProps.htKakaostory.sImageForApp, this.htProps.sUrl
			);
			this.completeEvent('kakaostory', true);
		} else {
			this.waitApiReady('Kakao', $.proxy(function(){
				if (!!this.htProps.htKakaostory.bUseOAuth) {
					// OAuth를 이용한 자동 포스팅
					this._executeKakaoStoryOAuth();
				} else {
					// 스토리 API를 이용한 수동 포스팅
					this._executeKakaoStoryLink();
				}
			}, this));
		}
	},

	/**
	 * 카카오스토리 API 초기화
	 * @see https://developer.kakao.com/docs/js-reference
	 * @private
	 */
	_executeKakaoStoryOAuth: function(){
		var that = this;
		Kakao.Auth.login({
			success: function(oAuth) {
				// 로그인 성공시
				if (oAuth.access_token && oAuth.refresh_token) {
					Kakao.API.request({ // 대상 url로부터 스크랩 정보를 얻어옴
						url : '/v1/api/story/linkinfo',
						data : {
							url : that.htProps.sUrl
						}
					}).then(function(res) {
						return Kakao.API.request({ // 링크 방식의 포스팅 API 호출
							url : '/v1/api/story/post/link',
							data : {
								link_info : res,
								content : that.htProps.sContent,
								permission : that.htProps.htKakaostory.sPermission,
								enable_share : true // 포스팅을 공유 가능
							}
						});
					}).then(function(res) {
						return Kakao.API.request({ // 포스팅한 내스토리 정보 API 호출
							url : '/v1/api/story/mystory',
							data : {
								id : res.id
							}
						});
					}).then(function(res) {
						// 성공시:alert(JSON.stringify(res));
						that.completeEvent('kakaostory', true, res);
					}, function(err) {
						// 실패시:alert(JSON.stringify(err));
						that.completeEvent('kakaostory', false, err);
					});
				}
			},
			fail: function(err) {
				// 실패시:alert(JSON.stringify(err));
				that.completeEvent('kakaostory', false, err);
			}
		});
	},

	_executeKakaoStoryLink: function(){
		Kakao.Story.share({
			url : this.htProps.sUrl,
			text : this.htProps.sContent
		});
	},

	/**
	 * 네이버라인 텍스트 공유
	 * API Reference http://media.line.me/howto/ja/
	 * 형식 http://line.me/R/msg/<CONTENT TYPE>/?<CONTENT KEY>
	 * iOS에서는 CONTENT TYPE 줄바꿈에 캐리지리턴을 사용하고 http 프로토콜은 제거한다
	 * callApp 파라미터가 iOS는 line, 안드로이드는 naverline이다
	 */
	shareLine: function(){
		var sUrl, sLineBreak;
		if (TMON.bIsIos) {
			sUrl = this.htProps.sUrl.replace(/^https?:\/\//, '');
			sLineBreak = '\r';
		} else {
			sUrl = this.htProps.sUrl;
			sLineBreak = '\n';
		}

		if (TMON.view_mode === 'app') {
			(this.htProps.fnCallApp || TMON.app.callApp)(
                    'webview', 'webviewShare', (TMON.bIsIos ? 'line' : 'naverline'),
					this.htProps.sContent, sUrl, '', '', ''
			);
			this.completeEvent('line', true);
		} else {
			this.openWindow(this.htLinkUrl.sLine +
					encodeURIComponent(this.htProps.sContent + sLineBreak + sUrl),
					{}, 'line', [0, 0], true);
		}
	},

	/**
	 * 네이버밴드 공유
	 */
	shareBand: function(){
		if (TMON.view_mode === 'app') {
			(this.htProps.fnCallApp || TMON.app.callApp)(
				'webview', 'webviewShare', 'naverband',
				this.htProps.sContent, this.htProps.sUrl, '', '', ''
			);
			this.completeEvent('band', true);
		} else {
			this.openWindow(this.htLinkUrl.sBand, {
				body : (this.htProps.sTitle + '\n' + this.htProps.sUrl)
			}, 'band', [550, 665], true);
		}
	},

	/**
	 * 구글플러스 공유
	 */
	shareGooglePlus: function(){
		this.openWindow(this.htLinkUrl.sGoogleplus, {
			url : this.htProps.sUrl
		}, 'googleplus', [512, 640], true);
	},

	/**
	 * URL복사 공유
	 */
	shareUrlCopy: function(){
		if (TMON.view_mode === 'app') {
			(this.htProps.fnCallApp || TMON.app.callApp)(
				'webview', 'setClipboard',
				this.htProps.sContent + ' ' + this.htProps.sUrl,
				'', '', '', '', ''
			);
			this.completeEvent('urlcopy', true);
		} else {
			alert('URL 공유는 티몬 앱에서 가능합니다.');
		}
	},

	/**
	 * 이메일 공유
	 */
	shareEmail: function(){
		window.location.href = this.mapToParam(this.htLinkUrl.sEmail, {
			subject : this.htProps.sTitle,
			body : this.htProps.sContent + '\n' + this.htProps.sUrl
		});
	},

	/**
	 * 지메일 공유
	 */
	shareGmail: function(){
		this.openWindow(this.htLinkUrl.sGmail, {
			view : 'cm',
			fs : '1',
			su : this.htProps.sTitle,
			body : this.htProps.sContent + '\n' + this.htProps.sUrl,
			ui : '1'
		}, 'gmail', [512, 640], true);
	},

	/**
	 * 페이스북 플러그인: like 버튼
	 * @param wel the wel
	 */
	setTag4FacebookLike: function(wel){
		wel.html('<div class="fb-like" data-href="' + this.htLinkUrl.sFacebookFollow + this.htProps.htFacebook.sProfileUrl + '" data-colorscheme="' + this.htProps.htFacebook.sColorScheme + '" data-layout="button_count" data-action="like" data-show-faces="false" data-share="false" data-send="false" style="display:inline-block;height:20px;overflow:hidden"></div>');
	},

	/**
	 * 페이스북 플러그인: 댓글 목록 갯수
	 * @param wel the wel
	 */
	setTag4FacebookCommentsCount: function(wel){
		wel.html('<span class="fb-comments-count" data-href="' + this.htLinkUrl.sFacebookFollow + this.htProps.htFacebook.sProfileUrl + '"></span>');
	},

	/**
	 * 페이스북 플러그인: 댓글 목록
	 * @param wel the wel
	 */
	setTag4FacebookComments: function(wel){
		wel.html('<div class="fb-comments" data-href="' + this.htLinkUrl.sFacebookFollow + this.htProps.htFacebook.sProfileUrl + '" data-colorscheme="' + this.htProps.htFacebook.sColorScheme + '" data-width="100%" data-numposts="' + this.htProps.htFacebook.nNumPosts + '"></div>');
	},

	/**
	 * 페이스북 플러그인: follow 버튼
	 * @param wel the wel
	 */
	setTag4FacebookFollow: function(wel){
		wel.html('<div class="fb-follow" data-href="' + this.htLinkUrl.sFacebookFollow + this.htProps.htFacebook.sProfileUrl + '" data-colorscheme="' + this.htProps.htFacebook.sColorScheme + '" data-layout="button_count" data-show-faces="true"></div>');
	},

	isFacebookAuthorized: function(cbFunc){
		var aReqPerms = this.htProps.htFacebook.aPermissions;

		FB.api('/me/permissions', function(response){
			if (!!response && !!response.data) {
				var fbPerms = [];
				for (var idx in response.data) {
					if (response.data.hasOwnProperty(idx)) {
						fbPerms.push(response.data[idx].permission);
					}
				}
				for (var i = 0, permsLen = aReqPerms.length; i < permsLen; i++) {
					if ($.inArray(aReqPerms[i], fbPerms) === -1) {
						// 미존재 퍼미션으로 재로그인 필요
						(cbFunc||function(){})(false);
						return;
					}
				}
				// 로그인 및 퍼미션 충족시 콜백
				(cbFunc||function(){})(true);
			} else {
				// 퍼미션 미존재시 전체 퍼미션으로 재로그인 요청
				(cbFunc||function(){})(false);
			}
		});
	},

	isFacebookLogin: function(cbFunc){
		FB.getLoginStatus(function(response){
			if (response.status === 'connected') {
				(cbFunc||function(){})('OK', response);
			} else if (response.status === 'not_authorized') {
				// 페이스북 로그인 및 퍼미션 미 충족
				(cbFunc||function(){})('NO_AUTH', response);
			} else {
				// 페이스북 미 로그인
				(cbFunc||function(){})('NO_LOGIN', response);
			}
		});
	},

	/**
	 * 페이스북 로그인
	 * @param cbFunc the callback function
	 */
	doFacebookLogin: function(cbFunc){
		FB.login(function(response){
			(cbFunc||function(){})(response);
		}, {
			scope : this.htProps.htFacebook.aPermissions.join(','),
			auth_type : 'rerequest'
		});
	},

	/**
	 * 페이스북 좋아요 여부 체크
	 * @param cbFunc the callback function
	 */
	isFacebookLikedPage: function(cbFunc){
		var fnAction = $.proxy(function(response){
			if (response && response.status === 'connected') {
				FB.api('/me/likes/' + this.htProps.htFacebook.nProfileId, function(response){
					var result = (!!response && response.data && response.data.length > 0);
					(cbFunc||function(){})(result);
				});
			} else {
				(cbFunc||function(){})(false);
			}
		}, this);

		this.waitApiReady('FB', $.proxy(function(){
			this.isFacebookLogin($.proxy(function(sResult, response){
				if (sResult === 'OK') {
					this.isFacebookAuthorized($.proxy(function(bResult){
						if (bResult) {
							fnAction(response);
						} else {
							this.doFacebookLogin(fnAction);
						}
					}, this));
				} else {
					this.doFacebookLogin(fnAction);
				}
			}, this));
		}, this));
	},

	/**
	 * 페이스북 자동 포스팅
	 * @param message 포스팅에 입력할 텍스트 메시지
	 * @param cbFunc the callback function
	 */
	doFacebookAutoPost: function(message, cbFunc){
		var fnAction = $.proxy(function(response){
			if (response && response.status === 'connected') {
				FB.api('/me/feed', 'post', {
					method : 'feed',
					name : this.htProps.sTitle,
					caption : this.htProps.htFacebook.sCaption || this.htProps.sUrl,
					link : this.htProps.sUrl,
					description : this.htProps.sContent,
					picture : this.htProps.sImage,
					message : message
				}, function(response){
					var bResult = (response && !response.error); // false: 권한 등의 이유로 포스팅 실패
					(cbFunc || function(){})(bResult);
				});
			} else {
				(cbFunc || function(){})(false);
			}
		}, this);

		this.waitApiReady('FB', $.proxy(function(){
			this.isFacebookLogin($.proxy(function(sResult, response){
				if (sResult === 'OK') {
					this.isFacebookAuthorized($.proxy(function(bResult){
						if (bResult) {
							fnAction(response);
						} else {
							this.doFacebookLogin(fnAction);
						}
					}, this));
				} else {
					this.doFacebookLogin(fnAction);
				}
			}, this));
		}, this));
	},

	/**
	 * 트위터 플러그인: tweet 버튼
	 * @param wel the wel
	 */
	setTag4TwitterTweet: function(wel){
		var sHref = this.mapToParam(this.htLinkUrl.sTwitter, {
			text : (this.htProps.sTitle + '\n' + this.htProps.sContent),
			url : this.htProps.sUrl,
			hashtags : this.htProps.sHashTags
		});
		wel.html('<a href="' + sHref + '" class="twitter-share-button" data-url="' + this.htProps.sUrl + '" data-counturl="' + this.htProps.sUrl + '">Tweet</a>');
	},

	/**
	 * 트위터 플러그인: follow 버튼
	 * @param wel the wel
	 */
	setTag4TwitterFollow: function(wel){
		var sHref = this.htLinkUrl.sTwitterFollow + (this.htProps.htTwitter.sScreenName.replace('@',''));
		wel.html('<a href="' + sHref + '" class="twitter-follow-button" data-show-screen-name="false">Follow ' + this.htProps.htTwitter.sScreenName + '</a>');
	},

	/**
	 * 구글플러스 플러그인: +1 버튼
	 * @param wel the wel
	 */
	setTag4GooglePlusone: function(wel){
		wel.html('<div class="g-plusone" data-href="' + this.htLinkUrl.sGoogleplus + this.htProps.htGoogle.sPageId + '" data-size="medium"></div>');
	},

	/**
	 * 구글플러스 플러그인: follow 버튼
	 * @param wel the wel
	 */
	setTag4GoogleFollow: function(wel){
		wel.html('<div class="g-follow" data-href="' + this.htLinkUrl.sGoogleplus + this.htProps.htGoogle.sPageId + '" data-rel="author"></div>');
	}
};
