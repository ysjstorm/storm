/**
 * 상품 문의 페이지
 */
var wearInquiry = function(htOptions){
	$.extend(this, htOptions);
	this.htOptions = htOptions;
	this.init();
};

wearInquiry.prototype = {
	MAX_COUNT_PER_PAGE : 20, // 한페이지에 불러오는 최대 리스트 개수

	init: function () {
		this.cacheElement();
		this.setEvent();
		this.setTemplate();
		this.sDealNo = $("#_writeBtn .confirm").attr("data-dealno");
		this.oCounter = new textCounter(this.welText, null, 200);
		this.sLoginId = this.welListContainer.attr("data-loginid");
		this.showWriteWithHash();
	},

	cacheElement: function () {
		this.welList = $("#_inquiryList");
		this.welWrite = $("#_inquiryWrite");
		this.welText = $("#_inputText");

		this.welListContainer = $("#_inquiryListContainer");
		this.welMoreWrap = $(".more_content");
	},

	setEvent: function () {
		$("#_btnWrite").click($.proxy(this.showWrite, this)); // 상품문의하기 버튼
		$("#_writeBtn .confirm").click($.proxy(this.onSubmitWrite, this)); // 등록
		$("#_writeBtn .cancel").click($.proxy(this.hideWrite, this)); // 취소
		$(".btn_more").click($.proxy(this.getInquiryList, this));
		this.welList.on("click", ".btn_lst_delete", $.proxy(this.deleteItem, this));
	},

	setTemplate : function(){
		this.tplItem = Handlebars.compile($("#inquiryListTemplate").html());
	},

	showWriteWithHash : function(){
		if(window.location.hash == "#write" && TMON.bLogin){
			this.showWrite();
		}
	},

	showWrite : function(){
		if(TMON.view_mode == "app" && TMON.bLogin == false){
			TMON.app.callApp('webview','login');
			return false;
		}else if(TMON.bLogin == false){
			return true;
		}
		this.welList.hide();
		this.welWrite.show();
		return false;
	},

	hideWrite : function(){
		this.welText.val("");
		this.welWrite.hide();
		this.welList.show();
		return false;
	},

	getInquiryList : function(){
		var sLastArticleNo = this.welListContainer.find("li:last").attr("data-articleno");
		$.getJSON(TMON.wear.htAPI.getDealInquiryList.replace("{dealNo}", this.sDealNo).replace("{articleNo}", sLastArticleNo), $.proxy(this.cbGetList, this));
		return false;
	},

	cbGetList : function(res){
		if(!res.data.articles || res.data.articles.length == 0){
			this.welMoreWrap.hide();
			return;
		}

		$(this.tplItem({
			aItems : res.data,
			sLoginId : this.sLoginId
		})).appendTo(this.welListContainer);
	},

	onSubmitWrite : function(){
		var sText = this.welText.val();
		if(!sText){
			alert("작성된 글이 없습니다.");
			return;
		}

		$.ajax({
			type : 'POST',
			dataType: 'json',
			url : TMON.wear.htAPI.writeInquiry.replace("{dealNo}", this.sDealNo),
			data : {content : sText},
			success : $.proxy(this.cbWrite, this)
		});

		return false;
	},

	cbWrite : function(res){
		if(res.data.errorMessage){
			alert(res.data.errorMessage);
			return;
		}

		if(res.data.isSuccess == true){
			alert("작성하신 상품문의가 등록되었습니다.");
			if(window.location.hash){
				window.location.hash = "";
			}

			if(TMON.view_mode == "app"){
				setTimeout(function(){
					window.location.reload();
				}, 2000);
			}else{
				window.location.reload();
			}
			return;
		}

		if(res.data.status == "ForbiddenWord"){ // 금칙어가 있을 경우
			alert(res.data.data.join(", ") + "는 사용하실 수 없는 단어입니다.");
			return;
		}

		alert("글이 등록되지 않았습니다.\n잠시 후 다시 시도해주세요.");
	},

	deleteItem : function(e){
		if(confirm("삭제하시겠습니까?") == false){
			return false;
		}

		var sArticleNo = $(e.currentTarget).parents("li:first").attr("data-articleno");

		$.ajax({
			type : 'DELETE',
			dataType: 'json',
			url : TMON.wear.htAPI.deleteInquiry.replace("{dealNo}", this.sDealNo).replace("{articleNo}", sArticleNo),
			success : $.proxy(this.cbDelete, this)
		});

		return false;
	},

	cbDelete : function(res){
		if(res.data.errorMessage){
			alert(res.data.errorMessage);
			return;
		}

		if(res.data.isSuccess == true){
			alert("삭제되었습니다.");

			if(TMON.view_mode == "app"){
				setTimeout(function(){
					window.location.reload();
				}, 2000);
			}else{
				window.location.reload();
			}
			return;
		}

		alert("삭제되지 않았습니다.\n잠시 후 다시 시도해주세요.");
	}
};