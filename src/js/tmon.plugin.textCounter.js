var textCounter = function(welTarget, welCounter, nLimit, bCountByByte){
    this.init(welTarget, welCounter, nLimit, bCountByByte);
};

textCounter.prototype = {
    welTarget : null,  // 실제 글이 입력되는 엘리먼트(input or textarea Element)
    welCounter : null, // 글 카운팅이 보여지게 될 엘리먼트
    nLimit : 200, // 제한 글자 수
    bCountByByte : false, // 바이트 단위로 계산할 것인가

    sInterval : null,
    init : function(welTarget, welCounter, nLimit, bCountByByte){
        this.welTarget = welTarget;
        this.welCounter = welCounter;
        this.nLimit = nLimit ? nLimit : this.nLimit;
        this.bCountByByte = bCountByByte;
        this.setEvent();
    },

    setEvent : function(){
        this.welTarget.keyup($.proxy(this.onKeyUp, this));
        if($.browser.mozilla){
            this.welTarget.focus($.proxy(this.onFocus, this));
            this.welTarget.blur($.proxy(this.onBlur, this));
        }
    },

    onKeyUp : function(){
        this.doCount();
    },

    onFocus : function(){
        if(this.sInterval){
            this.clearInterval();
        }
        this.sInterval = setInterval($.proxy(this.doCount, this), 10);
    },

    onBlur : function(){
        this.clearInterval();
    },

    clearInterval : function(){
        clearInterval(this.sInterval);
        this.sInterval = null;
    },

    doCount : function(){
        var sVal = this.welTarget.val();
        var nCount = this.bCountByByte ? this.countByByte(sVal) : this.countByLength(sVal);

        if(this.welCounter){
            this.welCounter.html(nCount);
        }
    },

    countByLength : function(sVal){
        var nCount = sVal.length;
        if(nCount >= this.nLimit){
            if($.browser.msie){ // IE의 경우 텍스트값을 대치한 후 키보드 입력시 값이 모두 사라지는 문제 수정
                alert(this.nLimit + "자 이하만 입력 가능합니다.");
            }

            this.welTarget.val(sVal.substring(0, this.nLimit));
            nCount = this.nLimit;
        }

        return nCount;
    },

    countByByte : function(sVal){
        var nCount = sVal.byte();
        if(nCount >= this.nLimit){
            if($.browser.msie){ // IE의 경우 텍스트값을 대치한 후 키보드 입력시 값이 모두 사라지는 문제 수정
                alert(Math.floor(this.nLimit/2) + "글자("+ this.nLimit +"byte)이하만 입력 가능합니다.");
            }

            this.welTarget.val(sVal.cutByte(this.nLimit));
            nCount = this.nLimit;
        }

        return nCount;
    }
};