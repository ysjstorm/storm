
var headerControl = function(htOption){
    $.extend(this, htOption);
    this.init();
};

headerControl.prototype = {
    aHeaderInfo : [],

    init : function(){
        this.cacheElement();
        this.setEvent();
        this.addFixedWrap();
    },

    cacheElement : function(){
        this.welWin = $(window);
        this.welBody = $("body");
        this.welHeader = $("._fixHeader");
    },

    setEvent : function(){
        this.welWin.scroll($.proxy(this.onScroll, this));
    },

    addFixedWrap : function(){
        for(var i = 0, max = this.welHeader.length; i<max; i++){
            var wel = this.welHeader.eq(i);
            var nFixTop = parseInt(wel.attr("data-fixtop"), 10);

            wel.css("height", wel.height()); // 높이 값을 inline style로 넣어준다.
            var welFix = $("<div>").css({
                "position" : "fixed",
                "z-index" : "100",
                "background" : "#fff",
                "display" : "none",
                "width" : "100%",
                "box-shadow" : "0px 3px 6px -2px rgba(0, 0, 0, 0.25)",
                "top" : nFixTop
            }).appendTo(wel);

            this.aHeaderInfo.push({
                wel : wel, // 스크롤하면 fixed될 헤더
                welFix : welFix, // fixed 될때 헤더의 엘리먼트들이 이동하게 될 wrapper
                nFixTop : nFixTop, // fixed될 헤더가 여러개일경우 다른 fixed된 헤더랑 겹치지 않게 top값을 가져온다.
                nOffsetTop : wel.offset().top, // 헤더의 offset top값
                bFixed : false // fixed 됬는지 여부
            })
        }
    },

    onScroll : function(){
        var nScroll = this.welWin.scrollTop();

        for(var i = 0, max = this.aHeaderInfo.length; i<max; i++) {
            var htHeader = this.aHeaderInfo[i];

            if(nScroll >= htHeader.nOffsetTop - htHeader.nFixTop){
                this.fixHeader(htHeader);
            }else{
                this.unFixHeader(htHeader);
            }
        }
    },

    /**
     * fixed 할 경우 엘리먼트를 모두 fixed warp 엘리먼트로 옴겨준다.
     * @param htHeader
     */
    fixHeader : function(htHeader){
        if(htHeader.bFixed == true){
            return;
        }

        htHeader.wel.children().appendTo(htHeader.welFix);
        htHeader.welFix.show();
        htHeader.bFixed = true;
    },

    unFixHeader : function(htHeader){
        if(htHeader.bFixed == false){
            return;
        }

        htHeader.welFix.children().appendTo(htHeader.wel);
        htHeader.welFix.hide();
        htHeader.bFixed = false;
    }

};
