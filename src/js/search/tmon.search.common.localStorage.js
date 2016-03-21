/**
 * 검색 로컬스토리지 컨트롤러
 */

var searchLocalStorage = function(htOptions){
    this.init.apply(this, arguments);
};

searchLocalStorage.prototype = {
    /**
     * 로컬스토리 생성자 초기화
     * @param {object} htOptions
     */
    init : function(htOptions){
        this.SAVE_MAX_COUNT = htOptions.MAX_COUNT; // 최근검색어 최대 저장 갯수
        this.SAVE_KEY = htOptions.KEY; // 로컬스토리지 키값
        this.setItemFrom = {
            addKeyword : "addKeyword",
            removeKeyword : "removeKeyword"
        };
        this.removeType = {
            forAdd : "forAdd"
        };
    },

    /**
     * 로컬스토리지에 선언된 키에대한 값 여부 체크
     * @returns {boolean}
     */
    checkHasKeyword : function(){
        var _bResult = false;

        if(this.getTheItem() !== null){
            this.getTheItem().aData.length > 0 ? _bResult = true : _bResult = false;
        }

        return _bResult;
    },

    /**
     * 로컬스토리지 값 저장시 해당 값이 이미 존재하는지 체크
     * @param {object} htData
     * @returns {boolean}
     */
    checkSameKeyword : function( htData ){
        var _sKeyword = htData.sKeyword,
            _sCategoryName = htData.sCategoryName || "",
            _htSearchHistory = this.getTheItem(),
            _len = _htSearchHistory.aData.length,
            _idx = 0,
            _result = false;

        for(_idx; _idx<_len; _idx++){
            if(_htSearchHistory.aData[_idx].sKeyword === _sKeyword){
                if(_htSearchHistory.aData[_idx].sCategoryName === ""){
                    _result = true;
                }else{
                    if(_htSearchHistory.aData[_idx].sCategoryName === _sCategoryName){
                        _result = true;
                    }
                }
            }
        }

        return _result;
    },

    /**
     * 로컬스토리지에 값 저장
     * @param {string} sType - "addKeyword", "removeKeyword"
     * @param {object} htData
     */
    setTheItem : function( sType, htData ){
        var _htSearchHistory = this.getTheItem(),
            _nDate = new Date(),
            _tmpSearchHistory = {
                sKeyword : htData.sKeyword,
                sCategoryName : htData.sCategoryName || "",
                sCategorySrl : htData.sCategorySrl || "",
                sUserViewTitle : htData.sUserViewTitle || "",
                //sTimestamp : _nDate.toDateString() + " @@" + _nDate.getTime(),
                sDate : _nDate.getMonth() + 1 + "." + _nDate.getDate()
            };

        switch(sType){
            case this.setItemFrom.addKeyword :
                if(_htSearchHistory !== null){
                    if(this.checkSameKeyword(_tmpSearchHistory)){
                        this.removeTheItem(_tmpSearchHistory, this.removeType.forAdd);
                        return;
                    }else{
                        _htSearchHistory = this.getTheItem();
                        if( _htSearchHistory.aData.length + 1 >= this.SAVE_MAX_COUNT ){
                            _htSearchHistory.aData.pop();
                        }
                        _htSearchHistory.aData.unshift(_tmpSearchHistory);
                    }
                }else{
                    _htSearchHistory.aData = [];
                    _htSearchHistory.aData.push(_tmpSearchHistory);
                }
                break;
            /**
             * removeTheItem 으로 제거후 로컬스토리지에 셋팅
             */
            case this.setItemFrom.removeKeyword :
                _htSearchHistory = htData
                break;
        }

        localStorage.setItem(this.SAVE_KEY, JSON.stringify(_htSearchHistory));
    },

    /**
     * Strin으로 저장되어 있는 로컬스트리지의 객체를 파싱하여 리턴
     */
    getTheItem : function(){
        var _oData = JSON.parse(localStorage.getItem(this.SAVE_KEY));
        if(_oData === null){
            _oData = {};
            _oData["aData"] = [];
        }
        return _oData;
    },

    /**
     * htData의 sKeyword 속성값과 일치하는 필드제거, sType은 검색시 추가되며 저장소의 기존 값을 제거하고 동일한 해당 값으로 추가하는 로직에 사용됨
     * @param {object} htData
     * @param {string} sType - "forAdd"
     */
    removeTheItem : function(htData, sType){
        var _htSearchHistory = this.getTheItem() || {},
            _sKeyword = htData.sKeyword,
            _sCategoryName = htData.sCategoryName || "",
            _len = _htSearchHistory.aData.length,
            _idx = 0,
            _rmIdx = null;

        for(_idx; _idx<_len; _idx++){
            if(_htSearchHistory.aData[_idx].sKeyword === _sKeyword && _htSearchHistory.aData[_idx].sCategoryName === _sCategoryName){
                _rmIdx = _idx;
            }
        }

        delete(_htSearchHistory.aData.splice(_rmIdx, 1));

        /**
         * 해당 메소드 두번째 파라미터로 "forAdd"라는 값이 들어오면 중복을 제거한 다음 다시 값을 넣는다.
         */
        if(sType === this.removeType.forAdd){
            _htSearchHistory.aData.unshift(htData);
        }

        this.setTheItem(this.setItemFrom.removeKeyword, _htSearchHistory);
    },

    /**
     * 로컬스토리지에서 키에 해당하는 값 전체 삭제
     * @param {string} sKEY
     */
    removeAllItems : function(sKEY){
        localStorage.removeItem(sKEY||this.SAVE_KEY);
    }
};
