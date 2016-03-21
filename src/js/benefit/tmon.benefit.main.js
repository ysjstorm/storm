/**
 *	Create by 20150225 JANG JAE WON, js.ordinary.
 */

var benefitMain = function( oPromotion ){
	this.init(oPromotion);
};

benefitMain.prototype = {
	init : function(oPromotion){
		this.sPromotionID = oPromotion.sPromotionID;
		this.sEventID = oPromotion.sEventID;
		this.oClosureText = oPromotion.oClosureText;
		this.sLoginUrl = oPromotion.sLoginUrl;
		this.sIsApp = oPromotion.sIsApp;
		this.cacheElement();
		this.setEvent();

		$.ajaxSetup({
			type : "POST",
			url : "/api/coupon/getCoupon",
			dataType : "json",
			context : this,
			error : function(xhr, status, error){
				if(status == 'error'){
					alert(this.callErrorCatched(xhr, error));
				}
			},
			complete : function(){
				var cpState = benefitMain.prototype.state.couponRunning;
				/*if(cpState == true){
				 TODO ajaxCall complete 중복처리
				 benefitMain.prototype.state.couponRunning = false;
				 }else{
				 return;
				 }*/
			}
		});
	},

	state : {
		couponRunning : false
	},

	callErrorCatched : function(xhr, error){
		if(xhr.status || xhr.status == 0){
			return {
				0 : 'Not connect.n Verify Network.',
				403 : 'Not connect.n Verify Network.',
				404 : 'Requested page not found. [404]',
				500 : 'Internal Server Error [500].',
				503 : 'Service Unavailable [503].'
			}[xhr.status]
		} else if(error){
			return {
				parseerror : 'Requested JSON parse failed.',
				timeout : 'Time out error.',
				abort : 'Ajax request aborted.'
			}[error]
		} else{
			return ['Uncaught Error.n',xhr.responseText].join('');
		}
	},

	template : {
		success : '<span class="bt_dwdn">쿠폰다운완료</span>',
		full : '<div class="cp_sdout"><strong>마감</strong></div>',
		earlyclosure : '<div class="cp_sdout"><strong>조기마감</strong><span>매 정시마다 선착순 발급</span></div>',
		scheduledToOpen : '<div class="cp_sdout"><strong>12시 오픈</strong></div>',
		already : '<span class="bt_dwdn">쿠폰 다운 완료</span>',
		needLogin : undefined,
		tableError : undefined,
		couponError : undefined,
		error : undefined
	},

	cacheElement : function(){
		this.welCoupon = $(".prmt_coupon");
		this.elCouponBtn = this.welCoupon.find(".bt_dw");
		this.welGocat = $('.prmt_cont > .inr > a');
		this.welSuperPick = $('.superpick');
		this.welExtraInfo = $('.bt_addimg a');
	},

	setEvent : function(){
		if(TMON.benefit.htSNS.sIsApp == 'true'){
			this.welGocat.on('click', $.proxy(this.callApp, this));
			this.welSuperPick.on('click', 'a', $.proxy(this.onClickGocat, this));
			this.elCouponBtn.on("click", $.proxy(this.onClickItem, this));
			if(this.welExtraInfo){
				this.welExtraInfo.on('click', $.proxy(this.callApp, this));
			}
		} else {
			this.elCouponBtn.on("click", $.proxy(this.onClickItem, this));
		}
	},

	callApp : function(e){
		var target = $(e.target),
			landing = target.attr('landing'),
			srl = target.attr('srl'),
			subSrl = target.attr('subSrl');

		if(landing != '' && landing.length > 0){
			target.attr('href', '#');
			e.preventDefault();

			if (srl && typeof(srl) != 'number') {
				srl = Number(srl);
			}

			if(srl == ''){
				TMON.app.callApp('event', landing);
			} else if(subSrl == '' && srl != ''){
				TMON.app.callApp('event', landing, srl);
			} else {
				TMON.app.callApp('event', landing, srl, subSrl);
			}
		}
	},

	onClickGocat : function(e){
		e.preventDefault();
		var target = $(e.currentTarget),
		//gocat = target.attr('gocat'),
			gocatSrl = target.attr('gocat'),
			gocatLanding = target.attr('gocat-landing'),
			gocatAlias = target.attr('gocat-alias'),
			gocatSubalias = target.attr('gocat-subalias'),
			gocatAppcall = target.attr('gocat-appcall');

		this.gocat(gocatSrl, gocatAlias, gocatSubalias, gocatLanding, gocatAppcall, target);

	},

	gocat : function(gocatSrl, gocatAlias, gocatSubalias, gocatLanding, gocatAppcall, target) {
		if (gocatSrl != '') {
			if (!gocatSrl.match(/^\d+$/ig)) {
				// 시리얼번호가 숫자가 아닌 경우
				if (gocatSrl.substring(0,1) == '/') {
					// 슬래시로 시작하는 경우 URL로 인식
					gocatLanding = 'promotion';
				} else {
					// 지정된 글로벌변수값 참조
					gocatSrl = window[gocatSrl];
				}
			}

			var uri = target.attr('href').replace(/#/g,"");
			var pattern = /^(http)/;
			var dealNumber = /\d+$/gi;

			if(TMON.benefit.htSNS.sIsApp == 'true'){
				target.attr('href', '#');
				if(pattern.test(uri) == true){
					var tmpNumber = uri.match(dealNumber);
					gocatSrl = tmpNumber[0];
				}
			}

			if ((TMON.benefit.htSNS.sIsApp == 'true' && TMON.benefit.htSNS.sIsLimitVersion == 'false') || f == 'true') {
				// 앱이면서 제한버전이 아니거나, 강제로 gocatAppcall을 true로 준 경우
				gocatLanding = (gocatLanding == undefined) ? '' : gocatLanding;
				var landing;
				switch (gocatLanding) {
					case 'deal'		: landing = 'goDeal'; break; 			// 딜상세
					case 'detail'	: landing = 'goDetailCategory'; break;	// 딜카테고리
					case 'daily'	: landing = 'goDailyCategory'; break;	// 기획전
					case 'promotion': landing = 'goPromotion'; break;		// 프로모션
					case 'mytmon' 	: landing = 'goMyTmon'; break;			// 마이티몬
					case 'login' 	: landing = 'login'; break;				// 로그인
					default: landing = 'goDailyCategory'; break;    // 기획전
				}
				if (landing == 'goPromotion') {
					var div = gocatSrl.match(/(\?)/g) ? '&':'?'; //추가 parameter가 있는지 여부에 따라 있으면 &로 param 추가, 없으면 ?로 param 시작
					var href = gocatSrl + div + 'view_mode=app&app_os=' + (TMON.benefit.htSNS.sIsIos == 'true' ? 'ios':'ad') + '&version=' + TMON.benefit.htSNS.sAppVersion;
					document.location.href = href;
				} else if( landing == 'goMyTmon' || landing == 'login') {
					TMON.app.callApp('event', landing); //gocatsrl은 필요x
				} else {
					if(typeof(gocatSrl) != 'number') {
						gocatSrl = Number(gocatSrl);
					}
					TMON.app.callApp('event', landing, gocatSrl);
				}
			} else if (TMON.benefit.htSNS.sIsApp == 'false') {
				// 앱이 아닌 경우
				switch (gocatLanding) {
					case 'deal'		: landing = 'http://m.ticketmonster.co.kr/deal/detailDaily/' + gocatSrl + '?cat=&subcat='; break;
					case 'detail' 	: landing = 'http://m.ticketmonster.co.kr/deal?cat=' + gocatAlias + '&subcat=' + gocatSubalias; break;
					case 'promotion': landing = 'http://m.ticketmonster.co.kr' + gocatSrl; break;
					case 'mytmon' 	: landing = 'http://m.ticketmonster.co.kr/mytmon/list'; break;
					case 'login' 	: landing = 'http://m.ticketmonster.co.kr/user/loginForm'; break;
					default: landing = 'http://m.ticketmonster.co.kr/deal?cat=deal&subcat=' + gocatSrl; break;
				}
				document.location.href = landing;
			} else {
				// 제한버전의 앱에서 실행중일 경우
				if (TMON.benefit.htSNS.sIsLimitVersion == 'true') {
					if (confirm("해당 기능을 사용하기 위해서는 티몬 앱 최신 버전을 설치하여야 합니다. 이동하시겠습니까?")) {
						document.location.href = '/promotion/appstore';
					}
				} else {
					alert("해당 기능을 사용하기 위해서는 티몬 앱 최신 버전을 설치하여야 합니다.");
				}
			}
		}
		return false;
	},

	onClickItem : function(e){
		_self = this;
		if(TMON.benefit.htSNS.sIsLoggedIn == "false"){
			var bGotoLogin = confirm("쿠폰 발급을 위해서는 로그인을 하셔야 합니다.\n로그인 페이지로 이동 하시겠습니까?")
			if(bGotoLogin){
				window.location.href = this.sLoginUrl;
			}
			return;
		}

		if(this.state.couponRunning == true){
			alert('쿠폰 발급 요청 중 입니다. 잠시만 기다려주세요.');
			return;
		}

		this.target = $(e.currentTarget);
		this.htApi = {
			couponSrl : this.target.parent().attr("data-serial")
		}
		this.setCustomClosureText(this.target, this.htApi.couponSrl);

		$.ajax({
			data : {promotionID:this.sPromotionID, couponSrl : this.htApi.couponSrl, eventID : this.sEventID},
			context : this,
			beforeSend: function(){
				this.state.couponRunning = true;
			},
			success : this.getResponseData,
			complete : function(xhr){
				_self.trackingStatus(xhr, e);
			},
			error : function(){
				_self.state.couponRunning = false;
			}
		});

	},

	getResponseData : function(oRes){
		var resCode = oRes.data.resultCode,
			resMsg = oRes.data.errorMsg,
			resExecute = this.exeResponseData(resMsg);

		switch(resCode){
			case "LOGIN" : resExecute.login(); break;
			case "SUCCESS" : resExecute.success(); break;
			case "FULL" : resExecute.full(); break;
			case "EARLYCLOSURE" : resExecute.earlyclosure(); break;
			case "SCHEDULEDTOOPEN" : resExecute.scheduledtoopen(); break;
			case "ALREADY" : resExecute.already(); break;
			case "COUPONERROR" : resExecute.couponerror(); break;
			case "TABLEERROR" : resExecute.tableerror(); break;
			case "ERROR" : resExecute.error(); break;
			case "NEWUSERONLY" : resExecute.newUserOnly(); break;
			case "LIMITLESS" : resExecute.limitless(); break;
			case "PSUCCESS" : resExecute.psuccess(); break;
			case "ASUCCESS" : resExecute.asuccess(); break;
			case "ABUSING" : resExecute.abusing(); break;
			default : return false;
		}
	},

	exeResponseData : function(sMsg){
		var that = this,
			_self = this.target;

		that.state.couponRunning = false;

		return {
			login : function(){
				alert(sMsg);
				window.location.href = that.sLoginUrl;
			},
			success : function(){
				alert('쿠폰 발급이 완료되었습니다.');
				_self.replaceWith(that.template.success);
			},
			full : function(){
				alert(sMsg);
				_self.parent().append(that.template.full);
			},
			earlyclosure : function(){
				alert(sMsg);
			},
			scheduledtoopen : function(){
				alert(sMsg);
			},
			already : function(){
				alert(sMsg);
				_self.replaceWith(that.template.already);
			},
			couponerror : function(){
				alert(sMsg);
			},
			tableerror : function(){
				alert(sMsg);
			},
			error : function(){
				alert(sMsg);
			},
			newUserOnly : function(){
				alert(sMsg);
			},
			limitless : function(){
				alert('쿠폰 발급이 완료되었습니다.');
			},
			psuccess : function(){
				alert("쿠폰이 일부만 발급되었습니다. '3장 모두 받기' 재시도를 통해 더 많은 쿠폰 혜택을 받으세요.");
			},
			asuccess : function(){
				alert("쿠폰 3장이 발급되었습니다. 마이페이지에서 확인하세요.");
			},
			abusing : function(){
				alert("잘못된 접근으로 인해 쿠폰 발급이 실패하였습니다.");
			}
		}
	},

	setCustomClosureText : function(oTarget, sSerial){
		var that = this,
			elCoupon = oTarget.parent(),
			sSelectedSerial = oTarget.parent().attr("data-serial"),
			oText = this.oClosureText,
			nSerialNum = [],
			nClosureText = [],
			elTempFull = null,
			i = null;

		if(oText === undefined || oText === null){
			return;
		}

		for( v in oText ){
			nSerialNum.push(v);
			nClosureText.push(oText[v]);
		}

		for(i = 0; i < nSerialNum.length; i++){
			if(sSelectedSerial == nSerialNum[i]){
				that.template.full = '<div class="cp_sdout"><strong>마감</strong><span>' + nClosureText[i] + '</span></div>';
			}
		}
	},
	trackingStatus : function(xhr, e){
		var handler,
			tmp = $(e.target).attr('ga-click'),
			str = tmp.split('_');

		(this.sIsApp == 'true') ? handler = 'user' : handler = 'click';

		if(tmp != 'undefined' && tmp != ''){
			if(xhr.status == 'error' || xhr.responseJSON.data.resultCode == 'ERROR' || xhr.responseJSON.data.resultCode == 'FULL'){
				if(this.sIsApp == 'true'){
					TMON.oMain.getEventTracking('send', 'event', 'MW_promotion', handler, [str[0],'_getCouponfail_',str[2]].join(''))
				} else {
					ga('send', 'event', 'MW_promotion', handler, [str[0],'_getCouponfail_',str[2]].join(''));
				}
			} else {
				if(this.sIsApp == 'true'){
					TMON.oMain.getEventTracking('send', 'event', 'MW_promotion', handler, [str[0],'_getCoupon_',str[2]].join(''))
				} else {
					ga('send', 'event', 'MW_promotion', handler, [str[0],'_getCoupon_',str[2]].join(''));
				}
			}
		}
	}
};


