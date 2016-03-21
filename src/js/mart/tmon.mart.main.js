/**
 * 생필품 메인
 *
 * *로드 순서
 * 1. hash에 3depth 카테고리 값이 있을 경우 (ex #123456)
 *      -> 3depth 카테고리 값이을 버튼에 넣음(selected)
 *      -> 3depth 카테고리의 자식을 가져와서 4depth 리스트에 채워줌
 *      -> 3depth 카테고리 값으로 데이터를 가져와 뿌려줌
 * 2. hash에 3, 4depth 카테고리 값이 둘다 있을 경우 (ex #123456/98765)
 *      -> 3depth 카테고리 값이을 버튼에 넣음(selected)
 *      -> 3depth 카테고리 값으로 자식을 가져와서 4depth 리스트에 뿌려준 후 4depth값을 버튼에 넣음(selected)
 *      -> 4depth 카테고리 값으로 데이터를 가져와 뿌려줌
 * 3. hash값이 없을 경우
 *      -> java에서 넘겨준 카테고리 값으로 데이터를 뿌려줌
 *
 *  현재 페이지 sCurrentPage. 카테고리(생식육) : /mart/category , BEST : /mart/best , 자주산 : /mart/freq , 기획전 : /mart/plan , 슈퍼픽 : /mart/pick
 */

var martMain = function(htOption){
    this.init(htOption);
};

martMain.prototype = {
    aDealNumber : [], // 현재 page의 category 번호에 맞는 deal 리스트 번호를 모두 가져와 저장해둔다.

    init : function(htOption){
        this.htOption = htOption;
        this.oDealAction = new martDealAction(this.htOption.sCurrentPage);
        this.cacheElement();
        this.setEvent();
        this.initPage(this.htOption.sCurrentPage);
        this.openFavoriteCategory();
    },

    /**
     * 페이지별 필요한 함수를 호출한다.
     * @param sPage
     */
    initPage : function(sPage){
        switch(sPage){
            case "/mart/category" : // 생활,식품,육아 페이지
                this.initCategory();
                // 생,식,육 페이지 접속시에는 페이지 카운팅을해서 자주 들어간 카테고리를 우선으로 열어준다.
                this.increaseCategoryEnterCount(this.htOption.sCategoryNo);
                break;

            case "/mart/best" : // BEST 페이지
                this.initBest();
                this.initMartBanner();
                this.initPlanBanner();
                break;

            case "/mart/pick" : // 슈퍼픽 페이지
                this.initSuperpick();
                break;

            case "/mart/freq" : // 자주산상품 페이지
                this.initFreq();
                break;

            default :
                break;
        }
    },

    cacheElement : function(){
        this.welBtnShowCategoryList = $("#_btnShowCategoryList"); // 카테고리 리스트 보이기 버튼, 최상단에 위치
        this.welCateListLayer = $("#_dropdown"); // 카테고리 리스트
        this.welCateListBtn = this.welCateListLayer.find("div[data-role='categoryHeading']"); // 카테고리 리스트 안에 드랍다운 버튼
    },

    setEvent : function(){
        this.welBtnShowCategoryList.click($.proxy(this.onClickShowCateList, this));
        this.welCateListLayer.on("click", "a", $.proxy(this.onClickShowCateList, this));
        this.welCateListBtn.click($.proxy(this.onClickCateListBtn, this));
    },

    /**
     * 카테고리 리스트를 토글한다.
     */
    onClickShowCateList : function(){
        this.welBtnShowCategoryList.toggleClass("open");
        this.welCateListLayer.toggleClass("hide");
    },

    /**
     * 카테고리 리스트 dropdown메뉴를 열어준다.
     * @param e
     */
    onClickCateListBtn : function(e){
        var welTarget = $(e.currentTarget);

        if(welTarget.hasClass("selected")){ // 열려있는 리스트의 경우 닫아준다.
            welTarget.removeClass("selected");
        }else{
            this.welCateListBtn.removeClass("selected");
            welTarget.addClass("selected");
        }
    },

    /**
     * 슈퍼픽 타이머, 메인페이지와 슈퍼픽 페이지에서 노출되는 타이머.
     * // TODO :: 타이머가 없어짐, 추후 제거 예정
     */
    initSuperpickTimer : function(wfnCallback){
        var aTimeLeft = this.welTime.html().split(":");
        var nTimeLeft = parseInt(aTimeLeft[0], 10) * 60 * 60 + parseInt(aTimeLeft[1], 10) * 60 + parseInt(aTimeLeft[2], 10);

        var getFormatedTime = function(nTime){
            var nHour = Math.floor(nTime / (60 * 60) );
            var nMin = Math.floor((nTime % (60 * 60)) / 60);
            var nSec = Math.floor((nTime % (60 * 60)) % 60);
            return nHour + ":" + (nMin <= 9 ? "0" + nMin : nMin) + ":" + (nSec <= 9 ? "0" + nSec : nSec);
        };

        var wfnOnInterval = $.proxy(function(){
            var sTimeLeft = getFormatedTime(--nTimeLeft);
            this.welTime.html(sTimeLeft);
            if(nTimeLeft <= 0){
                wfnCallback();
            }
        }, this);
        this.nSuperpickTimer = setInterval(wfnOnInterval , 1000);
    },

    /**
     * 자주산 상품 페이지
     */
    initFreq : function(){
        this.oFreq = new martFreq();
    },


    /**
     * 생활,식품,육아 중 가장 많이 방문한 카테고리 리스트를 open한다.
     */
    openFavoriteCategory : function(){
        //이미 서버에서 selected클래스가 추가되어 열어진 리스트가 있으면 그대로 둔다.
        if(this.welCateListLayer.find("div[data-role='categoryHeading'].selected").length > 0){
            return false;
        }

        var ENTER_CRITIAL_POINT = 5; // 5회 입장 이상의 경우만 적용

        // 각 카테고리 페이지 중에서 최대 입장 수를 가져온다.
        var nMaxCounter = 0;
        var sMaxCateNo = 0;
        for(var i= 0, max = this.welCateListBtn.length; i<max ; i++ ){
            var sCateNo = this.welCateListBtn.eq(i).attr("data-catno");
            var nCount = this.getCategoryEnterCount(sCateNo);
            if(nCount > nMaxCounter){
                sMaxCateNo = sCateNo;
                nMaxCounter = nCount;
            }
        }

        this.welCateListBtn.eq(0).addClass("selected"); // 가장 처음에 위치한 "마트_생활"을 default로 열어준다.
        if(nMaxCounter < ENTER_CRITIAL_POINT){  // 회수가 너무 적을 경우 default값 유지
            return;
        }

        this.welCateListBtn.removeClass("selected");
        this.welCateListLayer.find("div[data-catno=" + sMaxCateNo + "]").addClass("selected");
    },


    getCategoryEnterCount : function(sCategoryNo){
        var sCounter = TMON.util.getCookie("CATEGORY_ENTER_COUNTER_" + sCategoryNo);
        return sCounter ? parseInt(sCounter, 10) : 0;
    },

    /**
     * 마트일 경우만 현재 페이지의 입장 회수를 저장한다.
     * "CATEGORY_ENTER_COUNTER_카테고리넘버" 이름으로 쿠키에 카운터를 저장한다.
     */
    increaseCategoryEnterCount : function(sCategoryNo){
        var nCounter = this.getCategoryEnterCount(sCategoryNo);
        TMON.util.setCookie("CATEGORY_ENTER_COUNTER_" + sCategoryNo, nCounter + 1, {path : '/', expires : 0});
    },

    /**
     * 생활, 식품, 육아 페이지(=카테고리 페이지) init
     */
    initCategory : function(){
        $(window).hashchange($.proxy(function(){this.getDataWithHash();}, this));
        this.oDealList = new martDealList(this);
        this.oArrowNavi = new martArrowNavi();

        var sHash = TMON.util.getHash();
        // 해쉬 값이 있는 경우 해쉬값의 카테고리 넘버로 데이터를 가져온다.
        if(sHash){
            this.checkIsOldCategoryNumber();
            return;
        }

        // 해쉬 값이 없으면 java에서 넘겨준 카테고리 넘버로 데이터를 가져온다.
        this.oDealList.getDealNumber(this.htOption.sCategoryNo);
        // 생활, 식품, 육아 페이지(=카테고리 페이지)의 경우에 베너 리스트를 AJAX로 불러온다.
        this.oDealList.loadBanner(this.htOption.sCategoryNo);
    },

    /**
     * BEST 페이지 init
     */
    initBest : function(){
        this.oDealList = new martDealList(this);
        this.oDealList.getDealNumber(this.htOption.sCategoryNo);
        this.welTime = $("#_superpickTimer"); // 오늘만 이가격 남은 시간

        // 슈퍼픽 타이머 종료후 실행 함수
        var wfnLoadNextSuperPick = $.proxy(function(){
            clearInterval(this.nSuperpickTimer);
        }, this);

        // TODO :: 타이머가 없어짐, 추후 제거 예정
        if(this.welTime.length > 0){
            this.initSuperpickTimer(wfnLoadNextSuperPick);
        }
    },

    /**
     * 슈퍼픽 페이지 init
     */
    initSuperpick : function(){
        this.welTime = $("#_superpickTimer"); // 오늘만 이가격 남은 시간

        // 슈퍼픽 타이머 종료후 실행 함수
        var wfnLoadNextSuperPick = $.proxy(function(){
            clearInterval(this.nSuperpickTimer);
        }, this);

        // TODO :: 타이머가 없어짐, 추후 제거 예정
        if(this.welTime.length > 0){
            this.initSuperpickTimer(wfnLoadNextSuperPick);
        }
    },

    /**
     * 해쉬로 넘어온 카테고리 번호가 예전 카테고리 번호이면, 신카테고리 번호를 가져와야한다.
     */
    checkIsOldCategoryNumber : function(){
        var sHash = TMON.util.getHash();
        var sCategory3depth = sHash;
        var sCategory4depth = null;

        if(sHash.indexOf("/")>=0){ // 4depth 해쉬 값이 있을 경우
            sCategory3depth = sHash.substring(0, sHash.indexOf("/"));
            sCategory4depth = sHash.substring(sHash.indexOf("/")+1);
        }

        if(sCategory3depth.length > 6){ // 카테고리가 6자리인경우 예전 카테고리 번호이다.
            this.getDataWithHash(); // 신카테고리인 경우
            return;
        }

        // 구카테고리의 경우 신카테고리 번호를 받아온다.
        if(sCategory4depth){ // 4depth 카테고리가 있을 경우 두 카테고리 모두 가져온다.
            var oAjax1 = $.getJSON(TMON.htAPI.htMart.getNewCategoryNo.replace("{catNo}", sCategory3depth));
            var oAjax2 = $.getJSON(TMON.htAPI.htMart.getNewCategoryNo.replace("{catNo}", sCategory4depth));
            $.when(oAjax1, oAjax2).done($.proxy(function(aRes3Depth, aRes4Depth){
                this.getDataWithHash(aRes3Depth[0].data.newCategoryNo, aRes4Depth[0].data.newCategoryNo)
            }, this));
            return;
        }

        // 3depth 카테고리 번호만 있을 경우
        $.getJSON(TMON.htAPI.htMart.getNewCategoryNo.replace("{catNo}", sCategory3depth), $.proxy(function(res){
            this.getDataWithHash(res.data.newCategoryNo, null);
        }, this));

    },

    /**
     * 해쉬값(=카테고리 번호)로 데이터를 불러온다.
     */
    getDataWithHash : function(s3Depth, s4Depth){
        var sHash = TMON.util.getHash();
        var sCategory3depth = sHash || this.htOption.sCategoryNo; // hash값이 있는 페이지에서 뒤로가기 -> Hash값이 없는 페이지로 이동했을때 hashchange이벤트 발생하면 값이 없는 상태로 된다. 이때 전달받은 카테고리 값을 사용한다.
        var sCategory4depth = null;

        if(s3Depth){ // 구카테고리값이 들어와 신카테고리값으로 변환 된 경우
            sCategory3depth = s3Depth;
            sCategory4depth = s4Depth;
        }else if(sHash.indexOf("/")>=0){ // 4depth 해쉬 값이 있을 경우
            sCategory3depth = sHash.substring(0, sHash.indexOf("/"));
            sCategory4depth = sHash.substring(sHash.indexOf("/")+1);
        }

        // 선택된 카테고리에 해당하는 상단 메뉴도 선택되게 수정
        this.welCateListLayer.find("li").removeClass("selected");
        this.welCateListLayer.find("li[data-category='"+ sCategory3depth +"']").addClass("selected");

        this.oArrowNavi.setCategoryNumber(sCategory3depth, sCategory4depth);
        this.oDealList.getDealNumber(sCategory4depth || sCategory3depth); // 4depth category값이 없으면 3depth 값으로 데이터를 가져온다.
        this.oDealList.loadBanner(sCategory4depth || sCategory3depth);
    },

    /**
     * 상단 마트 베너 롤링
     */
    initMartBanner : function(){
        var bRoll = $("#_martBanner").find("li").length > 1 ? true : false;

        $("#_martBanner").tmonSlider(
            {
                flexible : true,
                roll : bRoll,
                view : 1,
                speed : 300,
                autoPaging : true
            });
    },

    /**
     * 중간쯤의 베너 롤링
     */
    initPlanBanner : function(){
        var bRoll = $("#_planBanner").find("li").length > 1 ? true : false;
        var welPager = $("#_planBannerPager");

        $("#_planBanner").tmonSlider(
            {
                flexible : true,
                roll : bRoll,
                view : 1,
                speed : 300,
                autoPaging : true,
                counter : function (e)
                {
                    welPager.find(".current").text(e.current);
                    welPager.find(".total").text(e.total);
                }
            });
    },

    /**
     * 딜리스트 AJAX Call이 완료되었을때 dealList함수에서 호출된다.
     */
    onLoadDealListComplete : function(){
        // 딜 리스트가 불려 왔을 경우 해당 딜 중에 안내 레이어를 띄워야 할 경우가 있으면 띄워주기 위해 사용
        this.oDealAction.showCartHelpLayer();
        this.oDealAction.showHelpLayer();
        this.oDealAction.showHelpOptionDeal();
        this.oDealAction.showHelpDetailPage();
    }
};
