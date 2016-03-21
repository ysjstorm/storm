/**
 * 지역 선택 페이지
 */
var localSelect = function(htOptions){
    $.extend(this, htOptions);
    this.init();
};

localSelect.prototype = {
    FAVORITE_LOCATION_CATNO_IDX : 1,                         // localStorage 지역 카트 번호 index
    nCategoryListHeight : 82,
    bIsLoadingCategory : false, // 카테고리 로딩 중인가?

    nParentTargetIdx : 0,

    init : function(){
        this.oLocalStorage = new locationStorage({oHome : this});
        this.cacheElement();
        this.setEvent();
        this.setTemplate();
    },

    cacheElement : function(){
        this.welParentCategory = $(".loc_1dp");
        this.welChildrenCategory = $(".loc_2dp");
        this.welBtnParentLocal = this.welParentCategory.find("button");
        this.nParentCategoryHeight = this.welParentCategory.height();
        this.nParentLocalPosition = "";
        this.nChildrenCategoryPosition = "";
    },

    setEvent : function(){
        this.welBtnParentLocal.click($.proxy(this.getChildrenLocalList, this));
        this.welChildrenCategory.on("click", "button", $.proxy(this.onClickFavoriteBtn, this));      // "즐겨찾기" 버튼
        this.welChildrenCategory.on("click", "a", $.proxy(this.onClickSelectLocationBtn, this));
        this.welParentCategory.on("click", "a", $.proxy(this.onClickSelectLocationBtn, this));
    },

    setTemplate: function () {
        this.tplChildrenCategory = Handlebars.compile($("#childrenCategoryList").html());
    },

    onClickSelectLocationBtn : function (e) {
        var welTarget = $(e.currentTarget),
            nTargetIdx = welTarget.attr("tl:ord"),
            sCatNo = welTarget.attr("data-no");
            htParams = {
                sLocationName : welTarget.find("span").text(),
                sCatNo : sCatNo
            };

        window.gaSendEvent('localGPS','click','local_area_depth1_'+nTargetIdx+'_depth2_'+ this.nParentTargetIdx,{
            'dimension7' : sCatNo
        });

        this.oLocalStorage.saveLastLocation(htParams);

        if(TMON.view_mode == "app"){
            TMON.app.callApp("webview", "closeWebViewMoveParent", e.currentTarget.href);
            return false;
        }
    },

    /**
     * 하위 지역 리스트를 가져옴
     */
    getChildrenLocalList : function(event){
        if(this.bIsLoadingCategory){
            return false;
        }

        this.bIsLoadingCategory = true;
        var welTarget = $(event.currentTarget),
            nTargetIdx = welTarget.attr("tl:ord");

        welTarget.parent().toggleClass("open").css("margin-bottom", "").siblings().removeClass("open").css("margin-bottom", "");

        if(welTarget.attr("data-position-x") == 0){
            this.nParentLocalPosition = 2;
        }else{
            this.nParentLocalPosition = welTarget.attr("data-position-x") -1;
        }

        this.welChildrenCategory.html("").css({"top" : "", "margin-top" : ""});
        this.nChildrenCategoryPosition = this.nParentCategoryHeight -(welTarget.attr("data-position-y") * this.nCategoryListHeight) -1;
        this.nParentTargetIdx = nTargetIdx;

        if(welTarget.parent().hasClass("open")){
            var parentNo = welTarget.attr("data-parent-no");
            // GA Code
            window.gaSendEvent('localGPS','click','local_area_depth1_'+nTargetIdx, {
                'dimension7' : parentNo
            });

            $.ajax({
                url: TMON.local.htAPI.getChildrenLocal.replace('{parentLocalCategoryNo}',parentNo),
                dataType: 'json',
                success : $.proxy(this.cbGetChildrenLocalList, this),
                error : $.proxy(function(jqXHR, textStatus){
                    alert('일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주십시오.');
                    if(textStatus == "abort"){
                        return;
                    }
                }, this)
            });
        } else {
            this.bIsLoadingCategory = false;
        }
    },

    cbGetChildrenLocalList : function(response){
        this.bIsLoadingCategory = false;
        if (response.httpStatus != "OK") {
            return false;
        }
        var data = response.data,
            htDataList = {
                aItems : data.children,
                emptyEl : data.count %3,
                sAppQueryQ : TMON.local.htConnectEnvironment.sAppQueryQ,
                tl_local_area_sub : TMON.local.htTLCodeDictionary.tl_local_area_sub,
                tl_local_preference_sub : TMON.local.htTLCodeDictionary.tl_local_preference_sub
            },
            welTargetParent = this.welParentCategory.find(".open"),
            nLoc2dpHeight = Math.ceil(data.count /3) * this.nCategoryListHeight;

        welTargetParent.css("margin-bottom", nLoc2dpHeight -4).siblings().css("margin-bottom", "");
        switch(this.nParentLocalPosition){
            case 0 :
                welTargetParent.next().css("margin-bottom", nLoc2dpHeight -4).next().css("margin-bottom", nLoc2dpHeight -4);
                break;
            case 1 :
                welTargetParent.next().css("margin-bottom", nLoc2dpHeight -4);
                welTargetParent.prev().css("margin-bottom", nLoc2dpHeight -4);
                break;
            case 2 :
                welTargetParent.prev().css("margin-bottom", nLoc2dpHeight -4).prev().css("margin-bottom", nLoc2dpHeight -4);
                break;
        }

        this.welChildrenCategory.css({"top" : -this.nChildrenCategoryPosition, "margin-top" : -(nLoc2dpHeight -3)}).html(this.tplChildrenCategory(htDataList)).children().eq(this.nParentLocalPosition).addClass("w_border_top");
        this.welChildrenCategory.find("li:nth-last-child(3)").addClass("border_bottom").next().addClass("border_bottom").next().addClass("border_bottom");
        this.showSelectedLocation();
    },

    /**
     *
     * 즐겨찾기에 저장된 지역을 체크한다
     */
    showSelectedLocation : function() {
        var selectLocList = $(".loc_2dp > li"),
            oFavoriteLocation = this.oLocalStorage.getFavoriteLocations();

        if(oFavoriteLocation.length > 0) {

            for(var idx=0; idx<selectLocList.length; idx++) {

                var childrenLoc = selectLocList[idx];

                for(var jdx=0; jdx<oFavoriteLocation.length; jdx++) {
                    if($(selectLocList[idx]).attr("data-no") == oFavoriteLocation[jdx][this.FAVORITE_LOCATION_CATNO_IDX]) {
                        $(childrenLoc).addClass("checked");
                    }
                }
            }
        }
    },

    /**
     *
     * 즐겨찾기 버튼을 클릭한 경우, 로컬스토리지에 저장한다
     */
    onClickFavoriteBtn : function(e) {

        var welTarget = $(e.currentTarget),
            nTargetIdx = welTarget.attr("tl:ord");
            welParents = welTarget.parents("li:first"),
            selectLoc = welParents.find("span:first").text(),
            locationNo = welParents.attr("data-no");

        bSelected = welParents.toggleClass("checked").hasClass("checked");

        window.gaSendEvent('localGPS','click','local_preference_depth1_'+nTargetIdx+'_depth2_'+this.nParentTargetIdx,{
            'dimension7' : locationNo
        });

        var params = {
            location : selectLoc,
            bSelect : bSelected,
            catNo : locationNo
        };

        this.oLocalStorage.setLocationListInStorage(params);

        if(TMON.view_mode == "app"){ // App 일 경우
            TMON.app.callApp('webview' , 'callJavascriptToParent', 'javascript:TMON.local.oLocal.updateFavoriteListFromApp()');
        }
    }
};