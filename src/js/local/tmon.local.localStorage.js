/**
 * Created by chanmo0704kim on 2016. 1. 12..
 */

var locationStorage = function(htOptions){
    $.extend(this, htOptions);
    this.init();
};

locationStorage.prototype = {

    LOCAL_LOCATION_STORAGE_NAME : "GEO_LOCAL_STORAGE",              // 즐겨찾기 지역
    LOCAL_LAST_LOCATION_NAME : "GEO_LAST_STORAGE",                  // 마지막 지역
    LOCAL_LOCATION_CATEGORY_NAME : "GEO_CATEGORY_INFO_STORAGE",

    STORAGE_LOCATION_NAME_IDX : 0,                                  // localStorage 지역 이름 index
    STORAGE_LOCATION_SAVE_IDX : 1,                                  // localStorage 즐겨찾기 등록 index
    STORAGE_LOCATION_CATNO_IDX : 2,                                 // localStorage 지역 카트 번호 index

    aSelectLocList: [],                                             // localStorage 배열
    aFavoriteSelectLocList : [],                                    // 즐겨찾기 배열

    oLastLocationInfo: "",

    htGeoCategoryInfo : "",

    init : function() {
        this.initLocalStorage();
        this.initFavoriteSelectedList();
    },

    /**
     *  로컬스토리지 초기 생성
     * */
    initLocalStorage : function(){
        if(!window.Storage) {
            return;
        }

        if(!this.isLocalStorageNameSupported()) {
            if(TMON.bIsIos) {
                alert("Safari 브라우저 '개인정보 보호'모드를\n해제하셔야 사용 가능합니다.");
            } else {
                console.log("Android can not also supported localStorage");
            }
        }

        // Code for localStorage/sessionStorage.
        if(localStorage.getItem(this.LOCAL_LOCATION_STORAGE_NAME) === null) {
            // 최초 1회 생성
            localStorage.setItem(this.LOCAL_LOCATION_STORAGE_NAME, JSON.stringify(this.aSelectLocList));
        }

        if(localStorage.getItem(this.LOCAL_LOCATION_CATEGORY_NAME) === null) {
            localStorage.setItem(this.LOCAL_LOCATION_CATEGORY_NAME,JSON.stringify({sLocationName : "", nLocalCatNo:"", nBizCatNo : "",nBizDetailNo : "", bTooltipShowing: false}));
        }

        // 메인화면 진입 시, localStorage에 있는 데이터를 가지고 온다.
        this.aSelectLocList = JSON.parse(localStorage.getItem(this.LOCAL_LOCATION_STORAGE_NAME));
        this.htGeoCategoryInfo = JSON.parse(localStorage.getItem(this.LOCAL_LOCATION_CATEGORY_NAME));
    },

    /**
     *
     * 즐겨찾기에 저장된 list를 가지고 온다.
     */
    initFavoriteSelectedList : function() {
        this.aFavoriteSelectLocList = [];

        for(var i= 0, max = this.aSelectLocList.length; i<max; i++) {
            if(this.aSelectLocList[i][this.STORAGE_LOCATION_SAVE_IDX] === true) {
                this.aFavoriteSelectLocList.push([this.aSelectLocList[i][this.STORAGE_LOCATION_NAME_IDX],this.aSelectLocList[i][this.STORAGE_LOCATION_CATNO_IDX]]);
            }
        }
    },

    /**
     * 콜앱을 통한 localStorage 동기화, 앱영역과 공유가 되지 않아서 즐겨찾기 목록을 다시 설정해야 함.
     **/
    resetFavoriteSelectedList : function() {
        this.aSelectLocList = JSON.parse(localStorage.getItem(this.LOCAL_LOCATION_STORAGE_NAME));
        this.initFavoriteSelectedList();
    },

    /**
     *
     * 로컬스토리지 데이터 삽입한다
     * */
    setLocationListInStorage: function(htParams){
        var htSearchInfo = this.searchLocationInStorage(htParams);
        if(!htSearchInfo.bResult) {
            // 즐겨찾기 처음 등록
            this.aSelectLocList.push([htParams.location, htParams.bSelect, htParams.catNo]);
            this.aFavoriteSelectLocList.push([htParams.location, htParams.catNo]);
        } else {
            this.aSelectLocList[htSearchInfo.nIndex][this.STORAGE_LOCATION_SAVE_IDX] = this.aSelectLocList[htSearchInfo.nIndex][this.STORAGE_LOCATION_SAVE_IDX] ? false : true;
            if(htParams.bSelect) {
                this.aFavoriteSelectLocList.push([this.aSelectLocList[htSearchInfo.nIndex][this.STORAGE_LOCATION_NAME_IDX],this.aSelectLocList[htSearchInfo.nIndex][this.STORAGE_LOCATION_CATNO_IDX]]);
            } else {
                this.removeFavoriteData(htParams.catNo);
            }

        }

        localStorage.setItem(this.LOCAL_LOCATION_STORAGE_NAME,JSON.stringify(this.aSelectLocList));
    },

    removeFavoriteData : function(nCatNo) {
      for(var idx=0, max = this.aFavoriteSelectLocList.length; idx < max; idx ++) {
          if(nCatNo == this.aFavoriteSelectLocList[idx][1]) {
              this.aFavoriteSelectLocList.splice(idx,1);
              return;
          }
      }
    },

    /**
     *
     */
    searchLocationInStorage : function(params) {
        var htResultData = {
                bResult : false,
                nIndex : 0
            };

        for(var idx = 0, max=this.aSelectLocList.length; idx < max; idx++) {
            if(this.aSelectLocList[idx][this.STORAGE_LOCATION_CATNO_IDX] == params.catNo){
                htResultData.bResult = true;
                htResultData.nIndex = idx;
                break;
            }
        }
        return htResultData;
    },

    getFavoriteLocations : function() {
        return this.aFavoriteSelectLocList;
    },

    /**
     * @params : locationName, catNo
     * */
    saveLastLocation : function(htParams) {
        localStorage.setItem(this.LOCAL_LAST_LOCATION_NAME, JSON.stringify({lastLocationCatNo:htParams.sCatNo, lastLocationName:htParams.sLocationName}));
    },

    getLastLocationInfo : function (sOptions) {
        var oLastLocationInfo = JSON.parse(localStorage.getItem(this.LOCAL_LAST_LOCATION_NAME));

        if(sOptions == "nCatNo") {
            return oLastLocationInfo ? oLastLocationInfo.lastLocationCatNo : null;
        } else if (sOptions == "sLocName"){
            return oLastLocationInfo ? oLastLocationInfo.lastLocationName : null;
        }
    },

    deleteLastLocation : function() {
        localStorage.removeItem(this.LOCAL_LAST_LOCATION_NAME);
    },

    isLocalStorageNameSupported : function() {

        var testKey = 'test', storage = window.localStorage;

        try {
            storage.setItem(testKey, '1');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * 카테고리 정보 저장
     * @param sLocation : 지역명
     * @param nLocalCatNo : 노출(지역)카테고리
     * @param nFirstCatNo : 업종카테고리
     * @param nSecCatNo : 세부업종카테고리
     * */
    setCategoryInfo : function(sLocation, nLocalCatNo, nFirstCatNo,nSecCatNo, bShowing) {
        this.htGeoCategoryInfo = {
            sLocationName : (sLocation === null)? this.htGeoCategoryInfo.sLocationName : sLocation,
            nLocalCatNo : (nLocalCatNo === null)? this.htGeoCategoryInfo.nLocalCatNo : nLocalCatNo,
            nBizCatNo : (nFirstCatNo === null)? this.htGeoCategoryInfo.nBizCatNo : nFirstCatNo,
            nBizDetailNo : (nSecCatNo === null)? this.htGeoCategoryInfo.nBizDetailNo : nSecCatNo,
            bTooltipShowing : (bShowing === null)? this.htGeoCategoryInfo.bTooltipShowing : bShowing,
        };

        localStorage.setItem(this.LOCAL_LOCATION_CATEGORY_NAME, JSON.stringify(this.htGeoCategoryInfo));
    },

    /**
     * 카테고리 정보
     * @returns {Object} {sLocationName,nLocalCatNo,nBizCatNo,nBizDetailNo}
     * */
    getCategforyInfo : function() {
        if(this.htGeoCategoryInfo) {
            return this.htGeoCategoryInfo;
        } else {
            return null;
        }
    },

    /**
     * 내주변 클릭 시, 지역명과 노출 카테고리는 0으로 저장
     * */
    setCategoryInfoForMyNear : function() {
        this.setCategoryInfo(0, 0,this.htGeoCategoryInfo.nBizCatNo, this.htGeoCategoryInfo.nBizDetailNo, null);
    },

    /**
     * 카테고리 정보 삭제제
     **/
    deleteCategoryInfo : function() {
        localStorage.removeItem(this.LOCAL_LOCATION_CATEGORY_NAME);
    }
};