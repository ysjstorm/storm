/**
 * 1:1 문의하기 쓰기, 수정
 * @param sMode 현재 쓰기 인지 수정인지? "/qna/write", "/qna/edit"
 */

var writeInquiry = function(htQna){
    this.init(htQna);
};

writeInquiry.prototype = {
    MAX_COUNT_UPLOAD_IMAGE : 3, // 최대 업로드 개수
    aDeletedImages : [], // 삭제된 이미지
    nOpenedAnswerSerial : 0,
    bIsSavingNow : false, // 현재 등록중인지, 등록중일 경우 등록(또는 수정)버튼이 눌리지 않게 한다.

    init : function(htQna){
        this.sCurrentMode = htQna.sMode;
        this.cacheElement();
        this.setEvent();
        this.sCurrentMode == "/qna/write" ? this.getMyGoodsList() : null;
        this.setTemplate();
        this.initImageUploadLoading();
        // write 진입시 메인카테고리와 서브카테고리가 정해져서 들어오는 경우 해당 카테고리에 맞게 문의유형을 변환시켜주어야 함_MCI-88
        if(this.sCurrentMode == "/qna/write" && htQna.category1Value != null && htQna.category2Value != null){
            this.setMainCategory(htQna);
        }
    },

    cacheElement : function(){
        this.welTitle = $("#_inTitle");
        this.welCategory1 = $("#_selCategory1");
        this.welListCate2 = $("#_listCategory2").find("select");
        this.welCategory2 = this.welListCate2.eq(0);
        this.welContent = $("#_inContent");
        this.welGoodsList = $("#_goodsList"); // 구매한 상품 리스트 
        this.welMainBuySrl = $("#_mainBuySrl");
        this.welRelatedFAQList = $("#_relatedFAQList");
        this.welInputFile = $("#_inputFile");
        this.welUploadForm = $("#_imageUploadForm");
        this.welImageList = $("#_imgList");
        this.welBtnCancelWrite = $("#_cancelWrite");
        this.welUploadImageLoading = $("#_uploadImageLoding");
        this.welUploadBtnArea = $("#_uploadBtnArea");
    },

    setEvent : function(){
        this.welCategory1.change($.proxy(this.onChangeCategory1, this));
        $("#_saveInquiry").click($.proxy(this.saveInquiry, this)); // 등록
        this.welListCate2.change($.proxy(this.getRelatedFAQ, this)); // 자주묻는 연관있는 질문 가져오기
        this.welRelatedFAQList.on("click", "dt a", $.proxy(this.getFAQAnswer, this));
        this.welInputFile.click($.proxy(this.onClickUploadImage, this));
        this.welInputFile.change($.proxy(this.uploadFile, this));
        this.welBtnCancelWrite.click($.proxy(this.onCancelWrite, this)); // 1:1 문의 쓰기 취소
        this.welGoodsList.change($.proxy(this.getMainBuySrl, this));
        
        // DOUPLOADIMAGE ajax 이미지 업로드 셋업
        this.welUploadForm.ajaxForm({
            cache : false,
            processData : false,
            contentType : false,
            crossDomain : true,
            success : $.proxy(this.cbUpload, this),
            error : $.proxy(function(err){
                this.hideUploadImageLoading();
                alert("파일 업로드를 할 수 없습니다. 잠시 후 다시 시도해 주세요.");
            }, this)
        });

        this.welImageList.on("click", "a", $.proxy(this.removeImage, this)); // 첨부파일 삭제

        // 연관있는 질문의 답변에 링크가 있으면 동작이 안되게 한다.
        this.welRelatedFAQList.on("click", "dd .info a", function(){return false;});

        // 수정
        $("#_saveEdit").click($.proxy(this.saveEdit, this)); // 수정 버튼
        $("#_cancelEdit").click($.proxy(this.cancelEdit, this)); // 취소 버튼

    },

    /**
     * 1:1 문의 쓰기 취소
     */
    onCancelWrite : function(){
        if(confirm("문의 글을 등록하시지 않으시겠습니까?")){
            location.href = this.welBtnCancelWrite.attr("data-redirect");
        }
    },

    /**
     * 1:1 문의 수정 때 이미 업로드된 이미지 리스트 가져온다.
     */
    getUploadedImages : function(){
        var _aUploadedImages = [];
        this.welImageList.find("a").each(function(){
            _aUploadedImages.push($(this).attr("data-org"));
        });
        return _aUploadedImages;
    },

    onChangeCategory1 : function(e){
        var sVal = this.welCategory1.val();
        for(var i = 0, max = this.welListCate2.length; i<max ; i++){
            if(this.welListCate2.eq(i).attr("data-parentsrl") == sVal){
                this.welListCate2.hide();
                this.welCategory2 = this.welListCate2.eq(i).show();
                break;
            }
        }
    },

    setMainCategory: function(htQna){
        var mainCategoryVal = htQna.category1Value,
            subCategoryVal = htQna.category2Value;
        this.welCategory1.val(mainCategoryVal);
        this.onChangeCategory1();
        this.welCategory2.val(subCategoryVal);
        this.getRelatedFAQ(subCategoryVal);
    },

    setTemplate : function(){
        $.template("relatedFaq",
                '<dt><a href="#" data-serial="${srl}"><i class="ico">Q</i>${title}<i class="sp_cs"></i></a></dt>' +
                '<dd>' +
                '<div class="info"></div>' +
                '</dd>'
        );

        $.template("inquiryUploadedImage",
                '<li><a href="#" style="background-image:url(${sThumbnail})" data-org="${sOriginalImage}"><i class="ico_del"></i></a></li>'
        );
    },

    getFAQAnswer : function(e){
        this.welClickedTarget = $(e.target);
        if(this.welCurrentAnswer && this.nOpenedAnswerSerial == this.welClickedTarget.attr("data-serial")){
            this.welCurrentAnswer.slideUp();
            this.nOpenedAnswerSerial = 0;
            return false;
        }

        this.nOpenedAnswerSerial = this.welClickedTarget.attr("data-serial");
        $.getJSON('/api/m/faq/contents/' + this.nOpenedAnswerSerial, {}, $.proxy(this.cbGetFAQAnswer, this));
        return false;
    },

    cbGetFAQAnswer : function(res){
        var welAnswer = this.welClickedTarget.parents("dt").next();
        welAnswer.find(".info").html(res.data.faqNew.contents);
        if(this.welCurrentAnswer){
            this.welCurrentAnswer.slideUp();
        }
        this.welCurrentAnswer = welAnswer.slideDown();
    },

    /**
     * 구입한 상품 리스트를 가져온다.
     */
    getMyGoodsList : function(){
        $.getJSON("/api/m/qna/buyinggoods/my", $.proxy(this.cbGetMyGoodsList, this));
    },

    cbGetMyGoodsList : function(res){
        var aItems = res.data;
        var sHtmls = '<option value="-1">선택해주세요</option>';
        for(var i = 0, max = aItems.length; i<max ; i++){
            sHtmls += '<option value ="' + aItems[i].dealSrl + '" data-mainsrl="'+ aItems[i].mainBuySrl +'">' + aItems[i].title + '</option>';
        }
        this.welGoodsList.html(sHtmls);
    },
    
    /**
     * 구입한 상품 리스트에서 주문번호를 뽑아 hidden타입 input의 값으로 넘긴다.
     */
    getMainBuySrl : function(e){
    	var target = $(e.target),
    		sMainBuySrl = target.find("option:selected").attr("data-mainsrl");
    	this.welMainBuySrl.val(sMainBuySrl);
    },

    /**
     * 1:1 문의 수정
     */
    saveEdit : function(){
        if(!this.validateEdit() || this.bIsSavingNow){
            this.bIsSavingNow && alert("등하는 중입니다.");
            return false;
        }

        this.bIsSavingNow = true;
        jQuery.ajaxSettings.traditional = true; //Setting for array of image list
        $.ajax({
            url : "/api/m/qna/qnas/" + $("#_saveEdit").attr("data-qnano"),
            type : "POST",
            data : {
                title : this.welTitle.val(),
                content : this.welContent.val(),
                images : this.getUploadedImages(),
                imagesToDelete : this.aDeletedImages
            }
        }).done($.proxy(this.cbEditInquiry, this));

        return false;
    },

    cbEditInquiry : function(res){
        this.bIsSavingNow = false;

        if(res.data.result == true){
            location.href = TMON.util.attachQuerySting(res.data.redirectTo);
        }else{
            alert(res.data.errorMsg || "수정에 실패하였습니다. 잠시후 다시 시도해주세요.");
        }
    },

    /**
     * 1:1문의 수정 전에 validation
     * @returns {boolean}
     */
    validateEdit : function(){
        if(!this.welTitle.val()){
            alert("문의제목을 입력해 주세요.");
            this.welTitle.focus();
            return false;
        }else if(this.welGoodsList.val() == "0"){
            alert("상품을 선택해 주세요.");
            this.welGoodsList.focus();
            return false;
        }else if(!this.welContent.val()){
            alert("문의내용을 입력해 주세요.");
            this.welContent.focus();
            return false;
        }
        return true;
    },

    /**
     * 1:1 문의 등록
     */
    saveInquiry : function(){
        if(!this.validate() || this.bIsSavingNow){
            this.bIsSavingNow && alert("등록하는 중입니다.");
            return false;
        }

        this.bIsSavingNow = true;
        jQuery.ajaxSettings.traditional = true; //Setting for array of image list
        $.post("/api/m/qna/qnas", {
            title : this.welTitle.val(),
            deal : "deal." + this.welGoodsList.val(),
            mainBuySrl: this.welMainBuySrl.val(),
            category1 : this.welCategory1.val(),
            category2 : this.welCategory2.val(),
            content : this.welContent.val(),
            images : this.getUploadedImages(),
            imagesToDelete : this.aDeletedImages,
            dealType : "",
            dealId : ""
        }, $.proxy(this.cbSaveInquiry, this));

        return false;
    },

    cbSaveInquiry : function(res){
        this.bIsSavingNow = false;
        if(res.data.result == true){
            location.href = TMON.util.attachQuerySting(res.data.redirectTo);
        }else{
            alert(res.data.errorMsg || "작성에 실패하였습니다. 잠시후 다시 시도해주세요.");
        }
    },

    /**
     * 1:1문의 등록 전에 validation
     * @returns {boolean}
     */
    validate : function(){
        if(!this.welTitle.val()){
            alert("문의제목을 입력해 주세요.");
            this.welTitle.focus();
            return false;
        }else if(this.welCategory1.val() == "0"){
            alert("문의유형을 선택해 주세요.");
            this.welCategory1.focus();
            return false;
        }else if(this.welCategory2.val() == "0"){
            alert("문의유형을 선택해 주세요.");
            this.welCategory2.focus();
            return false;
        }else if(this.welGoodsList.val() == "-1"){
            alert("상품을 선택해 주세요.");
            this.welGoodsList.focus();
            return false;
        }else if(!this.welContent.val()){
            alert("문의내용을 입력해 주세요.");
            this.welContent.focus();
            return false;
        }
        return true;
    },

    /**
     * 자주묻는 연관있는 질문 가져오기
     */
    getRelatedFAQ : function(){
        $.getJSON("/api/m/faq/faqs",{subcode : this.welCategory2.val()}, $.proxy(this.cbGetRelatedFAQ, this));
    },

    cbGetRelatedFAQ : function(res){
        var aItems = res.data;
        this.welRelatedFAQList.empty();
        for(var i = 0, max = aItems.length; i<max ; i++){
            $.tmpl("relatedFaq", aItems[i]).appendTo(this.welRelatedFAQList);
        }

    },

    onClickUploadImage : function(){
        if(this.welImageList.find("a").length >= 3){
            alert("최대 3개까지 업로드 가능합니다.");
            return false;
        }

        // Android 앱 일 경우 앱의 함수를 호출하여 갤러리를 불러온다.
        if(TMON.app_os == "ad"){
            this.showUploadImageLoading();
            TMON.app.callApp("upload", "uploadImage", "TMON.mytmon.oWriteInquiry.cbUploadImageFromApp");
            return false;
        }
    },

    cbUploadImageFromApp : function(sRes){
        var htData = JSON.parse(sRes);
        this.cbUpload(htData);
    },

    uploadFile : function(){
        this.showUploadImageLoading();
        // DOUPLOADIMAGE 이미지 업로드 시작
        this.welUploadForm.submit();
        return;
    },

    cbUpload : function(res){
        this.hideUploadImageLoading();
        
        if(res == null){
            alert("파일 업로드를 할 수 없습니다. 잠시 후 다시 시도해 주세요.");
            return;
        }
        
        var res = res;
        
        /**
         * IE10 이하에서 request header의 컨텐츠 타입이 application/json 경우 response 데이터를 다운드하는 이슈.
         * 해당 환경에서는 text/html 타입으로 내려받고 json으로 파싱하여 사용
         */
        if(typeof res === "string"){
            res = $.parseJSON(res);
        }
        
        if(res.data.result == false){
            alert(res.data.errorMsg);
            this.welUploadForm.get(0).reset();
            return false;
        }

        $.tmpl("inquiryUploadedImage", {
            sOriginalImage : res.data.originalImageUrl,
            sThumbnail : res.data.thumbnailImageUrl
        }).appendTo(this.welImageList);

        this.welUploadForm.get(0).reset();
    },

    /**
     * 첨부 이미지 삭제
     * @param e
     * @returns {boolean}
     */
    removeImage : function(e){
        if(!confirm("첨부 파일을 삭제하시겠습니까?")){
            return false;
        }

        var welRemoveImage = $(e.currentTarget);
        var sRemoveImageUrl = welRemoveImage.attr("data-org");

        // 서버에서 삭제할 이미지를 정장해 둔다.
        this.aDeletedImages.push(sRemoveImageUrl);
        welRemoveImage.parents("li").remove();

        return false;
    },

    cancelEdit : function(e){
        if(!confirm("수정을 취소하시겠습니까?")){
            return false;
        }
        location.href = $(e.target).attr("data-redirect");
    },

    initImageUploadLoading : function(){
        var opts = {
            lines: 13, // The number of lines to draw
            length: 6, // The length of each line
            width: 3, // The line thickness
            radius: 4, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        };

        var spinner = new Spinner(opts).spin(this.welUploadImageLoading.get(0));
    },

    showUploadImageLoading : function(){
        this.welUploadImageLoading.show();
        this.welUploadBtnArea.hide();
    },

    hideUploadImageLoading : function(){
        this.welUploadImageLoading.hide();
        this.welUploadBtnArea.show();
    }

};

