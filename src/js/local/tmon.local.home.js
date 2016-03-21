/**
 * 지역 리스트 홈 페이지
 */
var localHome = function(htOptions){
    $.extend(this, htOptions);
    this.init();
};

localHome.prototype = {
    GPS_ON_USABLE : 0,
    GPS_ON_UNUSABLE : 1,
    GPS_ON_NO_PERMISSION : 2,
    GPS_OFF_YES_PERMISSION : 3,
    GPS_OFF_NO_PERMISSION : 4,

    COLLECTION_URL : 1,
    COLLECTION_DEAL : 3,
    COLLECTION_LIST : 4,
    COLLECTION_EXHIBITION_NO : 5,

    LAST_SELECTED_BIZCATEGORY_COOKIENAME : "lastBizCategory",

    sLocalDealSortType : "POPULAR", // 지역딜 소팅 [POPULAR, DATE]  = [추천순, 최신순]
    sNearDealSortType : "distance", // "date":날짜순, "distance" : 거리순, "popularity":인기순

    init : function(){
        this.oLocation = new localHomeLocation({oHome : this});
        this.oDealList = new localDealList({oHome : this});
        this.oLocalStorage = new locationStorage({oHome : this});

        this.cacheElement();
        this.setEvent();
        this.setTemplate();
        this.initPage();
    },

    /**
     * 조건에 따라 페이지를 init 한다.
     */
    initPage : function(){
        var nLastViewedLocalCategory = this.oLocalStorage.getLastLocationInfo("nCatNo"),
            sLastViewedLocalName = this.oLocalStorage.getLastLocationInfo("sLocName");

        var htLastViewedCategoryInfo = this.oLocalStorage.getCategforyInfo();

        // 이전의 선택한 부모 biz 카테고리 번호가 있으면 사용한다.
        if(htLastViewedCategoryInfo && htLastViewedCategoryInfo.nBizCatNo){
            this.nParentBizCategoryNo = htLastViewedCategoryInfo.nBizCatNo;
            this.showInitParentCategoryName(this.nParentBizCategoryNo);
        }else{
            this.nParentBizCategoryNo = parseInt(this.nBizCategoryNo, 10);
        }

        // Sub Biz Category는 일단 막아둠
        // 이전의 선택한 Sub biz 카테고리 번호가 있으면 사용한다.
        //if(htLastViewedCategoryInfo && htLastViewedCategoryInfo.nBizDetailNo){
        //    this.oDealList.setLastBizCategory(htLastViewedCategoryInfo.nBizDetailNo)
        //}

        if(this.nCategoryNo){ // 지역 선택 후 진입 한 경우, 해당 지역 딜 로딩
            window.gaSendEvent('localGPS', 'pageshow', { 'dimension7' : this.nCategoryNo});
            this.oLocalStorage.saveLastLocation({sLocationName : this.welAddress.text(), sCatNo : this.nCategoryNo});
            this.oDealList.getDealWithCategory(this.nCategoryNo, this.nParentBizCategoryNo, this.sLocalDealSortType, 0,false);
        }else if(nLastViewedLocalCategory){ // 마지막에 본 지역이 있을 경우, 해당 지역 딜 로딩
            this.oLocation.setLastLocationName(sLastViewedLocalName);
            this.oDealList.getDealWithCategory(nLastViewedLocalCategory, this.nParentBizCategoryNo, this.sLocalDealSortType, 0, false);
        }else if(TMON.view_mode == "app"){ // 앱에서 진입 한 경우, app으로 GPS 신호를 요청한다.
            this.updateGPSLocationOnApp();
        }else{ // 일반적인 web 접속 일 경우, navigator로 GPS 좌표를 가져온다.
            this.updateGPSLocationOnWeb();
        }

        this.initSortBtn();
    },

    /**
     * 첫 로딩시 이전에 선택했던 카테고리 이름을 보여준다.
     */
    showInitParentCategoryName : function(nParentCategory){
        this.wel1stSubMenu.find("button").removeClass("on");
        var sName = this.wel1stSubMenu.find("button[data-bizno=" + nParentCategory + "]").addClass("on").text();
        this.welBtnFirstSubMenu.text(sName);
    },

    /**
     * Element Caching
     */
    cacheElement : function(){
        this.welAddress = $("#_positionAddress");                                                       // 메인 주소 필드
        this.welBtnSelectLoc = $("#_selectLoc");                                                        // 메인 "지역선택" 팝업 버튼
        this.welBtnMyLoc = $("#_myLoc");                                                                // 메인 "내주변" 버튼

        this.welBtnFirstSubMenu = $("#submenu1dp");                                                    // 메인 "업종카테고리" 메뉴 버튼
        this.welTooltip = $(".tooltip");                                                                // 메인 "업종카테고리" 메뉴 툴팁
        this.welBtnSort = $("#_btnSort");                                                               // 메인 "정렬" 버튼

        this.wel1stSubMenu = $("#_sub_1dp");                                                            // 상위 업종카테고리 메뉴
        this.welSubMenu = $("#_sub_2dp");                                                               // 세부 업종카데고리 메뉴

        this.welSortPopup = $("#_ly_sort");                                                             // "정렬" 팝업
        this.welFavoritePopup = $("#_ly_favorite");                                                     // "지역선택" 팝업
        this.welSubMenuBackground = $(".submenu_bg");                                                   // 상위 업종 카테고리 메뉴 외 BG

        /* 현 상태를 알려주는 메시지 알림 Tag */
        this.welNoDealStatus = $("#_noDealStatus");

        this.welGPSOff = $("#_gpsOff");
        this.welGPSOffWEB = $("#_gpsOffForWeb");
        this.welGPSOnUnusable = $("#_gpsOnUnusable");
        this.welGPSOnServiceOff = $("#_gspOnServiceOff");
        this.welGPSOffForIPhone = $("#_gpsOffForIPhone");
        this.welGPSOffServiceOff = $("#_gspOffServiceOff");

        this.welLocServiceBtn = $("._setLocService");
        this.welLocAcessibilityBtn = $("._setLocAcessibility");


        this.welCollectionBanner = $("#_collection");                                                   // Collection Banner 리스트
        this.welADBanner = $("#_adBannerList");                                                         // AD Banner 리스트

        this.welBodyLayer = $("body");
        this.welWindoLayer =  $(window);
    },

    /**
     * 핸들바 Template를 사용하는 Element를 컴파일 한다.
     */
    setTemplate : function() {
        this.tplSubMenuList = Handlebars.compile($("#subMenuTemplate").html());                         // "노출" 카테고리 템플릿
        this.tplFavoriteMenuList = Handlebars.compile($("#lyFavoriteTemplate").html());                 // "지역선택" 팝업 템플릿
    },

    /**
     * Event 등
     */
    setEvent : function(){
        this.welBtnFirstSubMenu.click($.proxy(this.toggleSubMenuAction,this));                          // 메인 "업종" 카테고리 버튼 클릭
        this.wel1stSubMenu.on("click","li button", $.proxy(this.onClickSelectSub1dpMenuBtn,this));      // 메인 "업종 카테고리 메뉴" 버튼 클릭
        this.welSubMenuBackground.click($.proxy(this.toggleSubMenuAction,this));                        // 메인 "업종 카테고리 메뉴" 외 버튼 클릭

        this.welBtnMyLoc.click($.proxy(this.onUpdateLocation,this));                                    // "내주변" 버튼 클릭
        this.welBtnSort.click($.proxy(this.onClickSortBtn,this));                                       // "정렬" 버튼 클릭
        this.welBtnSelectLoc.click($.proxy(this.onClickSelectLocBtn,this));                             // "지역선택" 버튼 클릭

        this.welSubMenu.on("click", "li", $.proxy(this.onClickSubMenu, this));                          // 세부 업종 카테고리 메뉴 버튼 클릭

        this.welSortPopup.on("click","._sortItem",$.proxy(this.onClickSortMenuBtn,this));               // "정렬" 팝업 버튼 클릭
        this.welSortPopup.on("click",".bg",$.proxy(this.onClickBackGroundLayer,this));                  // "정렬" 팝업 외 클릭
        $("#_closeSort").click($.proxy(this.hideSortLayer, this));

        this.welFavoritePopup.on("click","button", $.proxy(this.onClickSelectLocMenuBtn,this));         // "지역선택" 팝업 버튼 클릭
        this.welFavoritePopup.on("click",".bg",$.proxy(this.onClickBackGroundLayer,this));              // "지역선택" 팝업 외 클릭
        $("#_lyFavoriteTemplate").on("click","a",$.proxy(this.onClickSelectLocationListBtn,this));
        $("#_btnOtherLocation").click($.proxy(this.onClickLocalSelect, this));                          // 다른 지역 보기 페이지 이동

        this.welCollectionBanner.on("click","a",$.proxy(this.onClickCollectionBtn, this));
        this.welADBanner.on("click", "a", $.proxy(this.onClickADBannerBtn, this));

        this.welGPSOff.find("a").click($.proxy(this.onMoveToAppGPSSetting, this));                      // "위치서비스설정하기"로 이동
        this.welGPSOffServiceOff.find("a").click($.proxy(this.onApplyGPSUseAndMoveToGPSSetting, this)); // 안드로드에서 위치정보 사용 승인 후 셋팅으로 이동
        this.welGPSOnServiceOff.find("a").click($.proxy(this.onApplyGPSUse, this));                     // 안드로드에서 위치정보 사용 승인

        this.welWindoLayer.on("pageshow",$.proxy(this.onPageShowEvent));                                // 페이지 전환 후, 발생하는 이벤트

        this.welLocServiceBtn.on("click", $.proxy(this.onClickLocServiceBtn,this));
        this.welLocAcessibilityBtn.on("click", $.proxy(this.onClickLocAcessibilityBtn,this));
    },

    onPageShowEvent : function (e) {
        if (TMON.bIsIos) {
            if(e.originalEvent && e.originalEvent.persisted) {
                window.location.reload();
            }
        }
    },

    onClickLocServiceBtn : function(e) {
        window.gaSendEvent('localGPS','click','gps_cfg_1');
    },

    onClickLocAcessibilityBtn : function(e) {
        window.gaSendEvent('localGPS','click','gps_cfg_2');
    },

    onClickLocalSelect : function(e){

        window.gaSendEvent('localGPS','click','preferencelocal_more');

        this.welBodyLayer.toggleClass("show-ly_favorite");
        if(TMON.view_mode == "app"){ // App 일 경우
            TMON.app.callApp("local", "showLocalSelection", e.currentTarget.href);
            return false;
        }

        return true;
    },

    /**
     * 안드로이드에서 위치정보 사용 승인
     */
    onApplyGPSUse : function(){
        TMON.app.callApp("local", "requestLocationAuthentication");
    },

    /**
     * 안드로이드에서 위치정보 사용 승인 후 GPS 셋팅으로 이동
     */
    onApplyGPSUseAndMoveToGPSSetting : function(){
        this.onApplyGPSUse();
        this.onMoveToAppGPSSetting();
    },

    onMoveToAppGPSSetting : function(){
        TMON.app.callApp("local", "moveToLocationSetting");
    },

    getDealListWithGPS : function(nLatitude, nLongitude){
        this.oDealList.getNearDeal(this.nParentBizCategoryNo, nLatitude, nLongitude);
    },

    hideSortLayer : function(){
        this.welBodyLayer.removeClass("show-ly_sort");
    },

    resetSort : function(){
        this.sLocalDealSortType = "POPULAR";
        this.sNearDealSortType = "distance";
        //this.welSortPopup.find("._sortItem").removeClass("selected").first().addClass("selected");
        this.initSortBtn();
    },

    /**
     * 지역선택 팝업 메뉴의 즐겨찾기 목록을 만들어 준다
     * */
    setFavoriteListMenu : function(){
        var aFavoriteLocation = this.oLocalStorage.getFavoriteLocations();

        if(aFavoriteLocation.length === 0) {
            return;
        }
        this.welFavoritePopup.find("li").remove();

        var aFavorList = [];
        for(var i=0; i<aFavoriteLocation.length; i++) {
            aFavorList.push({
                locationName : aFavoriteLocation[i][0],
                dataNo : aFavoriteLocation[i][1]
            });
        }
        $("#_favoriteListCount").text("("+aFavoriteLocation.length+")");
        this.welFavoritePopup.find("ul").html(this.tplFavoriteMenuList({
            aFavorList : aFavorList,
            uri : TMON.local.htUri,
            sAppQueryQ : TMON.local.htConnectEnvironment.sAppQueryQ,
            tl_preference_local : TMON.local.htTLCodeDictionary.tl_preference_local,
            tl_preference_cancel : TMON.local.htTLCodeDictionary.tl_preference_cancel
        }));
    },

    resetFavoriteListMenu : function() {
        this.oLocalStorage.resetFavoriteSelectedList();
        this.setFavoriteListMenu();
    },

    toggleSubMenuAction : function() {
        window.gaSendEvent('localGPS','click','local_category_btn');      // GA Code
        this.welBodyLayer.toggleClass("show_ly");
        this.welBtnFirstSubMenu.toggleClass("open");
        this.welTooltip.hide();
        $(".submenu_bg").toggle();
    },

    onClickSortBtn : function(e) {
        //this.welBtnFirstSubMenu.removeClass("open");

        window.gaSendEvent('localGPS','click','deal_sort');

        if(this.welBtnSort.hasClass("_dim")) {
            return;
        }
        this.welBodyLayer.toggleClass("show-ly_sort");
    },

    onClickSelectLocBtn : function(e) {
        window.gaSendEvent('localGPS','click','selectlocal');      // GA Code

        if(this.oLocalStorage.getFavoriteLocations().length > 0) {
            this.setFavoriteListMenu();
            this.welBodyLayer.toggleClass("show-ly_favorite");
            return;
        }
        var sHref = $("#_btnOtherLocation").attr("href");

        if(TMON.view_mode == "app"){ // App 일 경우
            TMON.app.callApp("local", "showLocalSelection", sHref);
            return false;
        } else {
            location.href=sHref;
        }
    },

    /**
     * 정렬 팝업 버튼 event
     * */
    onClickSortMenuBtn : function(e){
        var welTarget = $(e.currentTarget),
            nTargetIdx = welTarget.attr("tl:ord"),
            sLocalSort = welTarget.attr("data-localsort"), // 지역선택 딜리스트시에 소팅 이름
            sNearSort = welTarget.attr("data-nearsort"); // 내주변 딜리스트시에 소팅 이름


        window.gaSendEvent('localGPS','click','deal_sort_'+nTargetIdx);

        if(welTarget.hasClass("selected")){
            this.welBodyLayer.removeClass("show-ly_sort");
            return false;
        }

        this.welSortPopup.find("._sortItem").removeClass("selected");
        welTarget.addClass("selected");
        this.welBtnSort.text(welTarget.text());

        this.oDealList.reset();

        if(this.oDealList.getCurrentDealListType() == "LOCAL_DEAL") { // 지역선택 딜리스트
            this.oDealList.getDealWithCategory(null, null, sLocalSort, 0, true);
        }else if(this.oDealList.getCurrentDealListType() == "NEAR_DEAL"){ // 내주변 딜리스트
            this.oDealList.sortDeal(sNearSort);
        }

        this.hideSortLayer();
    },

    initSortBtn : function() {
        // MWP-6620
        var welSortBtn = null, nLastViewedLocalCategory = this.oLocalStorage.getLastLocationInfo("nCatNo");

        this.welSortPopup.find("._sortItem").removeClass("selected");
        // 내주변 버튼 -> 마지막 지역 삭젝 -> 거리순
        if((this.nCategoryNo && nLastViewedLocalCategory) || nLastViewedLocalCategory){
            this.welSortPopup.find(".sort-by-distance").hide();
            welSortBtn = this.welSortPopup.find(".sort-by-recommend");
        } else {
            this.welSortPopup.find(".sort-by-distance").show();
            welSortBtn = this.welSortPopup.find("._sortItem:first");
        }
        welSortBtn.addClass("selected");
        this.welBtnSort.text(welSortBtn.text());
    },

    /**
     * 지역선택 즐겨찾기 팝업 버튼 event
     * */
    onClickSelectLocMenuBtn : function(e){
        var welTarget = $(e.currentTarget),
            sCurId = welTarget.attr("id"),
            nTargetIdx = welTarget.attr("tl:ord");

        if(sCurId == "_closeSelectLoc"){
            this.welBodyLayer.removeClass("show-ly_favorite");
        } else {

            window.gaSendEvent('localGPS','click','preferencecancel_'+ nTargetIdx,{
                'dimension7' : sCurId
            });

            welTarget.parent().remove();
            this.oLocalStorage.setLocationListInStorage({catNo:sCurId});
            var cnt = this.oLocalStorage.getFavoriteLocations().length;
            $("#_favoriteListCount").text("("+cnt+")");

        }
    },

    /**
     * 즐겨찾기 리스트 클릭 시, 현재 동일 지역인 경우 확인
     * */

    onClickSelectLocationListBtn : function(e) {
        var welTarget = $(e.currentTarget),
            nTargetNo = welTarget.attr("data-no"),
            nTargetIdx = welTarget.attr("tl:ord");

        window.gaSendEvent('localGPS','click','preferencelocal_'+ nTargetIdx,{
            'dimension7' : nTargetNo
        });

        if(nTargetNo == this.oLocalStorage.getLastLocationInfo("nCatNo")){
            this.welBodyLayer.removeClass("show-ly_favorite");
            return false;
        }
    },

    onClickBackGroundLayer : function(){
        this.welBodyLayer.removeClass("show-ly_sort show-ly_favorite");
        //this.welBtnFirstSubMenu.removeClass("open");
    },

    /**
     * Sub1dp Menu클릭 할 때
     */
    onClickSelectSub1dpMenuBtn : function(e){
        var welTarget = $(e.currentTarget),
            nTargetIdx = welTarget.attr("tl:ord"),
            sCurText = welTarget.text(),
            nBizNo = parseInt(welTarget.attr("data-bizno"), 10);


        window.gaSendEvent('localGPS','click','local_category_'+ nTargetIdx,{
            'dimension7' : nBizNo
        });        // GA

        if(welTarget.hasClass("on")){
            //this.welBtnFirstSubMenu.removeClass("open");
            this.toggleSubMenuAction();
            return false;
        }

        this.wel1stSubMenu.find("button").removeClass("on");
        welTarget.addClass("on");
        this.welBtnFirstSubMenu.text(sCurText);
        this.resetSort();
        this.oDealList.reset();
        this.nParentBizCategoryNo = nBizNo;
        this.nBizCategoryNo = nBizNo;
        this.welSubMenu.scrollLeft(0);
        this.oLocalStorage.setCategoryInfo(null, null, nBizNo, 0,null);

        //// 이전에 선택한 카테고리 번호가 있는지 확인한다.
        //var sLastSelectedBizCategory = this.getLastSelectedBizCategory(this.nParentBizCategoryNo);
        //if(sLastSelectedBizCategory){
        //    // 이전에 선택한 카테고리 번호가 있는경우
        //    this.oDealList.setLastBizCategory(sLastSelectedBizCategory);
        //}

        if(this.oDealList.getCurrentDealListType() == "LOCAL_DEAL") { // 지역선택 딜의 경우
            this.oDealList.getDealWithCategory(null, nBizNo, this.sLocalDealSortType, 0, false);
        }else if(this.oDealList.getCurrentDealListType() == "NEAR_DEAL"){ // 내 주변 딜의 경우
            this.oDealList.getNearDeal(nBizNo, null, null);
        }

        this.toggleSubMenuAction();
    },

    /**
     * 서브카테고리 리스트를 렌더링 해준다.
     * @param aBizCategoryList
     */
    renderBizCategoryList : function(aBizCategoryList, nLastSelectedBizCategoryNo){
        if(!aBizCategoryList || !aBizCategoryList.length){
            return;
        }
        this.welSubMenu.html(this.tplSubMenuList({
            subMenuList : aBizCategoryList,
            uri : TMON.local.htUri,
            tl_sub_category_all : TMON.local.htTLCodeDictionary.tl_sub_category_all,
            tl_sub_category : TMON.local.htTLCodeDictionary.tl_sub_category
        })).show();

        if(nLastSelectedBizCategoryNo){
            var welTarget = this.welSubMenu.find("li[data-catno=" + nLastSelectedBizCategoryNo + "]");
            if(welTarget.length){
                this.welSubMenu.find("label").removeClass("on");
                welTarget.find("label").addClass("on");
            }
        }
    },

    onUpdateLocation : function(){
        this.oDealList.reset();
        this.oLocalStorage.deleteLastLocation();
        this.oLocalStorage.setCategoryInfoForMyNear();
        //this.welBtnFirstSubMenu.removeClass("open");
        this.initSortBtn();

        window.gaSendEvent('localGPS','click','getgps');  // GA Code Function 호출 : web,app은 자동 prefix 설정됨

        if(TMON.view_mode == "app"){
            this.updateGPSLocationOnApp();
        }else{
            this.updateGPSLocationOnWeb();
        }
    },

    /**
     * 콜렉션 배너 클릭 시 딜 리스트 이동
     */
    onClickCollectionBtn : function(e) {
        var welTarget = $(e.currentTarget),
            nTargetIdx = welTarget.attr("tl:ord");

        window.gaSendEvent('localGPS','click','collection_banner_'+nTargetIdx,{
            'dimension7' : welTarget.attr("data-targetNo")
        });

        if(TMON.view_mode == "app"){
            var nTargetTp = parseInt(welTarget.attr("data-targetTp"));

            if(nTargetTp == this.COLLECTION_EXHIBITION_NO){
                TMON.app.callApp('event', 'goDailyCategory', welTarget.attr("data-detailTargetNo"), welTarget.attr("data-title"));
            } else if(nTargetTp ==  this.COLLECTION_LIST){
                TMON.app.callApp("webview", "showView", welTarget.attr("data-title"), welTarget.attr("href"), false);
            } else if(nTargetTp == this.COLLECTION_URL) {
                TMON.app.callApp("local", "stickerUrl", welTarget.attr("href"));
            } else if(nTargetTp == this.COLLECTION_DEAL){
                return true;
            }
            return false;
        }
    },

    /**
     * 이벤트 배너 클릭 시 이벤트 배너 웹뷰 페이지로 이동
     */
    onClickADBannerBtn : function(e) {
        var welTarget = $(e.currentTarget),
            nTargetIdx = welTarget.attr("tl:ord");

        window.gaSendEvent('localGPS','click','ad_banner_'+nTargetIdx,{
            'dimension7' : welTarget.attr("data-catNo")
        });

        if(TMON.view_mode == "app"){
            var sDealLink = welTarget.attr("data-link");
            if(sDealLink == 'true') {
                // 일반 딜
                return true;
            }
            TMON.app.callApp("local", "stickerUrl", e.currentTarget.href);
            return false;
        }
    },

    /**
     * App 으로 GPS 업데이트 요청 한다.
     */
    updateGPSLocationOnApp : function(){
        TMON.app.callApp("local", "updateLocation");
    },

    updateGPSLocationOnWeb : function(){
        this.oLocation.getLocation();
    },

    /**
     * GPS 수신 상태에 따른 안내문구 설정
     * @param nGPSStatusCode
     *      0 : 수신성공,
     *      1 : GPS ON/권한 있으나 수실 실패
     *      2 : GPS ON/권한 없음,
     *      3 : GPS OFF / 권한 있음
     *      4 : GPS OFF / 권한 없음
     */
    showGPSNotice : function(nGPSStatusCode,nLatitude,nLongitude){

        this.hideSubMenu(true);
        this.welBodyLayer.addClass("gps_off");

        switch (nGPSStatusCode)
        {
            case this.GPS_ON_USABLE:
                this.welBodyLayer.removeClass("gps_off");
                this.welSubMenu.show();
                this.oLocation.getLocationName(nLatitude, nLongitude);
                //this.showTooltipOnMainMenu();
                break;
            case this.GPS_ON_UNUSABLE:
                this.welGPSOnUnusable.show();
                break;
            case this.GPS_ON_NO_PERMISSION:
                if(TMON.bIsAndroid) {
                    this.welGPSOnServiceOff.show();
                }
                break;
            case this.GPS_OFF_YES_PERMISSION:
                this.welGPSOff.show();
                break;
            case this.GPS_OFF_NO_PERMISSION:
                if(TMON.view_mode == "web") {
                    this.welGPSOffWEB.show();
                } else if(TMON.bIsAndroid){
                    this.welGPSOffServiceOff.show();
                } else if(TMON.bIsIos) {
                    var aIOSInfo = TMON.util.getIOSVersion();
                    if(aIOSInfo[0] < 8) {
                        this.welGPSOffForIPhone.show();
                    } else {
                        this.welGPSOff.show();
                    }
                }
                break;
            default :
                console.log("no status");
        }
    },

    showDealStatusNotice : function(nCnt) {
        this.hideSubMenu(false);

        if(nCnt === 0) {
            this.welNoDealStatus.show();
            this.welSubMenu.hide();
            this.welTooltip.hide();
            this.welBtnSort.addClass("_dim");
            this.welBodyLayer.addClass("no_deal");
            this.oDealList.getBestDeal();
        } else {
            this.welBtnSort.removeClass("_dim");
            this.welBodyLayer.removeClass("no_deal");
            this.welSubMenu.show();
            this.showTooltipOnMainMenu();
        }

        return nCnt;
    },

    hideSubMenu : function(bAllHide) {

        if(bAllHide) {
            this.welADBanner.hide();
            this.welCollectionBanner.hide();
            this.welSubMenu.hide();
            this.welTooltip.hide();
        }
        this.welNoDealStatus.hide();
        this.welGPSOnUnusable.hide();
        this.welGPSOnServiceOff.hide();
        this.welGPSOffForIPhone.hide();
        this.welGPSOff.hide();
        this.welGPSOffServiceOff.hide();
        this.welGPSOffWEB.hide();
    },

    loadDealFromApp :function(nGPSStatusCode, nLatitude, nLongitude){
        if(nGPSStatusCode === 0){ // 0이면 수신성공
            this.getDealListWithGPS(nLatitude, nLongitude);
        }else{
            this.showBestDeal();
        }
    },

    isCurrentLastViewShowing : function() {
        var nLastViewedLocalCategory = this.oLocalStorage.getLastLocationInfo("nCatNo");

        if(nLastViewedLocalCategory) {
            return true;
        }

        return false;
    },


    /**
     * 전국 포커스 베스트 10 딜을 보여준다.
     */
    showBestDeal : function(){
        this.oDealList.getBestDeal();
    },

    onClickSubMenu : function(e){
        var welTarget = $(e.currentTarget),
            nTargetIdx = welTarget.attr("tl:ord"),
            welTargetLabel = welTarget.find("label:first"),
            nBizNo = parseInt(welTarget.attr("data-catno"), 10);
        //this.welBtnFirstSubMenu.removeClass("open");

        if(nTargetIdx) {
            window.gaSendEvent('localGPS','click', 'sub_category_'+nTargetIdx, {
                'dimension7' : nBizNo
            }); // GA
        } else {
            window.gaSendEvent('localGPS','click', 'sub_category_all'); // GA
        }

        if(welTargetLabel.hasClass("on")){
            return false;
        }

        this.resetSort();
        this.welSubMenu.find("label").removeClass("on");
        welTargetLabel.addClass("on");

        this.oDealList.reset();
        this.oLocalStorage.setCategoryInfo(null, null, this.nParentBizCategoryNo, nBizNo, null);


        if(this.oDealList.getCurrentDealListType() == "LOCAL_DEAL") { // 지역선택 딜리스트
            this.oDealList.getDealWithCategory(null, nBizNo, null, 0, false);
        }else if(this.oDealList.getCurrentDealListType() == "NEAR_DEAL") { // 내주변 딜리스트
            this.oDealList.getNearDeal(nBizNo, null, null);
        }

        //this.setLastSelectedBizCategory(nBizNo);
        return false;
    },

    showTooltipOnMainMenu : function() {

        var bToolTipShowing = this.oLocalStorage.getCategforyInfo().bTooltipShowing ? true : false;

        if(!bToolTipShowing) {
            this.welTooltip.show();
            this.oLocalStorage.setCategoryInfo(null,null,null,null,true);
        }
    }
};