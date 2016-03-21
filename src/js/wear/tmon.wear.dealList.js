/**
 * Wear DealList
 */

var wearDealList = function(htOptions){
	$.extend(this, htOptions);
	this.htOptions = htOptions;
	this.init();
};

wearDealList.prototype = {
	bLoadDealFromZero : false, // 딜 상세로 들어갔다가 리스트로 다시 왔을때 해당 딜까지 전부 로딩하도록 하기 위한 옵션

	init: function () {
		this.htPrevHash = {
				brandNoList : {},
				wearType : {},
				parentNo : '',
				categoryNo : '',
				listOrder : '',
				offset: 0
		};
		
		this.htCurrentHash = {
				brandNoList : [], //선택된 브랜드 list
				wearType : [], //선택된 상품 종류 (TICKET3, NORMAL)
				parentNo : '', // 3depth 카테고리 번호
				categoryNo : '', // 3depth일 수도 있고 4depth일 수도 있는, 선택된 마지막 카테고리번호
				listOrder : 'RECOMMEND', //정렬 (RECOMMEND, POPULAR), 정렬기준 default가 추천순
				offset : 0 //스크롤 시 다음 딜리스트를 불러오는 번호, this.htOptions.nMaxDealListCnt의 값만큼 높아진다.
		};

		this.bIsEmptyHash = document.location.hash.replace("#", "") == ""; // 다른메뉴에서 처음 진입했을때(해쉬가 빈값)과 뒤로 가기로 진입했을 때를 구별하기 위한 플래그
		this.cacheElement();
		this.setEvent();
		this.setTemplate();
		this.getOptionDataFromHash();
		this.initHash();
		this.filterLayerSync();
		this.brandIntroInit();
		this.initSwiper();
	},

	cacheElement: function () {
        this.welWin = $(window);
        this.wfnScroll = $.proxy(this.onScroll, this);
        this.welDealListContainer = $(".deal_lst > ul");
        this.welCategoryContainer = $("#childCategory");
        this.welBrandCategoryContainer = $(".category_bar");
        this.welBrandParentCategory = this.welBrandCategoryContainer.find(".depth2_wrapper");
        this.welBrandChildCategory = this.welBrandCategoryContainer.find(".depth3_wrapper");
        this.welBrandBtnParentCategory = this.welBrandCategoryContainer.find("#btnBrandParent");
        this.welBrandBtnChildCategory = this.welBrandCategoryContainer.find("#btnBrandChild");
    	this.welTicketParentCategory = $("#ticketParentCategory > ul");
    	this.welTicketChildCategory = $("#ticketChildCategory > ul");
		this.welFilterContainer = $(".deal_filter");
		this.welDealTotalNum = this.welFilterContainer.find(".num em");
		this.welSortSelector = this.welFilterContainer.find('#sortMethod');
		this.welSortSelectedText = this.welSortSelector.siblings('.select_dp');
		this.welWearTypeSelector = this.welFilterContainer.find('#wearTypeMethod');
		this.welWearTypeSelectedText = this.welWearTypeSelector.siblings('.select_dp');
		this.welFilterLayerShowBtn = this.welFilterContainer.find('.btn_filter');
		this.welFilterSelectedCnt = this.welFilterLayerShowBtn.find('span');
        this.welFilterLayerContainer = $("#_optionSelectLayer");
        this.welFilterBrandCheckList = $("#brandCheckList");
        this.welFilterWearTypeCheckList = $("#wearTypeCheckList");
        this.welFilterLayerBtnArea = this.welFilterLayerContainer.find('.ly_footer');
        this.welDealNone = $(".deal_none");
	},
	
	setEvent: function () {
		this.welCategoryContainer.on("click", "a", $.proxy(this.getChildDealList, this)); // 카테고리 리스트 4depth 선택
		this.welBrandParentCategory.on("click", "a", $.proxy(this.clickBrandParent, this)); // 브랜드 리스트 3depth 선택
		this.welBrandChildCategory.on("click", "a", $.proxy(this.clickBrandChild, this)); // 브랜드 리스트 4depth 선택
		this.welBrandBtnParentCategory.on("click", $.proxy(this.clickBrandCategoryBtn, this)); // 브랜드 3depth 리스트 오픈
		this.welBrandBtnChildCategory.on("click", $.proxy(this.clickBrandCategoryBtn, this)); // 브랜드 4depth 리스트 오픈
		this.welTicketParentCategory.on("click", "a", $.proxy(this.clickTicketParent, this)); // 티켓 리스트 3depth 선택
		this.welTicketChildCategory.on("click", "a", $.proxy(this.getChildDealList, this)); // 티켓 리스트 4depth 선택
		this.welSortSelector.on("change", $.proxy(this.sortChange, this)); // 최신순, 인기순,..
		this.welWearTypeSelector.on("change", $.proxy(this.sortChange, this)); // 브랜드 리스트의 상품 타입별
		this.welFilterLayerShowBtn.on("click", $.proxy(this.filterLayerShow, this)); // 필터 레이어 띄우기
        this.welFilterLayerContainer.on("click", ".btn_detail_cancel", $.proxy(this.filterLayerHide, this)); // 필터 레이어 닫기
        this.welFilterLayerBtnArea.on("click", ".confirm", $.proxy(this.filterLayerChange, this)); // 필터 레이어 옵션적용
        this.welFilterLayerBtnArea.on("click", ".cancel", $.proxy(this.filterLayerInit, this)); // 필터 레이어 전체해제
        this.welWin.hashchange($.proxy(this.hashchanger, this)); //해쉬변경

		this.welDealListContainer.on("click", "a", $.proxy(this.onClickDealItem, this));
	},
	
    setTemplate: function(){
        this.tplList = Handlebars.compile($("#" + this.welDealListContainer.attr("data-template-id")).html()); // 딜 아이템
    },
    
    setChildCategoryTemplate: function(){
        this.tplChildCategoryList = Handlebars.compile($("#" + this.welTicketChildCategory.attr("data-template-id")).html()); // 브랜드&티켓 리스트의 4뎁스
    },
    
    bindScroll : function(){
        this.welWin.bind("scroll", this.wfnScroll);
    },

    unbindScroll : function(){
        this.welWin.unbind("scroll", this.wfnScroll);
    },
	
    hashchanger: function(){
        this.getOptionDataFromHash();
        this.filterLayerSync();
        
        if(this.htPrevHash.brandNoList != this.htCurrentHash.brandNoList || 
        		this.htPrevHash.wearType != this.htCurrentHash.wearType || 
        		this.htPrevHash.parentNo != this.htCurrentHash.parentNo || 
        		this.htPrevHash.categoryNo != this.htCurrentHash.categoryNo || 
        		this.htPrevHash.listOrder != this.htCurrentHash.listOrder){

			var sPrevScrollTop = TMON.util.getCookie("PREV_SCROLLTOP");
			var sPrevOffset = TMON.util.getCookie("PREV_OFFSET");
			if(this.bIsEmptyHash) { //this.sOriginalHash 값이 빈값이면 초기 진입한것이므로 이전 쿠키 데이터를 지워준다.
				TMON.util.setCookie("PREV_SCROLLTOP", "", {path : '/', expires : 1});
				TMON.util.setCookie("PREV_OFFSET", "", {path : '/', expires : 1});
			}else if(this.bIsEmptyHash == false && sPrevScrollTop && sPrevOffset){ //딜 클릭시 상세페이지 갔다가 뒤로오면 보고 있던 딜 위치로 이동하기 위해 해쉬에 값을 저장한 후 이동한다.
				TMON.util.setCookie("PREV_SCROLLTOP", "", {path : '/', expires : 1});
				TMON.util.setCookie("PREV_OFFSET", "", {path : '/', expires : 1});
				this.htCurrentHash.offset = parseInt(sPrevOffset, 10);
				this.nScrollTopPos = parseInt(sPrevScrollTop, 10);
				this.bLoadDealFromZero = true;
			}
			this.bIsEmptyHash = false;
			this.getDealInfo(true);
        }

        this.htPrevHash = {
				brandNoList : this.htCurrentHash.brandNoList,
				wearType : this.htCurrentHash.wearType,
				parentNo : this.htCurrentHash.parentNo,
				categoryNo : this.htCurrentHash.categoryNo,
				listOrder : this.htCurrentHash.listOrder
		}
    },

	/**
	 * 딜 클릭시 상세페이지 갔다가 뒤로오면 보고 있던 딜 위치로 이동하기 위해 해쉬에 값을 저장한 후 이동한다.
	 */
	onClickDealItem : function(){
		TMON.util.setCookie("PREV_SCROLLTOP", this.welWin.scrollTop(), {path : '/', expires : 1});
		TMON.util.setCookie("PREV_OFFSET", this.htCurrentHash.offset, {path : '/', expires : 1});
	},

    /**
     * URL 의 hash data 를 기반으로 필요한 정보들을 this 의 메모리에 세팅한다.
     */
    getOptionDataFromHash : function (){
    	var nBrandNoLength = 0;
    	var nWearTypeLength = 0;
    	this.hashData = TMON.wear.oHashbang.getState();

		if(this.hashData.brandNoList){
			this.htCurrentHash.brandNoList = this.hashData.brandNoList.split(",");
			nBrandNoLength = this.htCurrentHash.brandNoList.length;
		}else{
			this.htCurrentHash.brandNoList = "";
		}
		if(this.hashData.wearType) {
			this.htCurrentHash.wearType = this.hashData.wearType.split(",");
			nWearTypeLength = this.htCurrentHash.wearType.length;
	    	this.welWearTypeSelector.val(this.hashData.wearType);
		}else{
			this.htCurrentHash.wearType = "";
	    	this.welWearTypeSelector.val("ALL");
		}
		this.welWearTypeSelectedText.text(this.welWearTypeSelector.find("option:selected").text());
		if(this.hashData.listOrder){
			this.htCurrentHash.listOrder = this.hashData.listOrder;
			this.welSortSelector.val(this.hashData.listOrder);
	    	this.welSortSelectedText.text(this.welSortSelector.find("option:selected").text());
		}
		
		if(this.hashData.categoryNo) {
		    this.htCurrentHash.categoryNo = this.hashData.categoryNo;
		}else if(this.htOptions.nCurCategoryNo){
		    this.htCurrentHash.categoryNo = this.htOptions.nCurCategoryNo;
		}else{
		    this.htCurrentHash.categoryNo = this.htOptions.nAllCategoryNo;
		}
		
		if(this.hashData.parentNo) {
			this.htCurrentHash.parentNo = this.hashData.parentNo;
		}else{
			this.htCurrentHash.parentNo = this.htOptions.n3depthCategoryNo;
		}

		if(this.htOptions.sCurrentPage == this.htOptions.htViewName.categoryList){ // 현재 페이지가 카테고리 딜리스트인지 검사
	    	this.nFilterCnt = nBrandNoLength + nWearTypeLength;
	    	this.listAddClass(this.welCategoryContainer.find("li.on"), this.welCategoryContainer.find("a[data-no="+this.htCurrentHash.categoryNo+"]"));
		}else if(this.htOptions.sCurrentPage == this.htOptions.htViewName.ticketList){ // 현재 페이지가 티켓 딜리스트인지 검사
		    if(this.htOptions.nTicketNo === "3") {
		    	this.htCurrentHash.wearType[0] = "TICKET3";
		    }
	    	this.nFilterCnt = nWearTypeLength;
	        this.setChildCategoryTemplate();
        	this.getCategoryInfo();
        	
		}else if(this.htOptions.sCurrentPage == this.htOptions.htViewName.brandList){ // 현재 페이지가 브랜드 딜리스트인지 검사
	        $("body").click($.proxy(function(){ //바디클릭 시 브랜드 리스트의 카테고리 바 닫기
	        	this.welBrandBtnParentCategory.removeClass("open");
	        	this.welBrandBtnChildCategory.removeClass("open");
	        }, this));
	        
	        this.htCurrentHash.brandNoList = this.htOptions.nCurBrandNo;
			if(!this.hashData.listOrder){
				this.htCurrentHash.listOrder = "POPULAR"; // 브랜드 리스트에서만 정렬기준 default가 인기순
			}

	        if(this.htCurrentHash.parentNo !== ""){
	    		this.categorySync(this.welBrandChildCategory, this.welBrandParentCategory, true);
	        }else{
	        	this.htCurrentHash.parentNo = this.htOptions.nAllCategoryNo;
	        }
		}
    },
    
    /**
     * 카테고리 가로터치그랩(스와이퍼)을 구현한다.
     */
    initSwiper: function () {
    	this.oDepth3Swiper = new Swiper(".depth3_w", {
    	    slidesPerView: 'auto',
    	    grabCursor: true,
    	    setWrapperSize: true    
    	});
    	this.oDepth4Swiper = new Swiper(".depth4_w", {
    	    slidesPerView: 'auto',
    	    grabCursor: true,
    	    setWrapperSize: true    
    	});
    },
    
    /**
     * 첫 접속시 서버에서 내려온 데이터와 이미 해쉬에 있는 값들을 조합하여 가장 최신의 데이터 셋을 만들고, 이를 Hash 에 반영한다.
     */
    initHash : function (){
    	var sRandomString = Math.floor(Math.random() * 100000000) + 1;
    	TMON.wear.oHashbang.setState("",{"brandNoList":this.htCurrentHash.brandNoList, "wearType":this.htCurrentHash.wearType, "parentNo":this.htCurrentHash.parentNo, "categoryNo":this.htCurrentHash.categoryNo, "listOrder":this.htCurrentHash.listOrder, "layer":"close", "ran":sRandomString});
    },

    /**
     * 딜리스트 결과값을 호출한다. 호출 후 cbDealInfo 메서드를 호출하여 그 결과를 렌더링한다.
     * @param bListClear
     */
    getDealInfo: function(bListClear){
    	this.bListClear = bListClear;
    	$.ajax({
    		url: TMON.wear.htAPI.getDealList.replace('{categoryNo}', this.htCurrentHash.categoryNo),
			contentType: 'application/json;charset=UTF-8',
			dataType: 'json',
    		data : {
				"brandNoList[]" : this.htCurrentHash.brandNoList,
				"wearType[]" : this.htCurrentHash.wearType,
				listOrder : this.htCurrentHash.listOrder,
				offset : this.htCurrentHash.offset,
				fromZeroToOffset : this.bLoadDealFromZero
			},
	        success : $.proxy(this.cbDealInfo, this),
	        error : $.proxy(function(jqXHR, textStatus){
	        	alert('일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주십시오.');
	            if(textStatus == "abort"){
	                return;
	            }
	        }, this)
    	});
    },

    /**
     * AJAX Call 을 통해 얻어온 데이터를 기반으로 화면 UI를 컨트롤한다.
     * @param res
     */
    cbDealInfo: function(res){
		this.bLoadDealFromZero = false;
    	// 응답에서 data 없이 돌아오는 서버쪽 버그가 있음. 이런 상황에서만 data 를 가상으로 만들어줌.
    	if (!res.data){
    		res.data = {
    			totalCount : 0,
    			deals : ''
    		};
    	}
    	
		this.unbindScroll();
        
    	if(this.bListClear == true){
    		this.welDealTotalNum.text(res.data.totalCount);
    	}
    	this.welDealNone.hide();
        this.renderDealList(res.data, this.bListClear);

		if(this.nScrollTopPos){ // 딜상세에서 뒤로 가기 했을때 리스트에서 미리 저장해 둔 scroll Top 값이 있는 경우 이동한다.
			var _nScrollPos = this.nScrollTopPos;
			var _welWin = this.welWin;
			var _welDealListContainer = this.welDealListContainer.parents("div.deal_lst");
			var _nIntervalCounter = 0;

			var nInterval = setInterval(function(){

				// 느린 단말기에서 렌더링이 끝나기전에 scroll을 시도하는 경우가 생겨, 인터벌로 container높이를 측정하여 0보다 크면 로딩이 되었다고 판단한다.
				if(_welDealListContainer.height() > 0){
					_welWin.scrollTop(_nScrollPos);
					clearInterval(nInterval);
				}

				if(_nIntervalCounter++ > 50){
					clearInterval(nInterval);
				}
			}, 100);

			this.nScrollTopPos = 0;
		}
        
        this.welLast = this.welDealListContainer.find("li").last();
        this.nLastItemTop = this.welLast.length ? this.welLast.offset().top : 0; // 로딩 위치 계산을 위해 마지막 딜아이템의 top 위치를 캐쉬한다.
        this.nLastItemHeight = this.welLast.length ? this.welLast.height() : 0; // 로딩 위치 계산을 위해 마지막 딜아이템의 height를 캐쉬한다.
        if(res.data.deals.length == 0 || res.data.totalCount < this.htOptions.nMaxDealListCnt) {
        	return;
        }
        
        this.bindScroll();
        this.onScroll();
    },
    
    /**
     * 티켓 딜리스트에서, 3Depth 내비게이션을 선택했을 때 4Depth 내비게이션 내용을 받아온다.
     */
    getCategoryInfo: function(){
    	$.ajax({
    		url: TMON.wear.htAPI.getCategory.replace('{}', this.htCurrentHash.parentNo),
			contentType: 'application/json;charset=UTF-8',
			dataType: 'json',
    		data: {
				"wearType[]" : this.htCurrentHash.wearType
    		},
	        success : $.proxy(this.renderCategory, this),
	        error : $.proxy(function(jqXHR, textStatus){
	            if(textStatus == "abort"){
	                return;
	            }
	        }, this)
    	});
    },
    
    /**
     * 티켓 딜리스트 4depth 내비게이션을 렌더링한다.
     * @param res
     */
    renderCategory: function(res){
        var sListHtml = this.tplChildCategoryList({
	        	aItems : res.data, 
	        	nParentNo : this.htCurrentHash.parentNo
        	});
        this.welTicketChildCategory.html(sListHtml);
        this.categorySync(this.welTicketChildCategory, this.welTicketParentCategory, false);
    },
    
    /**
     * 다음 딜 리스트를 가져온다.
     */
    loadNextDealList : function(){
		var nCurrentOffset = this.htCurrentHash.offset;
		var nMaxDealListCnt = this.htOptions.nMaxDealListCnt;
        this.htCurrentHash.offset = parseInt(nCurrentOffset) + parseInt(nMaxDealListCnt);
        this.getDealInfo(false);
    },
    
    onScroll : function(){
        if(!this.nLastItemTop){
            return;
        }

        // 스크롤중 마지막 아이템의 위치가 마지막 아이템의 높이의 5배 정도 만큼 남을 정도로 스크롤이 되었을때 다음 딜리스트를 로드한다.
        if(this.welWin.scrollTop() + this.welWin.height() > this.nLastItemTop - (this.nLastItemHeight * 5)){
            this.nLastItemTop = 0;
            this.loadNextDealList();
        }
    },
    
    /**
     * 딜리스트를 렌더링하여 화면에 붙인다.
     * @param aData
     * @param bListClear
     */
    renderDealList: function(aData, bListClear){

    	var welDealListContainer = $(this.welDealListContainer);
    	
    	if(bListClear){
    		this.welDealListContainer.empty();        	
        }
    	
    	if(aData.totalCount > 0){
	        var sListHtml = this.tplList({
		        	aItems : aData.deals,
		        	nTicketDealPrice : this.htOptions.nTicketDealPrice,
		        	nHurryCnt : this.htOptions.nHurryCnt, 
		        	sAppQueryQ : this.htOptions.htConnectEnvironment.sAppQueryQ
	        	});
	
	        if(bListClear){
	            this.welDealListContainer.html(sListHtml);        	
	        }else{
	            this.welDealListContainer.append(sListHtml);        	
	        }
    	}
        
        // 렌더링이 끝난 후, 딜리스트에 딜이 없으면 (= 지금까지 누적된 요청에 돌아온 딜의 갯수가 0이면) 상품이 없습니다 UI 를 노출시킴
        if(welDealListContainer.find('li').length == 0){
	    	this.welDealTotalNum.text(0);
			this.welDealNone.show();
		}
    },
    
    /**
     * 브랜드 딜리스트의 4 depth 를 오픈한다.
     */
    clickBrandCategoryBtn: function(e){
    	var sTargetID = $(e.currentTarget).attr("id");
    		
    	if($(e.currentTarget).hasClass("disable")){
        	return true;
    	}
    	$(e.currentTarget).toggleClass("open");
    	
    	if(sTargetID == this.welBrandBtnChildCategory.attr("id")){
    		this.welBrandBtnParentCategory.removeClass("open");
    	}else if(sTargetID == this.welBrandBtnParentCategory.attr("id")){
    		this.welBrandBtnChildCategory.removeClass("open");
    	}
    	
    	return false;
    },
    
    /**
     * 브랜드 딜리스트의 4 depth 내비게이션을 활성화한다.
     */
    brandChildEnable: function(){
		var $childList = this.welBrandChildCategory.find("li");
		
		this.welBrandChildCategory.removeClass("disable");
		this.welBrandBtnChildCategory.removeClass("disable");
		this.welBrandBtnChildCategory.removeClass("open");
		$childList.hide();
		$childList.eq(0).show();
		this.welBrandChildCategory.find("li[name="+this.htCurrentHash.parentNo+"]").show();
    },
    
    /**
     * 티켓 딜리스트의 3Dpeth 내비게이션을 클릭했을 때 발생하며, 4Depth 내비게이션 데이터를 받아오기 위한 getCategoryInfo 메서드를 호출한다.
     */
    clickTicketParent: function(we){
    	var $target = $(we.target),
    		nCategoryNo = $target.data("no");
    	
    	if(typeof nCategoryNo === "number"){ //티켓리스트의 첫번째는 3Depth의 카테고리가 아니고 메인으로가는 링크이기 때문에 조건을 걸어줌
    		this.htCurrentHash.offset = 0;
        	this.listSelect(this.welTicketParentCategory, nCategoryNo, $target);
        	TMON.wear.oHashbang.setState("",{"parentNo":this.htCurrentHash.categoryNo, "categoryNo":this.htCurrentHash.categoryNo});
        	this.htCurrentHash.parentNo = this.htCurrentHash.categoryNo;
        	this.getCategoryInfo();
    		return false;
    	}
    },
    
    /**
     * 브랜드 딜리스트의 4 depth 내비게이션을 클릭했을 때, 클릭한 정보를 Hash 에 넣는다. 
     * @param we
     * @returns {Boolean}
     */
    clickBrandChild: function(we){
    	var $target = $(we.target),
    		$selected = this.welBrandChildCategory.find("li.on");
    	
    	this.htCurrentHash.categoryNo = $target.data("no");
    	
    	if(this.htCurrentHash.categoryNo == "all"){
    		this.htCurrentHash.categoryNo = this.welBrandParentCategory.find("li.on a").data("no");
    	}
    	this.htCurrentHash.offset = 0;
    	this.welBrandBtnChildCategory.text($target.text());
    	this.listAddClass($selected, $target);
		TMON.wear.oHashbang.setState("",{"categoryNo":this.htCurrentHash.categoryNo});
		this.welBrandBtnChildCategory.removeClass("open");
        
    	return false;
    },
    
	/**
	 * 모든 딜리스트 내비게이션에서 모두 사용되며, 내비게이션 요소가 클릭되면 호출된다. 해당 엘리먼트를 this.listAddClass 메서드에 매개변수로 지정하기 위해 사용한다.
	 * @param eWrap
	 * @param nCatNo
	 * @param eTarget
	 */
    listSelect: function(eWrap, nCategoryNo, eTarget){
    	var $selected = eWrap.find("li.on");
    	
    	this.htCurrentHash.categoryNo = nCategoryNo;
    	this.htCurrentHash.parentNo = nCategoryNo;
    	this.listAddClass($selected, eTarget);
    },
    
    /**
     * 매개변수로 지정된 elTarget 엘리먼트에 addClass('on') 을 하기위해 존재하며, 기존에 선택되어 있었던 엘리먼트를 elSelected 변수로 받아, 해당 엘리먼트의 on 클래스를 제거한다.
     * @param eSelected
     * @param eTarget
     */
    listAddClass: function(elSelected, elTarget){
    	elSelected.removeClass("on");
    	elTarget.parent("li").addClass("on");
    },
    
    /**
     * 옵션 레이어 안의 값들을 전부 false 상태로 초기화한다.
     */
    filterLayerInit: function(){
    	this.welFilterLayerContainer.find(".layer_list input[type=checkbox]").prop("checked",false);
    },
    
    /**
     * 옵션 레이어를 보여준다.
     */
    filterLayerShow: function(){
    	TMON.commonWear.layerOpen();
        this.welFilterLayerContainer.show();
    },
    
    /**
     * 옵션 레이어를 숨긴다.
     */
    filterLayerHide: function(){
    	this.filterLayerSync();	
    	history.back();
    },
    
    /**
     * 브랜드 딜리스트의 3 depth 내비게이션을 클릭했을 때 호출되며, 선택된 정보를 Hash 에 넣는다.
     * @param we
     * @returns {Boolean}
     */
    clickBrandParent: function(we){
    	var $target = $(we.target),
    		$selected = this.welBrandParentCategory.find("li.on"),
    		$childLst = this.welBrandChildCategory.find("li");
    		
    	this.htCurrentHash.parentNo = $target.data("no");
    	this.htCurrentHash.categoryNo = $target.data("no");
    	
    	this.htCurrentHash.offset = 0;
    	this.welBrandBtnParentCategory.text($target.text());
    	$childLst.eq(0).addClass("on");
    	this.welBrandBtnChildCategory.text($childLst.eq(0).find("a").text());
    	this.listAddClass($selected, $target);
    	TMON.wear.oHashbang.setState("",{"parentNo":this.htCurrentHash.categoryNo, "categoryNo":this.htCurrentHash.categoryNo});
    	if(this.htCurrentHash.categoryNo !== Number(this.htOptions.nAllCategoryNo)){
    		this.brandChildEnable();
    	}else{
    		this.welBrandChildCategory.addClass("disable");
    		this.welBrandBtnChildCategory.addClass("disable");
    	}
    	this.welBrandBtnParentCategory.removeClass("open");
        
    	return false;
    },
    
    /**
     * 카테고리 딜리스트와 티켓 딜리스트의 4depth 내비게이션을 클릭했을 때 호출, 클릭한 정보를 Hash 에 넣는다.
     * @param we
     */
    getChildDealList: function(we){
    	var $target = $(we.target),
    		$wrap = $(we.delegateTarget);
		
    	this.htCurrentHash.categoryNo = $target.data("no");
    	
    	this.htCurrentHash.offset = 0;
    	this.listSelect($wrap, this.htCurrentHash.categoryNo, $target);
		TMON.wear.oHashbang.setState("",{"categoryNo":this.htCurrentHash.categoryNo});
		return false;
    },
    
    /**
     * 정렬기준을 변경했을 때 호출되며, 정렬기준을 hash 에 넣는다.
     * @param we
     */
    sortChange: function(we){
		var $target = $(we.target),
			$selected = $target.find("option:selected");
		
		if($(we.delegateTarget).attr("id") === "sortMethod"){
			this.htCurrentHash.listOrder = $selected.val();
		}else{
			this.htCurrentHash.wearType = $selected.val();
		}
		this.htCurrentHash.offset = 0;
		$target.siblings('.select_dp').text($selected.text());
		TMON.wear.oHashbang.setState("",{"wearType":this.htCurrentHash.wearType, "listOrder":this.htCurrentHash.listOrder});
    },
    
    /**
     * 옵션변경 레이어 안의 값을 변경했을 때 호출되며, 변경한 옵션값 (브랜드 체크 리스트, wearType 체크 리스트) 를 Hash 에 넣는다.
     */
    filterLayerChange: function(){
    	var _this = this;
    	
    	_this.nFilterCnt = 0;
    	_this.htCurrentHash.brandNoList = [];
    	_this.htCurrentHash.wearType = [];
    	
    	_this.welFilterBrandCheckList.find("input[type=checkbox]:checked").each(function(i){
    		_this.htCurrentHash.brandNoList[i] = $(this).val();
		});
    	_this.welFilterWearTypeCheckList.find("input[type=checkbox]:checked").each(function(i){
    		_this.htCurrentHash.wearType[i] = $(this).val();
		});
    	
    	_this.nFilterCnt = _this.htCurrentHash.brandNoList.length + _this.htCurrentHash.wearType.length;
    	
    	if(_this.nFilterCnt > 0){
    		_this.welFilterSelectedCnt.text(" ( " + _this.nFilterCnt + " )");
    	}else{
    		_this.welFilterSelectedCnt.text("");
    	}
    	
	    if(_this.htOptions.nTicketNo === "3") {
	    	_this.htCurrentHash.wearType[0] = "TICKET3";
	    }
	    this.htCurrentHash.offset = 0;
	    
		TMON.wear.oHashbang.setState("",{"brandNoList":_this.htCurrentHash.brandNoList, "wearType":_this.htCurrentHash.wearType, "layer":""});
    },
    
    /**
     * hash data 의 선택된 값들을 딜리스트 옵션레이어의 UI에 반영한다.  
     */
    filterLayerSync: function(){
    	this.filterLayerInit();
    	
    	if(this.nFilterCnt > 0){
    		this.welFilterSelectedCnt.text(" ( " + this.nFilterCnt + " )");
    		for(var i=0; i<this.htCurrentHash.brandNoList.length; i++){
        		$("#b_"+this.htCurrentHash.brandNoList[i]).prop("checked",true);
    		}
    		for(var i=0; i<this.htCurrentHash.wearType.length; i++){
        		$("#pt_"+this.htCurrentHash.wearType[i]).prop("checked",true);
    		}
    	}else if(this.nFilterCnt == 0){
    		this.welFilterSelectedCnt.text("");
    		this.filterLayerInit();
    	}
    },
    
    /**
     * 브랜드 딜리스트와, 티켓 딜리스트에서 사용하며, hash data 의 선택된 값을 해당 페이지의 UI에 반영한다.
     * @param eChild
     * @param eParent
     * @param bBrand
     */
    categorySync: function(eChild, eParent, bBrand){
    	$(eParent).find("li").removeClass("on");
    	$(eChild).find("li").removeClass("on");
    	
    	$(eParent).find("a[data-no="+this.htCurrentHash.parentNo+"]").closest("li").addClass("on");
    	$(eChild).find("a[data-no="+this.htCurrentHash.categoryNo+"]").closest("li").addClass("on");
    	
		if(bBrand){
	    	this.welBrandBtnParentCategory.text($(eParent).find("a[data-no="+this.htCurrentHash.parentNo+"]").text());
	    	this.welBrandBtnChildCategory.text($(eChild).find("a[data-no="+this.htCurrentHash.categoryNo+"]").text());
	    	
	    	if(this.htCurrentHash.parentNo !== this.htOptions.nAllCategoryNo){
	    		this.brandChildEnable();
	    	}else{
	    		this.welBrandChildCategory.addClass("disable");
	    		this.welBrandBtnChildCategory.addClass("disable");
	    	}
	    	
	    	if(this.htCurrentHash.parentNo == this.htCurrentHash.categoryNo){
	        	this.welBrandBtnChildCategory.text(this.welBrandChildCategory.find("li").eq(0).find("a").text());
	        	this.welBrandChildCategory.find("li").eq(0).addClass("on");
	    	}
		}
    },

	/**
	 * Brand Intro 가 있을 경우, 해당 URL 을 callApp 해줌.
	 */
	brandIntroInit : function(){
		var welBrandIntroUrlWrapper = $('#_brandIntroUrl');
		var url = welBrandIntroUrlWrapper.text();
		// length  check로 다른 딜리스트에서는 노출되지 않게 처리함.
		if(welBrandIntroUrlWrapper.html() != '' && TMON.view_mode == 'app' && welBrandIntroUrlWrapper.length > 0){
			TMON.app.callApp('wear', 'showEventView', url);
		}
	}
};
