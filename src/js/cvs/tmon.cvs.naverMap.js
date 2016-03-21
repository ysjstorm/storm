var naverMap = function(htOptions, oMain){
    $.extend(this, htOptions);
    this.htOptions = htOptions;
    this.oMain = oMain;
    this.init();
};

naverMap.prototype = {
    MAP_DEFAULT_LEVEL : 11,
    DEFAULT_MAKER_ZINDEX : 100,
    HIGHLIGHT_MAKER_ZINDEX : 200,
    aMarkerList : [],
    htDefaultPos : { // 최초 위치는 서울시청
        nLat : 37.5675451,
        nLng : 126.9773356
    },

    init : function(){
        this.cacheElement();
        this.initMapData();
        this.initMap(this.htDefaultPos.nLat, this.htDefaultPos.nLng);
        this.setEvent();
        this.aCVSList = {};
    },

    cacheElement : function(){
        this.welMap = $('#map');
        this.welCvsInfo = $('#info');
    },

    setEvent : function(){
        this.oMap.attach('click', $.proxy(this.onClickMarker, this));
    },

    initMapData : function(){
        var oMarkerSize = new nhn.api.map.Size(34, 40);
        var oMarketOffset = new nhn.api.map.Size(17, 40);
        this.oMarkerIcon = new nhn.api.map.Icon(this.htOptions.htMarkerUrl.cu.normal, oMarkerSize, oMarketOffset);
        this.oMarkerIconDisable = new nhn.api.map.Icon(this.htOptions.htMarkerUrl.cu.disable, oMarkerSize, oMarketOffset);
        this.oMarketIconSelect = new nhn.api.map.Icon(this.htOptions.htMarkerUrl.cu.focus, oMarkerSize, oMarketOffset);
    },

    initMap : function(nDefaultLat, nDefaultLng){
        this.oMap = new nhn.api.map.Map(
            document.getElementById('map'),
            {
                point : new nhn.api.map.LatLng(nDefaultLat, nDefaultLng),
                zoom : this.MAP_DEFAULT_LEVEL,
                enableWheelZoom : true,
                enableDragPan : true,
                enableDblClickZoom : false,
                mapMode : 0,
                activateTrafficMap : false,
                activateBicycleMap : false,
                minMaxLevel : [ 1, 14 ],
                size : new nhn.api.map.Size(this.welMap.width(), this.welMap.height())
            }
        );
    },

    onClickMarker : function(e){
        var oTargetMarker = e.target;

        if(!(oTargetMarker instanceof nhn.api.map.Marker)){ // 마커를 클릭하지않고, 지도를 클릭한 경우
            this.setAllMarkerIcon(this.oMarkerIcon);
            this.oMain.unselectAllCvs();
            return;
        }

        // 겹침 마커 클릭한거면
        if (e.clickCoveredMarker){
            return;
        }

        this.makeSelectMarker(oTargetMarker);

        var htMarkerTitleInfo = this.getMarkerInfoFromTitle(oTargetMarker.getTitle());
        this.oMain.showConfirmLayer(htMarkerTitleInfo.sCvsNo);
        window.gaSendEvent("OrderProcess", "pickup", "지도클릭");
    },

    makeSelectMarker : function(oMarker){
        this.setAllMarkerIcon(this.oMarkerIconDisable);
        oMarker.setIcon(this.oMarketIconSelect);

        this.setAllMakerDefaultZindex();
        oMarker.setZIndex(this.HIGHLIGHT_MAKER_ZINDEX);
    },

    setAllMakerDefault : function(){
        this.setAllMarkerIcon(this.oMarkerIcon);
    },

    setAllMarkerIcon : function(oMarkerIcon){
        for(var i=0, max=this.aMarkerList.length; i<max;i++){
            this.aMarkerList[i].setIcon(oMarkerIcon);
        }
    },

    setAllMakerDefaultZindex : function(){
        for(var i=0, max=this.aMarkerList.length; i<max;i++){
            this.aMarkerList[i].setZIndex(this.DEFAULT_MAKER_ZINDEX);
        }
    },

    getMarkerInfoFromTitle : function(sMarkerTitle){
        return {
            nIndex : parseInt(sMarkerTitle.split("_")[0], 10),
            sCvsNo : sMarkerTitle.split("_")[1]
        }
    },

    removeMarker : function(){
        this.oMap.clearOverlay();
    },

    setMarker : function(aCVSList){
        this.aMarkerList = [];
        this.aInfoWindowList = [];
        this.aCVSList = aCVSList;

        for(var i= 0, max=aCVSList.length; i<max; i++){
            var oTargetPoint = new nhn.api.map.LatLng(aCVSList[i].lat, aCVSList[i].lng);
            var oMarker = new nhn.api.map.Marker(this.oMarkerIcon, {
                point : oTargetPoint,
                title : i + "_" + aCVSList[i].cvs_branch_cd
            });

            this.oMap.addOverlay(oMarker);
            this.aMarkerList.push(oMarker);
            $(oMarker._elEl).attr('tl:area', this.htOptions.htTlCode.tlMapMarker);
        }

        this.setCenter(aCVSList[0].lat, aCVSList[0].lng);
    },

    getCenter : function(){
        return this.oMap.getCenter();
    },

    setCenter : function(lat, lng){
        this.oMap.setCenter(new nhn.api.map.LatLng(lat, lng), {"useEffect" : true});
    },

    setMapDefaultPos : function(){
        this.setCenter(this.htDefaultPos.nLat, this.htDefaultPos.nLng);
    },

    selectMarkerByCVSNo : function(sCVSNo){
        for(var i=0, max=this.aMarkerList.length; i<max;i++){
            var sMarketCVSNo = this.getMarkerInfoFromTitle(this.aMarkerList[i].getTitle()).sCvsNo;

            if(sCVSNo == sMarketCVSNo){
                this.makeSelectMarker(this.aMarkerList[i]);
                break;
            }
        }
    },

    getCVSInfoByCVSNo : function(sCVSNo){
        for(var i=0, max=this.aCVSList.length; i<max;i++){
            if(sCVSNo == this.aCVSList[i].cvs_branch_cd){
                return this.aCVSList[i];
            }
        }
    }
};