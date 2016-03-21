/**
 * 생활, 식품, 육아 페이지에 있는 arrow navigation control
 */
var martArrowNavi = function(){
    this.init();
};

martArrowNavi.prototype = {
    init : function(){
        this.cacheElement();
        this.setEvent();
    },

    cacheElement : function(){
        this.welNavi = $("#_arrowNavi");

        this.welMenu3depth = $("#_depth3"); // 3depth 메뉴, arrow메뉴중 좌측 메뉴
        this.welMenu4depth = $("#_depth4"); // 3depth 메뉴, arrow메뉴중 우측 메뉴

        this.welMenuName3depth = $("#_depth3Name");
        this.welMenuName4depth = $("#_depth4Name");

        this.welList3depth = $(".mart_3depth");
        this.welList4depth = $(".mart_4depth");
        $.template("4depthList", '<li class="${sSelectedClass}"><a href="#${sCategoryNumber}" tl:area="MML4" tl:ord="${order}">${name}</a></li>');
    },

    setEvent : function(){
        this.welMenu3depth.click($.proxy(function(e){this.onClickMenu(e, this.welList3depth); return false;}, this));
        this.welMenu4depth.click($.proxy(function(e){this.onClickMenu(e, this.welList4depth); return false;}, this));
        $("body").click($.proxy(this.onClickBody, this));

        this.welList3depth.on("click", "a", $.proxy(this.onClick3depthItem, this));
        this.welList4depth.on("click", "a", $.proxy(this.onClick4depthItem, this));
    },

    /**
     * 3,4 depth 메뉴 리스트를 숨긴다.
     */
    hideDepthList : function(){
        this.welList3depth.hide();
        this.welList4depth.hide();
    },

    /**
     * 3,4 depth 카테고리 값을 가지고 해당 카테고리를 선택 및 child category를 가져온다.
     * @param sCategory3depth
     * @param sCategory4depth
     */
    setCategoryNumber : function(sCategory3depth, sCategory4depth){
        this.sCurrentCategory3depth = sCategory3depth;
        this.sCurrentCategory4depth = sCategory4depth;

        this.set3depthNameWithCategoryNumber(sCategory3depth);

        // hash값이 있는 페이지에서 뒤로가기 -> Hash값이 없는 페이지로 이동했을때 hashchange이벤트 발생하면 값이 없는 상태로 된다.
        // 이때 전달받은 카테고리 값을 사용하는데(mart.htOption.sCategoryNo) 이때 4depth 메뉴가 열려 있으면 닫아주어야 한다.
        if(this.welList3depth.find(".selected a").attr("tl:ord") == "1"){
            this.hide4depthArrowNavi();
        }else{
            this.getChildrenCategory(sCategory3depth);
        }
    },

    /**
     * 메뉴 선택시 이벤트 핸들러
     * @param e
     * @param welList
     * @returns {boolean}
     */
    onClickMenu : function(e, welList){
        if(welList.is(":visible")){
            welList.hide();
            return false;
        }

        this.hideDepthList();
        welList.show();

        e.stopPropagation();
        return false;
    },

    onClickBody : function(){
        this.hideDepthList();
    },

    /**
     * 자식 카테고리 리스트를 가져온다.
     * depth : 0=자식 , 1=손자
     * @param sCategory
     */
    getChildrenCategory : function(sCategory){
        $.ajax({
            url : TMON.htAPI.htMart.getCategory + "/CAT_MOBILE/"+sCategory+"/children",
            data :{
                depth : 0
            },
            success : $.proxy(function(res){ this.set4depthList(res.data); }, this),
            error : function(jqXHR, textStatus){
                if(textStatus == "abort"){
                    return;
                }
                alert("잠시 후 다시 시도해주세요.");
                return;
            }
        });

    },

    /**
     * 넘겨받은 카테고리를 가지고 3depth 카테고리를 선택해 준다.
     * @param sCategoryNo
     */
    set3depthNameWithCategoryNumber : function(sCategoryNo){
        var welItems = this.welList3depth.find("a");
        this.welList3depth.find("li").removeClass("selected");

        for(var i = 0, max=welItems.length; i<max; i++){
            var sMenuCate = welItems.eq(i).attr("href").substring(1);
            if(sMenuCate == sCategoryNo){
                welItems.eq(i).parent("li").addClass("selected");
                this.welMenuName3depth.html(welItems.eq(i).text());
                break;
            }
        }
    },

    /**
     * 3depth 카테고리 리스트를 뿌려준다.
     * @param aData 3depth 카테고리 데이터
     */
    set4depthList : function(aData){
        var sHtml = $.tmpl("4depthList", {
            order : 1,
            sSelectedClass : this.sCurrentCategory4depth ? "" : "selected",
            sCategoryNumber : this.sCurrentCategory3depth,
            name : "전체"
        }).outerHTML();
        this.welMenuName4depth.html("전체");

        for(var i= 0, max=aData.length; i<max ;i++){
            var sSelectedClass = "";
            if(aData[i].no == this.sCurrentCategory4depth){
                sSelectedClass = "selected";
                this.welMenuName4depth.html(aData[i].name);
            }
            sHtml += $.tmpl("4depthList", {
                order : i+2,
                sSelectedClass : sSelectedClass,
                sCategoryNumber : this.sCurrentCategory3depth + "/" + aData[i].no,
                name : aData[i].name
            }).outerHTML();
        }

        this.welNavi.addClass("has_next");
        this.welMenu4depth.show();
        this.welList4depth.html(sHtml);
    },

    /**
     * 3depth 카테고리 리스트 선택시에 이벤트 핸들러
     * @param e
     */
    onClick3depthItem : function(e){
        var welTarget = $(e.target);
        this.welList3depth.find("li").removeClass("selected");
        welTarget.parent("li").addClass("selected");
        this.welMenuName3depth.html(welTarget.text());

        // 전체를 선택했을 경우 4depth 메뉴를 숨긴다.
        if(welTarget.attr("tl:ord") === "1"){
            this.hide4depthArrowNavi();
        }else{
            this.welNavi.addClass("has_next");
            this.welMenuName4depth.html("전체");
            this.welMenu4depth.show();
        }
    },

    onClick4depthItem : function(e){
        var welTarget = $(e.target);
        this.welList4depth.find("li").removeClass("selected");
        welTarget.parent("li").addClass("selected");
        this.welMenuName4depth.html(welTarget.text());
    },

    hide4depthArrowNavi : function(){
        this.welNavi.removeClass("has_next");
        this.welMenu4depth.hide();
    }
};
