var hotelPriceRangeSlider = function(htOption){
    $.extend(this, htOption);
    this.init();
};

hotelPriceRangeSlider.prototype = {
    welWrap : null,
    welLeftMarker : null,
    welRightMarker : null,
    welSlideBar : null,
    nMin : 0,
    nMax : 1000000,
    nUnit : 10000,
    nGapOfLeftAndRightMarker : 10000, // unit
    beforeRangeMove : function(){},
    onRangeMove : function(){},
    afterRangeMove : function(){},

    _bValueCalculated : false, // 모바일 슬라이더의 경우 숨겨져 있을때 width 값이 계산이 안되기 때문에, show했을때 한번 계산해준다.
    _bOnRotateCalculate : false, // 회전시에 width값이 변해서 재계산되어야 하나, 엘리먼트가 숨겨져있을 경우, show 됬을때 계산을 해준다.

    init : function(){
        this.bIsTouchDevice = this.isTouchDevice();
        this.cacheElement();
        this.setValue();
        if(this.bIsTouchDevice){
            this.setTouchEvent();
        }else{
            this.setClickEvent();
        }

        this._nLastLeftPrice = this.nMin;
        this._nLastRightPrice = this.nMax;

        this.welRightMarker.css("left", this.nMaxRange - this.nMarkerWidth);
    },

    cacheElement : function(){
        this.welDoc = $(document);
        this.wfnOnMouseMove = $.proxy(this.onMouseMove, this);
        this.wfnOnMouseUp = $.proxy(this.onMouseUp, this);

        // 기기가 회전할 경우 위치 계산을 다시한다.
        $(window).on("orientationchange", $.proxy(this.onRotate, this));
    },

    setValue : function(){
        this.nMaxRange = parseInt(this.welWrap.css("width"), 10);
        this.nMarkerWidth = parseInt(this.welLeftMarker.css("width"), 10);

        this.nTotalRangePixel = this.nMaxRange - this.nMarkerWidth * 2;
        this.nMinMarkerLeft = 0;
        this.nPixelPerPrice = this.nMarkerWidth / (this.nMax - this.nMin);
    },

    onShow : function(){
        if(this._bOnRotateCalculate == true){ // 회전시에 width값이 변해서 재계산되어야 하나, 엘리먼트가 숨겨져있을 경우, show 됬을때 계산을 해준다.
            this.recalRotate();
            this._bOnRotateCalculate = false;
            return;
        }

        if(this._bValueCalculated == true){
            return;
        }

        this.setValue();
        this.welRightMarker.css("left", this.nMaxRange - this.nMarkerWidth);
        this._bValueCalculated = true;
        this.setSlideBarWidth();
    },

    onRotate : function(){
        if(this.welWrap.is(":visible") == false){
            this._bOnRotateCalculate = true;
            return;
        }

        this.recalRotate();
    },

    recalRotate : function(){
        var nOldRange = this.nMaxRange - this.nMarkerWidth;
        var nNewRange = parseInt(this.welWrap.css("width"), 10) - this.nMarkerWidth;
        var nLeftMarkerPos = nNewRange * (parseInt(this.welLeftMarker.css("left"), 10) / nOldRange);
        var nRightMarkerPos = nNewRange * (parseInt(this.welRightMarker.css("left"), 10) / nOldRange);

        this.welLeftMarker.css("left", nLeftMarkerPos);
        this.welRightMarker.css("left", nRightMarkerPos);
        this.setValue();
        this.setSlideBarWidth();
    },

    setTouchEvent : function(){
        this.welLeftMarker.bind("touchstart", $.proxy(this.onMouseDownLeftMarker, this));
        this.welRightMarker.bind("touchstart", $.proxy(this.onMouseDownRightMarker, this));
   },

    setClickEvent : function(){
        this.welWrap.on("mousedown", ".leftSlider", $.proxy(this.onMouseDownLeftMarker, this));
        this.welWrap.on("mousedown", ".rightSlider", $.proxy(this.onMouseDownRightMarker, this));
    },

    onMouseDownLeftMarker : function(e){
        this.welMoveMarker = this.welLeftMarker;
        this.sMoveMakerName = "left";
        this.nCalMaxLeft = parseInt(this.welRightMarker.css("left"), 10) - this.nMarkerWidth - Math.ceil(this.nPixelPerPrice * this.nGapOfLeftAndRightMarker);
        this.nCalMinLeft = this.nMinMarkerLeft;
        this.nCalMinPos = 0;
        this.onMouseDown(e);
    },

    onMouseDownRightMarker : function(e){
        this.welMoveMarker = this.welRightMarker;
        this.sMoveMakerName = "right";
        this.nCalMaxLeft = this.nMaxRange - this.nMarkerWidth;
        this.nCalMinLeft = parseInt(this.welLeftMarker.css("left"), 10) + this.nMarkerWidth + Math.ceil(this.nPixelPerPrice * this.nGapOfLeftAndRightMarker);
        this.nCalMinPos = this.nMarkerWidth;
        this.onMouseDown(e);
    },

    onMouseDown : function(e){
        this.nInitPageX = this.bIsTouchDevice ? e.originalEvent.touches[0].pageX : e.pageX;
        this.nInitMarkerLeft = parseInt(this.welMoveMarker.css("left"), 10);

        if(this.bIsTouchDevice){
            this.welDoc.bind("touchmove", this.wfnOnMouseMove);
            this.welDoc.bind("touchend", this.wfnOnMouseUp);
        }else{
            this.welDoc.bind("mousemove", this.wfnOnMouseMove);
            this.welDoc.bind("mouseup", this.wfnOnMouseUp);
        }
        this.beforeRangeMove(this.sMoveMakerName);
        e.preventDefault();
    },

    onMouseMove : function(e){
        var nPageX = this.bIsTouchDevice ? e.originalEvent.touches[0].pageX : e.pageX;
        var nMarkerLeft = this.nInitMarkerLeft + (nPageX - this.nInitPageX);

        if(nMarkerLeft < this.nCalMinLeft){
            nMarkerLeft = this.nCalMinLeft;
        }else if(nMarkerLeft > this.nCalMaxLeft){
            nMarkerLeft = this.nCalMaxLeft;
        }

        this.welMoveMarker.css("left", nMarkerLeft);

        // 왼쪽 마카의 right 값 ~ 오른쪽 마커의 left값 사이의 길이로 값을 계산한다.
        var nVal = this.nMin + ((this.nMax - this.nMin) * (nMarkerLeft - this.nCalMinPos) / this.nTotalRangePixel); // 위치에 따라 값을 계산
        this.nValue = Math.floor(nVal / this.nUnit) * this.nUnit; // 단위 값으로 아래자리 숫자 0으로 만들어줌
        this.setSlideBarWidth();


        // left랑 right 마커 사이값이 만원 되어야 하는데, pixel로 정확히 처리가 안되서 다시 처리한다.
        if(this.sMoveMakerName == "left"){
            this.nValue = this.nValue >= this._nLastRightPrice ? this._nLastRightPrice - this.nGapOfLeftAndRightMarker : this.nValue;
            this._nLastLeftPrice = this.nValue;
        }else{
            this.nValue = this.nValue <= this._nLastLeftPrice ? this._nLastLeftPrice + this.nGapOfLeftAndRightMarker : this.nValue;
            this._nLastRightPrice = this.nValue;
        }

        this.onRangeMove(this.sMoveMakerName, this.nValue);
    },

    onMouseUp : function(){
        if(this.bIsTouchDevice){
            this.welDoc.unbind("touchmove", this.wfnOnMouseMove);
            this.welDoc.unbind("touchend", this.wfnOnMouseUp);
        }else {
            this.welDoc.unbind("mousemove", this.wfnOnMouseMove);
            this.welDoc.unbind("mouseup", this.wfnOnMouseUp);
        }
        this.afterRangeMove(this.sMoveMakerName, this.nValue);
    },

    setSlideBarWidth : function(){
        var nLeft = parseInt(this.welLeftMarker.css("left"), 10);
        var nWidth = parseInt(this.welRightMarker.css("left"), 10) - nLeft;

        this.welSlideBar.css({
            left : nLeft + this.nMarkerWidth / 2,
            width : nWidth
        });
    },

    isTouchDevice : function(){
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    }
};