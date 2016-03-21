/**
 * 딜 리스트를 가져오는 Class
 * 1. 지역선택 딜의 경우, 서버에서 딜 리스트를 소팅해서 받아오고, 다음 페이지 로딩도 서버에서 받아온다.
 * 2. 내주변 딜의 경우, 서버에서 전체 딜 번호 리스트를 받아오고, 소팅시에 javascript에서 소팅을 하고 딜정보를 ajax로 요청해서 받아온다, 다음페이지 로딩도 딜번호 리스트에서 잘라서 요청한다.
 */
var localDealList = function(htOptions){
    $.extend(this, htOptions);
    this.init();
};

localDealList.prototype = {
    DEAL_COUNT_PER_PAGE : 20, // 한번에 불러오는 딜 개수
    AD_BANNER_POSITION : 10, // X개 상품 이후에 AD 배너 표시
    nLoadedDealIndex : 0, // 현재 보여지고 있는 딜 인덱스
    aDealNumberList : [],
    LOCAL_LOCATION_COOKIE_NAME : "GEO_LOCAL",
    sCurrentDealListType : "", // "LOCAL_DEAL" : 지역선택 딜,  "NEAR_DEAL" : 내 주변 딜
    sCurrentCategoryNo : null, // 현재 로드중인 지역의 카테고리 넘버
    sCurrentOrder : null, //  현재 로드중인 지역의 소팅 방법
    nCurrentBizCategoryNo : 0,
    nLastSelectedBizCategoryNo : null,
    oAjax : null,
    oADBannerSwiper : false,
    oCollectionBannerSwiper : false,
    bRenderBestDeal : false,
    oADBannerInfo : {},
    oCollectionBannerInfo : {},

    init : function(){
        this.cacheElement();
        this.setEvent();
        this.setTemplate();
    },

    cacheElement : function(){
        this.welDealListPre = $("#_dealListPre");
        this.welDealListNext = $("#_dealListNext");
        this.welADBanner = $("#_adBannerList");
        this.welCollectionBanner = $("#_collection");
        this.welLoading = $("#_loading");
        this.wel2DepthCategory = $("#_sub_2dp");

        this.welWin = $(window);
        this.wfnScroll = $.proxy(this.onScroll, this);
    },

    reset : function(){
        this.welDealListPre.html("").hide();
        this.welDealListNext.html("").hide();
        this.welADBanner.find("ul:first").html("");
        this.welADBanner.hide();
        this.welCollectionBanner.hide();
        this.showLoading();
    },

    showLoading : function(){
        this.welLoading.show();
    },

    hideLoading : function(){
        this.welLoading.hide();
    },

    bindScroll : function(){
        this.welWin.bind("scroll", this.wfnScroll);
    },

    unbindScroll : function(){
        this.welWin.unbind("scroll", this.wfnScroll);
    },

    setEvent : function(){
    },

    setTemplate : function() {
        this.tplDealList = Handlebars.compile($("#dealTemplate").html());
        this.tplCollectionBannerList = Handlebars.compile($("#collectionTemplate").html());
        this.tplADBannerList = Handlebars.compile($("#adTemplate").html());
    },

    /**
     * 현재 지역선택 딜인지, 내 주변딜인지 반환
     * @returns {string}
     */
    getCurrentDealListType : function(){
        return this.sCurrentDealListType;
    },

    /**
     * 지역선택으로 받은 카테고리번호로 딜리스트를 가져온다.
     * @param sCategoryNo
     * @param sOrder {STRING} [DISTANCE, POPULAR, DATE]  = [거리순, 추천순, 최신순]
     * @param nDealOffset {NUMBER} 몇번째 딜부터 가져올 것인지.
     */
    getDealWithCategory : function(sCategoryNo, nBizCategoryNo, sOrder, nDealOffset, bOnlySortDeal){
        if(this.oAjax){
            this.oAjax.abort();
            this.oAjax = null;
        }

        this.unbindScroll();
        this.sCurrentDealListType = "LOCAL_DEAL"; // 지역선택 딜
        this.nCurrentBizCategoryNo = nBizCategoryNo || this.nCurrentBizCategoryNo;
        this.sCurrentCategoryNo = sCategoryNo || this.sCurrentCategoryNo;
        this.sCurrentOrder = sOrder || this.sCurrentOrder;

        this.oAjax = $.ajax({
            dataType : "json",
            url : TMON.local.htAPI.getDeal.replace("{categoryNo}", this.sCurrentCategoryNo).replace("{order}", this.sCurrentOrder),
            data : {
                bizcategorynos : this.nCurrentBizCategoryNo,
                nextOffset : nDealOffset
            },
            success: $.proxy(function(res){
                this.oAjax = null;
                this.aDealNumberList = null;
                this.nNextOffset = res.data.nextOffset; // 다음딜 offset값, 다음딜리스트를 가져올때 넘겨준다.
                this.bIsLastDeal = res.data.lastDeal; // 마지막 딜 리스트인지
                if(bOnlySortDeal) {
                    this.sortDealByCategory(res);
                } else {
                    if(nDealOffset === 0){ // 처음 페이지의 딜의 경우에만 베너, AD베너를 넣어준다.
                        this.processData(res);
                    }else{
                        this.renderDeal(res.data.dealList, this.welDealListNext);
                    }
                }
                this.hideLoading();
            },this)
        });
    },

    /**
     * Deafault 거리순으로 제공.
     **/
    getNearDeal : function(nBizCategoryNo, nLatitude, nLongitude){
        if(this.oAjax){
            this.oAjax.abort();
            this.oAjax = null;
        }

        this.unbindScroll();
        this.sCurrentDealListType = "NEAR_DEAL"; // 내 주변 딜
        this.nCurrentBizCategoryNo = nBizCategoryNo || this.nCurrentBizCategoryNo;
        this.nCurrentLatitude = nLatitude || this.nCurrentLatitude;
        this.nCurrentLongitude = nLongitude || this.nCurrentLongitude;

        this.oAjax = $.ajax({
            dataType : "json",
            url : TMON.local.htAPI.getNearDeal,
            data : {
                bizcategorynos : this.nCurrentBizCategoryNo,
                latitude : this.nCurrentLatitude,
                longitude : this.nCurrentLongitude
            },
            success: $.proxy(function(res){
                this.oAjax = null;
                this.aDealNumberList = null;
                this.processData(res);
                this.hideLoading();
            },this)
        });
    },

    /**
     * getDeal 로 받아오는 데이터를 처리한다.
     */
    processData : function(res){
        this.oHome.renderBizCategoryList(res.data.bizCategoryList, this.nLastSelectedBizCategoryNo);

        // 이전 선택한 bizCategory 번호가 있을 경우 해당 카테고리번호로 다시 호촐한다.
        if(this.nLastSelectedBizCategoryNo && this.isValidBizCategory(this.nLastSelectedBizCategoryNo)){
            if(this.sCurrentDealListType == "NEAR_DEAL"){
                this.getNearDeal(this.nLastSelectedBizCategoryNo, null, null);
            }else if(this.sCurrentDealListType == "LOCAL_DEAL"){
                this.getDealWithCategory(null, this.nLastSelectedBizCategoryNo, null, 0, false);
            }
            this.nLastSelectedBizCategoryNo = null;
            return;
        }

        if(this.sCurrentDealListType == "NEAR_DEAL"){
            this.aDealNumberList = res.data.sortList; // 딜번호 리스트
        }

        var aDealList = res.data.dealList;
        this.oADBannerInfo = res.data.adBannerList;
        this.oCollectionBannerInfo = res.data.bannerListResponse;

        // 처음 딜을 가지고 올 때, 딜 개수를 체크하여 세부업종카테고리 유/무를 나타낸다
        if(this.oHome.showDealStatusNotice(aDealList.length) === 0) {
            return;
        }

        this.showCollectionBanner();
        this.showDealList(aDealList, res.data.categoryNo);
        this.showADBanner();
    },

    showCollectionBanner : function() {
        if(this.oCollectionBannerInfo) {
            this.renderCollectionBanner(this.oCollectionBannerInfo.bannerList);
        } // 상단 콜렉션 베너
    },

    showADBanner : function() {
        this.renderADBanner(this.oADBannerInfo); // AD베너
    },

    showDealList : function(aDealList, nCatNo) {
        // 1. Deal List-Pre Render
        this.nLoadedDealIndex += aDealList.length;
        this.renderDeal(aDealList.slice(0, this.AD_BANNER_POSITION), this.welDealListPre, nCatNo);
        // 1-1 Deal List-Next Render
        if(aDealList.length > this.AD_BANNER_POSITION){ // 딜리스트 사이에 AD베너가 들어가기 때문에 딜리스트를 나눠준다.
            this.renderDeal(aDealList.slice(this.AD_BANNER_POSITION), this.welDealListNext, nCatNo);
        }
    },

    renderDeal : function(aDealList, welContainer, nCategoryNo){
        // 전국 BestDeal이 이미 노출 된 경우
        if(this.bRenderBestDeal) {
            this.welDealListPre.find("li").remove();
            this.bRenderBestDeal = false;
        }

        this.addDistanceToDealList(aDealList);

        welContainer.append(this.tplDealList({
            dealList : aDealList,
            categoryNo : nCategoryNo,
            www_m_dealDetail : TMON.local.htUri.dealDetail,
            sAppQueryN : TMON.local.htConnectEnvironment.sAppQueryN
        })).show();

        this.welLast = welContainer.find("li").last(); // 마지막 딜 엘리먼트
        this.nLastItemTop = this.welLast.length ? this.welLast.position().top : 0; // 로딩 위치 계산을 위해 마지막 딜아이템의 top 위치를 캐쉬한다.
        this.nLastItemHeight = this.welLast.length ? this.welLast.height() : 0; // 로딩 위치 계산을 위해 마지막 딜아이템의 height를 캐쉬한다.

        if(this.sCurrentDealListType == "NEAR_DEAL" && this.nLoadedDealIndex < this.aDealNumberList.length){
            this.bindScroll();
            this.onScroll();
        }else if(this.sCurrentDealListType == "LOCAL_DEAL" && this.bIsLastDeal === false){
            this.bindScroll();
            this.onScroll();
        }
    },

    renderCollectionBanner : function(aBannerList){
        if(!aBannerList || !aBannerList.length){
            this.welCollectionBanner.hide();
            return;
        }

        this.welCollectionBanner.html(this.tplCollectionBannerList({
            collectionList : aBannerList,
            uri : TMON.local.htUri,
            sAppQueryQ : TMON.local.htConnectEnvironment.sAppQueryQ,
            tl_collection_banner : TMON.local.htTLCodeDictionary.tl_collection_banner
        }));

        this.welCollectionBanner.show();
        this.initCollectionBannerSlider(aBannerList.length);
    },

    initCollectionBannerSlider : function(nBannerCnt) {

        if(this.oCollectionBannerSwiper) {
            this.oCollectionBannerSwiper.destroy();
            this.oCollectionBannerSwiper = null;
        }

        this.oCollectionBannerSwiper = new Swiper(this.welCollectionBanner,{
            pagination: '.index_area',
            paginationType: 'fraction',
            paginationFractionRender: function (swiper, currentClassName, totalClassName) {
                return '<strong class="' + currentClassName + '"></strong>' +
                    '<span>/' +
                    '<em class="' + totalClassName + '"></em>' +
                    '</span>';
            },
            loop : true
        });

        if(nBannerCnt == 1) {
            this.oCollectionBannerSwiper.lockSwipes();
        }
    },

    renderADBanner : function(aBannerList){
        if(!aBannerList || !aBannerList.length){
            this.welADBanner.hide();
            return;
        }
        this.welADBanner.html(this.tplADBannerList({
            bannerList : aBannerList,
            uri : TMON.local.htUri,
            sAppQueryQ : TMON.local.htConnectEnvironment.sAppQueryQ,
            tl_ad_banner : TMON.local.htTLCodeDictionary.tl_ad_banner
        }));
        this.welADBanner.show();
        this.initADBannerSlider(aBannerList.length);
    },

    initADBannerSlider : function(nBannerCnt) {
        if(this.oADBannerSwiper) {
            this.oADBannerSwiper.destroy();
            this.oADBannerSwiper = null;
        }

        this.oADBannerSwiper = new Swiper(this.welADBanner,{
            //pagination: '.swiper-pagination',
            //paginationType: 'fraction'
            pagination: '.swiper-pagination',
            paginationType: 'fraction',
            loop : true
        });

        if(nBannerCnt == 1) {
            this.oADBannerSwiper.lockSwipes();
        }
    },

    /**
     * 전국포커스 베스트10 딜 가져오기
     */
    getBestDeal : function(){
        this.unbindScroll();
        this.showLoading();

        $.ajax({
            dataType : "json",
            url : TMON.local.htAPI.getBestDeal,
            success: $.proxy(function(res){
                this.renderBestDeal(res.data);
            },this)
        });
    },

    renderBestDeal : function(aDealList){
        this.bRenderBestDeal = true;
        this.welDealListNext.find("li").remove();

        this.welDealListPre.html(this.tplDealList({
            dealList : aDealList,
            www_m_dealDetail : TMON.local.htUri.dealDetail,
            sAppQueryN : TMON.local.htConnectEnvironment.sAppQueryN
        })).show();
        this.hideLoading();
    },

    /**
     * 이전 선택한 bizCategory 번호가 있으면 저장한다.
     */
    setLastBizCategory : function(nBizCategory){
        this.nLastSelectedBizCategoryNo = nBizCategory;
    },

    isValidBizCategory : function(nBizCategoryNo){
        if(this.wel2DepthCategory.find("li[data-catno=" + nBizCategoryNo + "]").length){
            return true;
        }else{
            this.nLastSelectedBizCategoryNo = null;
            return false;
        }
    },

    /**
     * 딜번호에 저장된 거리를 딜리스트에 넣어준다.
     * @param aDealList
     */
    addDistanceToDealList : function(aDealList){
        if(!this.aDealNumberList){
            return;
        }

        for(var i= 0, max=aDealList.length; i<max ; i++){
            for(var idx= 0, max2=this.aDealNumberList.length; idx<max2; idx++){
                if(aDealList[i].dealNo == this.aDealNumberList[idx].dealNo){
                    var nDistance = this.aDealNumberList[idx].distance;
                    if(this.aDealNumberList[idx].distance < 1000) {
                        aDealList[i].distance = Math.round(nDistance) + 'm'; // 소수점 없이, 가장 가까운 정수를 올림하여 표시함.
                    } else {
                        aDealList[i].distance = (nDistance/1000).toFixed(1) + 'Km'; // Km 표시할 때, 소수점 첫번째 자리까지 표시(반올림(ㅇ))
                    }
                    //aDealList[i].distance = Math.round((this.aDealNumberList[idx].distance / 1000) * 100) / 100; // km 로 변환 및 소수 2째 자리까지만 표시
                    break;
                }
            }
        }
    },

    /**
     * 스크롤 시, 딜 리스트를 가지고 온다
     */
    loadNextNearDealList : function(){
        this.unbindScroll();
        this.getDealInfoByDealNo(this.aDealNumberList.slice(this.nLoadedDealIndex, this.nLoadedDealIndex + this.DEAL_COUNT_PER_PAGE),"scrollDeal");
        this.nLoadedDealIndex += this.DEAL_COUNT_PER_PAGE;
    },

    /**
     * 딜 번호를 소팅한다.
     * @param sSortName "date":날짜순, "distance" : 거리순, "popularity":인기순
     */
    sortDeal : function(sSortName){
        if(!this.aDealNumberList || !this.aDealNumberList.length){
            return;
        }
        // 1. Deal 배열을 정렬순에 맞추어 정렬한다.
        this.aDealNumberList.sort(function(oA, oB){
            if(sSortName == "date"){
                return parseInt(oB[sSortName], 10) - parseInt(oA[sSortName], 10);
            }else if(sSortName == "distance"){
                return oA[sSortName] - oB[sSortName];
            }else if(sSortName == "popularity"){
                return oB[sSortName] - oA[sSortName];
            }
        });

        // 2. Deal 번호에 따라서 정보를 가지고 온다.
        this.nLoadedDealIndex = 0;
        this.getDealInfoByDealNo(this.aDealNumberList.slice(this.nLoadedDealIndex, this.nLoadedDealIndex + this.DEAL_COUNT_PER_PAGE), "sortDeal");
    },

    /**
     * 딜 넘버 리스트에서 번호만 배열로 넘긴다.
     * @param aDealNumberList
     * @returns {Array}
     */
    getDealNosFromDealNumberList : function(aDealNumberList){
        var aDealNos = [];
        for(var i= 0, max=aDealNumberList.length; i<max; i++){
            aDealNos.push(aDealNumberList[i].dealNo);
        }
        return aDealNos;
    },

    /**
     * 딜번호로 딜정보 리스트를 가져온다.
     * @param aDealList
     */

    getDealInfoByDealNo : function(aDealNumberList, sCurrent){
        this.showLoading();

        var succesFuction = null;
        if(sCurrent == "sortDeal") {
            succesFuction = $.proxy(this.cbGetDealInfoBySort,this);
        } else if(sCurrent == "scrollDeal") {
            succesFuction = $.proxy(this.cbGetDealInfoByDealNo,this);
        }

        $.ajax({
            dataType : "json",
            url : TMON.local.htAPI.getDealInfo,
            data : {
                dealnos : this.getDealNosFromDealNumberList(aDealNumberList).join(",")
            },
            success: succesFuction
        });
    },

    /**
     * 딜 정보를 가지고 정렬 딜을 그린다.
     * */
    cbGetDealInfoBySort : function(res){
        this.hideLoading();
        //this.showCollectionBanner();
        if(this.oCollectionBannerInfo) {
            this.welCollectionBanner.show();
        }
        this.showDealList(res.data.dealList);
        this.showADBanner();
    },

    /**
     * 딜 정보를 가지고 다음 추가 딜을 그린다.
     **/
    cbGetDealInfoByDealNo : function(res){
        this.hideLoading();
        this.renderDeal(res.data.dealList, this.welDealListNext);
    },

    sortDealByCategory : function(res) {
        var aDealList = res.data.dealList;

        this.hideLoading();
        if(res.data.bannerListResponse){
            this.welCollectionBanner.show();
        }
        this.showDealList(aDealList, res.data.categoryNo);
        this.showADBanner();
    },

    /////////////////////////////////////
    //          Event Handler          //
    /////////////////////////////////////

    onScroll : function(){
        if(!this.nLastItemTop){
            return;
        }

        // 스크롤중 마지막 아이템의 위치가 마지막 아이템의 높이의 3배 정도 만큼 남을 정도로 스크롤이 되었을때 다음 딜리스트를 로드한다.
        if(this.welWin.scrollTop() + this.welWin.height() > this.nLastItemTop - (this.nLastItemHeight * 3)){
            this.nLastItemTop = 0;
            this.showLoading();
            if(this.sCurrentDealListType == "NEAR_DEAL"){
                this.loadNextNearDealList();
            }else if(this.sCurrentDealListType == "LOCAL_DEAL"){
                this.unbindScroll();
                this.getDealWithCategory(null, null, null, this.nNextOffset,false);
            }
        }
    }
};