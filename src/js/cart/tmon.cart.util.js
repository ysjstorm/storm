var cartUtil = function(){};
cartUtil.prototype = {
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
	 * 새 창/웹뷰에 링크 이동
	 * @param sTitle 웹뷰 헤더
	 * @param sUrl 웹뷰 url
	 */
	openNewView : function(sTitle, sUrl){
		if (TMON.view_mode === 'app') {
			TMON.app.callApp((TMON.bIsIos ? 'webview' : 'mytmon'), 'showView', sTitle, sUrl, true);
		} else {
			var win = window.open(sUrl);
			if (win !== undefined) {
				win.focus();
			} else {
				window.location.href = sUrl;
			}
		}
	},

	/**
	 * 현재 페이지/뷰에 링크 이동
	 * @param sUrl
	 */
	loadView : function(sUrl){
		if (!sUrl) {
			window.location.reload();
		} else {
			if (TMON.view_mode === 'app') {
				window.location.href = sUrl + (sUrl.indexOf('?') < 0 ? '?' : '&') + TMON.sAppQuery;
			} else {
				window.location.href = sUrl;
			}
		}
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
	},

	/**
	 * 포매팅 메시지 리턴
	 * sMessage = '%name% is %value%', htVars = {name:'J',value:'Lucky'}
	 * ==> return = 'J is Lucky'
	 * @param sMessage the message
	 * @param htVars the vars
	 * @returns formatted message
	 */
	getFormatMessage : function(sMessage, htVars){
		return sMessage ? sMessage.replace(/%[a-zA-Z0-9_$]*%/g, function(match){ return htVars[match.replace(/%/g,'')]; }) : null;
	}
};
