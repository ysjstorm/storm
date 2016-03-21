/**
 * 뒤로가기가 구현되어야 함으로 Hash값 변경에서 모든 동작을 하게 되어있다.
 */
var cvsMain = function(htOptions){
    $.extend(this, htOptions);
    this.htOptions = htOptions;
    this.init();
};

cvsMain.prototype = {
    bShowLayer : false, // Andriod의 경우 Layer창이 보여지고 있을때 키보드가 열리면 레이어가 위로 올라가는 문제가 있어서, 키보드가 열려 있을때 hide시키기 위한 플래그 상용
    bIsAjaxLoading : false,

    init : function(){
        this.oNaverMap = new naverMap(this.htOptions, this);
        this.cacheElement();
        this.setTemplate();
        this.setEvent();

        if(!this.getHash().sKeyword){
            this.getGPS();
        }
    },

    getGPS : function(){
        this.welBody.addClass("loading");
        if(TMON.view_mode == "app"){
            this.updateGPSLocationOnApp();
        }else{
            this.getGeoLocation();
        }
    },

    cacheElement : function(){
        this.welBody = $("body");
        this.welSearchForm = $("#conditionSearchForm");
        this.welCondition = this.welSearchForm.find("input[name=condition]");
        this.welEmpty = $(".empty:first");
        this.welSelectLayer = $("#info");
        this.welSelectLayerName = this.welSelectLayer.find(".name:first");
        this.welSelectLayerAddr = this.welSelectLayer.find(".addr:first");
        this.welSelectLayerTel = this.welSelectLayer.find(".tel:first");

        this.welSearchBtn = $(".btn_search:first");
        this.welRemoveBtn = $(".btn_remove:first");
        this.welBackBtn = $("#_btnBackBtn");

        this.htAddress = {
            sCondition : "ADDRESS",
            nMinimunTextLength : 2,
            welInput : this.welSearchForm.find("input[name=address_keyword]")
        };

        this.htStreet = {
            sCondition : "STREET",
            nMinimunTextLength : 2,
            welInput : this.welSearchForm.find("input[name=street_keyword]")
        };

        this.htCvs = {
            sCondition : "CVS_NAME",
            nMinimunTextLength : 1,
            welInput : this.welSearchForm.find("input[name=cvs_keyword]")
        };

        this.welList = $("#_list");
        this.welCount = $("#_count");
        this.welMap = $(".map_cvs");
        this.welInput = $(".search_input input");

        this.htCurrentTab = this.htAddress;
    },

    setTemplate : function(){
        this.tplList = Handlebars.compile($("#cvsList").html());
    },

    setEvent : function(){
        $(window).hashchange($.proxy(this.onChangeHash, this)); // 해쉬 변경 이벤트

        this.welSearchForm.submit($.proxy(this.onSearchSubmit, this));  // 검색
        this.welCondition.click($.proxy(this.onClickTab, this));  // Tab 변경
        this.welList.on("click", "a", $.proxy(this.onClickCVSItem, this)); // CVS 선택시
        this.welSelectLayer.find(".btn_cancel").click($.proxy(this.onCloseLayer, this)); // 레이어 닫기
        this.welSelectLayer.find(".btn_select").click($.proxy(this.onConfirmCvs, this)); // CVS 선택
        this.welInput.keyup($.proxy(this.onKeyup, this)); // 키입력
        this.welRemoveBtn.click($.proxy(this.onRemove, this)); // 검색어 입력 Clear 버튼
        this.welSearchBtn.click($.proxy(this.onSearchSubmit, this)); // 검색 버튼

        $("#_searchOnMapView").click($.proxy(this.onSearchOnMapView, this)); // 현재 지도에서 재검색

        $("#_btnClose").click($.proxy(this.onCloseWindow, this));

        if(TMON.bIsAndroid){ // Andriod의 경우 Layer창이 보여지고 있을때 키보드가 열리면 레이어가 위로 올라가는 문제가 있어서, 키보드가 열려 있을때 hide시키기 위한 플래그 상용
            this.welInput.focus($.proxy(function(){
                this.welSelectLayer.hide();
            }, this));

            this.welInput.blur($.proxy(function(){
                if(this.bShowLayer){
                    this.welSelectLayer.show();
                }
            }, this));
        }
    },

    onSearchOnMapView : function(){
        var htPos = this.oNaverMap.getCenter();
        this.getInitPoisition(htPos.y, htPos.x, false);
        this.hideConfirmLayer();
    },

    onKeyup : function(e){
        var welTarget = $(e.currentTarget);
        this.activeInputBtns(welTarget.val());
    },

    activeInputBtns : function(sValue){
        if(sValue.length > 0){
            this.welSearchBtn.addClass("active");
            this.welRemoveBtn.show();
        }else{
            this.welSearchBtn.removeClass("active");
            this.welRemoveBtn.hide();
        }
    },

    onRemove : function(){
        this.htCurrentTab.welInput.val("");
        this.welSearchBtn.removeClass("active");
        this.welRemoveBtn.hide();
    },

    onCloseLayer : function(){
        this.bShowLayer = false;
        this.welSelectLayer.hide();
        this.oNaverMap.setAllMakerDefault();
    },

    onChangeHash : function(){
        var htHash = this.getHash();
        this.activeTab(htHash.sTabName);

        if(htHash.sKeyword){
            this.search(htHash.sTabName, htHash.sKeyword);
        }else{
            this.oNaverMap.removeMarker();
            this.hideConfirmLayer();
            this.oNaverMap.setMapDefaultPos();
            this.resetList();
        }

        if(htHash.sViewType == "MAP"){
            this.showMap();
            this.bPostShowList = false;
            this.bPostSelectCvs = htHash.sSelectedCvsNo;
        }else{
            this.showList();
            this.bPostShowList = true;
            this.hideConfirmLayer();
        }

        if(!htHash.sOriginalHash){ //해쉬 값이 없을 경우, GPS 위치로 편의점을 받아온다.
            this.getGPS();
            this.hideBackBtn();
        }else{
            this.showBackBtn();
        }
    },

    showBackBtn : function(){
        if(TMON.view_mode == "app"){
            this.callApp('payment', 'showBackButton', true);
        }else{
            this.welBackBtn.show();
        }
    },

    hideBackBtn : function(){
        if(TMON.view_mode == "app"){
            this.callApp('payment', 'showBackButton', false);
        }else{
            this.welBackBtn.hide();
        }
    },

    activeTab : function(sTabName){
        sTabName = sTabName || "ADDRESS";
        this.welCondition.parents("label").removeClass("on");
        this.welCondition.filter("[value="+sTabName+"]").prop("checked","checked")
            .parents("label:first").addClass("on");

        this.hideTab(this.htCurrentTab);
        switch(sTabName){
            case "ADDRESS":
                this.htCurrentTab = this.htAddress;
                window.gaSendEvent("OrderProcess", "pickup", "지번주소");
                break;
            case "STREET":
                this.htCurrentTab = this.htStreet;
                window.gaSendEvent("OrderProcess", "pickup", "도로명주소");
                break;
            case "CVS_NAME":
                window.gaSendEvent("OrderProcess", "pickup", "편의점명");
                this.htCurrentTab = this.htCvs;
                break;
        }
        this.showTab(this.htCurrentTab);
        this.activeInputBtns(this.htCurrentTab.welInput.val());
    },

    setHash : function(sTabName, sViewType, sSelectedCvsNo, sKeyword){
        var htHash = this.getHash();
        if(htHash){
            sTabName = sTabName || (sTabName === "" ? "" : htHash.sTabName);
            sViewType = sViewType || (sViewType === "" ? "" : htHash.sViewType);
            sSelectedCvsNo = sSelectedCvsNo || (sSelectedCvsNo === "" ? "" : htHash.sSelectedCvsNo);
            sKeyword = sKeyword || (sKeyword === "" ? "" : htHash.sKeyword);
        }

        window.location.hash = "sTabName=" + sTabName + "&sViewType=" + sViewType + "&sSelectedCvsNo=" + sSelectedCvsNo + "&sKeyword=" + sKeyword;
    },

    getHash : function() {
        var sHash = window.location.hash.substring(1);
        var aHash = sHash.split("&");
        var htHash = {
            sTabName : "ADDRESS",
            sViewType : "MAP",
            sSelectedCvsNo : "",
            sKeyword : "",
            sOriginalHash : sHash
        };

        for(var i= 0, max=aHash.length ; i<max; i++ ){
            var aItem = aHash[i].split("=");
            htHash[aItem[0]] = aItem[1];
        }

        return htHash;
    },

    onClickTab : function(e){
        var welTarget = $(e.currentTarget);

        // 같은값 클릭시
        if(welTarget.val() == this.htCurrentTab.sCondition){
            return;
        }

        this.activeTab(welTarget.val());
    },

    showTab : function(htCurrentTab){
        htCurrentTab.welInput.show();
    },

    hideTab : function(htCurrentTab){
        htCurrentTab.welInput.hide();
    },

    onClickCVSItem : function(e){
        if(this.bIsAjaxLoading){
            return false;
        }

        var welTarget = $(e.currentTarget);
        var sCvsNo = welTarget.attr("data-cvs");
        this.setHash(null, "MAP", sCvsNo, null);
        window.gaSendEvent("OrderProcess", "pickup", "편의점선택");

        return false;
    },

    selectCvsByCvsNo : function(sCvsNo){
        this.htSelectedCVS = this.getCVSInfo(sCvsNo);
        this.oNaverMap.setCenter(this.htSelectedCVS.lat, this.htSelectedCVS.lng);
        this.oNaverMap.selectMarkerByCVSNo(sCvsNo);
        this.showConfirmLayer(sCvsNo);
    },

    unselectAllCvs : function(){
        this.htSelectedCVS = null;
        this.hideConfirmLayer();
    },

    showConfirmLayer : function(sCvsNo){
        this.htSelectedCVS = this.getCVSInfo(sCvsNo);
        if(!this.htSelectedCVS){
            return;
        }

        this.bShowLayer = true;
        this.welSelectLayerName.html(this.htSelectedCVS.cvs_branch_nm);
        this.welSelectLayerAddr.html(this.htSelectedCVS.ji_no_addr);
        this.welSelectLayerTel.html(this.htSelectedCVS.tel_no);
        this.welSelectLayer.show();
    },

    hideConfirmLayer : function(){
        this.bShowLayer = false;
        this.welSelectLayer.hide();
    },

    onSearchSubmit : function(){
        window.gaSendEvent("OrderProcess", "pickup", "search");
        var sKeyword = this.htCurrentTab.welInput.val();

        if(sKeyword.length < this.htCurrentTab.nMinimunTextLength){
            alert('검색어가 너무 짧습니다.');
            return false;
        }

        this.setHash(this.htCurrentTab.sCondition, "LIST", "", encodeURI(sKeyword));
        this.htCurrentTab.welInput.blur();
        return false;
    },

    search : function(sCondition, sKeyword){
        this.bIsAjaxLoading = true;
        $.ajax({
            url: this.htAPI.getCvsByCondition.replace('{condition}', sCondition),
            data : {
                keyword : decodeURI(sKeyword)
            },
            success: $.proxy(this.cbSearch, this)
        });
    },

    getCVSInfo : function(sCVSNo){
        for(var i= 0, max = this.aItems.length; i<max; i++){
            if(this.aItems[i].cvs_branch_cd == sCVSNo){
                return this.aItems[i];
            }
        }

        return false;
    },

    showList : function(){
        this.welMap.hide();
        this.welList.show();
    },

    showMap : function(){
        this.welList.hide();
        this.welMap.show();
    },

    cbSearch : function(res){
        this.bIsAjaxLoading = false;
        if(!res.data || !res.data.length){
            this.showEmpty();
            return false;
        }

        this.processData(res.data);
        if(this.bPostShowList){
            this.showList();
            this.bPostShowList = false;
        }else{
            this.showMap();
        }

        if(this.bPostSelectCvs){
            this.selectCvsByCvsNo(this.bPostSelectCvs);
            this.bPostSelectCvs = false;
        }
    },

    processData : function(aList){
        this.aItems = aList;
        this.render(this.aItems);
        this.oNaverMap.removeMarker();
        this.oNaverMap.setMarker(this.aItems);
    },

    render : function(aList){
        if(!aList || !aList.length){
            this.welList.html("");
            this.welEmpty.show();
            return;
        }

        this.welEmpty.hide();
        this.welList.html(this.tplList({
            aItems : aList,
            tlCvsList : this.htOptions.htTlCode.tlCvsList
        }));
        this.welCount.find("em").html(aList.length);
    },

    showEmpty : function(){
        if(this.htCurrentTab.aItems){ // 이전 검색 결과가 있으면 이전 검색 결과는 유지 하고 얼럿만 띄워야함
            alert('검색결과가 없습니다');
        }else{
            this.resetList();
            this.welEmpty.show();
            // 검색 결과가 없습니다 마크업 추가되어야함..
        }
    },

    resetList : function(){
        this.welList.html("");
        this.welCount.find("em").html(0);
    },

    onConfirmCvs : function(){
        if(!this.htSelectedCVS){
            console.log("No CVS Infomation!");
            return false;
        }

        var sCvsData = JSON.stringify(this.htSelectedCVS);
        if(TMON.view_mode == "app"){
            this.callApp('webview' , 'callJavascriptToParent', 'window.receiveMessageFromApp(' + encodeURI(sCvsData) + ')');
        }else{
            $.postMessage(
                sCvsData,
                this.sOpenerUrl,
                window.opener
            );
            setTimeout(function(){
                window.close();
            }, 200);
        }
    },

    onCloseWindow : function(){
        window.close();
    },

    /**
     * 처음 진입시 지도에 표시할 편의점 정보를 가져온다.
     * bIsOnlyAccount : AccountNo를 사용할 것인가
     */
    getInitPoisition : function(nLatitude, nLongitude, bIsOnlyAccount){
        $.ajax({
            url: this.htAPI.getCvsByPosition.replace('{lat}', nLatitude).replace('{lng}', nLongitude),
            data : {
                isOnlyAccount : bIsOnlyAccount
            },
            success: $.proxy(this.cbGetInitPosition, this)
        });
    },

    cbGetInitPosition : function(res){
        this.welBody.removeClass("loading");
        if(!res.data || !res.data.length){
            return false;
        }
        this.processData(res.data);
    },

    /**
     * App 으로 GPS 업데이트 요청 한다.
     */
    updateGPSLocationOnApp : function(){
        this.callApp("local", "updateLocation", "TMON.cvs.oCvsMain.updateLocationFromApp");
    },

    /**
     * 내 주변 지역 조회
     */
    getGeoLocation : function (){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition($.proxy(this.cbGetLocation, this), $.proxy(this.onErrorLocation, this), {
                enableHighAccuracy : false,
                maximumAge : 1000 * 60 * 5, // 5분 캐쉬
                timeout : 7000
            });
        }else{
            this.getInitPoisition(0, 0, true);
        }
    },

    /**
     * 에러 처리
     * @param htError
     */
    onErrorLocation : function(){
        this.getInitPoisition(0, 0, true);
    },

    /**
     * 위치 정보 저장
     *
     * @param htPosition
     */
    cbGetLocation : function(htPosition) {
        var nLatitude = htPosition.coords.latitude;
        var nLongitude = htPosition.coords.longitude;
        this.getInitPoisition(nLatitude, nLongitude, true);
    },

    /**
     *
     * @param htData
     * nGPSStatusCode :
     *      0 : 수신성공,
     *      1 : GPS ON/권한 있으나 수실 실패
     *      2 : GPS ON/권한 없음,
     *      3 : GPS OFF / 권한 있음
     *      4 : GPS OFF / 권한 없음
     * nLatitude : 37.5551069 // 위도
     * nLongitude : 126.9685024 // 경도
     */
    updateLocationFromApp : function(data){
        if(typeof(data) == "string"){
            var htData = JSON.parse(data);
        }else{
            var htData = data;
        }

        if(htData.nGPSStatusCode == 0){ // 수신성공
            this.getInitPoisition(htData.nLatitude, htData.nLongitude, true);
        }else{
            this.getInitPoisition(0, 0, true);
        }
    },

    /**
     * callApp 쪽에 신규 nativeBridge가 추가되어, 여기에다 따로 구현되었음
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

        if( TMON.bIsIos ) {
            if (!window.nativeBridge) {
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
            } else {
                window.nativeBridge.callApp(arguments);
            }
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
    }

};