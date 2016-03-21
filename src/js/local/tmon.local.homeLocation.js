/**
 * 위치 정보 가져오는 클래스
 */
var localHomeLocation = function(htOptions){
    $.extend(this, htOptions);
    this.init();
};

localHomeLocation.prototype = {
    //LOCAL_LOCATION_COOKIE_NAME : "GEO_LOCAL",

    init : function(){
        this.cacheElement();
        this.setEvent();
        //this.getLocationName();
    },

    cacheElement : function(){
        this.welAddress = $("#_positionAddress"); // 현재 위치 주소
    },

    setEvent : function(){
        $("#_btnMyNear").click($.proxy(this.onClickMyNear, this));
    },

    onClickMyNear : function(){
        this.getLocation();
    },

    /**
     * 내 주변 지역 조회
     */
    getLocation : function (){

        var positionOption = {maximumAge:Infinity, timeout: 3000, enableHighAccuracy : false};
        // maximumAge:Infinity : 캐시된 로케이션을 가지고 온다. timeout: 3초로 설정

        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition($.proxy(this.cbGetLocation, this), $.proxy(this.onErrorLocation, this), positionOption);
        }else{
            alert("브라우저가 geolocation을 지원하지 않습니다");
        }
    },

    /**
     * 에러 처리
     * @param htError
     */
    onErrorLocation : function(htError){
        switch(htError.code){
            case htError.PERMISSION_DENIED:
                this.oHome.showGPSNotice(4);
                this.oHome.showBestDeal();
                break;
            case htError.POSITION_UNAVAILABLE:
            case htError.TIMEOUT:
            case htError.UNKNOWN_ERROR:
                this.oHome.showGPSNotice(4);
                this.oHome.showBestDeal();
                break;
        }
    },

    /**
     * 위치 정보 저장
     *
     * @param htPosition
     */
    cbGetLocation : function(htPosition) {
        var nLatitude = htPosition.coords.latitude;
        var nLongitude = htPosition.coords.longitude;

        this.updateDealList(nLatitude, nLongitude); // 딜리스트 업데이트
        this.getLocationName(nLatitude, nLongitude);
    },

    /**
     * 지역명을 가져온다.
     */
    getLocationName : function(nLatitude, nLongitude){
        $.ajax({
            url: TMON.local.htAPI.getLocationName.replace('{type}',"NORMAL"),
            dataType: 'json',
            data : {
                latitude : nLatitude,
                longitude : nLongitude
            },
            success : $.proxy(this.cbGetLocationName, this),
            error : $.proxy(function(jqXHR, textStatus){
                alert('일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주십시오.');
                if(textStatus == "abort"){
                    return;
                }
            }, this)
        });

    },

    cbGetLocationName : function(res){
        this.welAddress.html(res.data.found ? res.data.locationName : "");
    },

    setLastLocationName : function(sLocationName){
        this.welAddress.html(sLocationName);
    },
    /**
     * 딜리스트 업데이트
     * @param nLatitude
     * @param nLatitude
     */
    updateDealList : function(nLatitude, nLongitude){
        this.oHome.getDealListWithGPS(nLatitude, nLongitude);
    }

};