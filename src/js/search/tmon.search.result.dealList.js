var searchResultInput = function () {
    this.init.apply(this, arguments);
}

searchResultInput.prototype = {
    bIsShowBottomUI: false,

    init: function (oSearchResult) {
        this.oSearchResult = oSearchResult;

        this.oPopularKeywords = new popularKeywords({
            htCommon: this.oSearchResult.htCommon
        });

        //this.oRecommendedDeal = new recommendedDeal({
        //    htCommon : this.oSearchResult.htCommon
        //});

        this.cachedTemplate();
        this.cachedElement();
        this.setEvent();

        if (this.oSearchResult.oModel.uvCatCode == "SM") {
            this.welBtnDeliveryPack.removeClass('off').addClass('on');
            var welInput = this.welBtnDeliveryPack.find('input:checkbox');
            welInput.prop('checked', true);
        }
    },

    cachedTemplate: function () {
        this.welObstacleTemplate = Handlebars.compile($("#_searchObstacleTmpl").html());
        this.welNoResultTemplate = Handlebars.compile($("#tmpl_noResult").html());
        this.welDealItemTemplate = Handlebars.compile($("#tmpl_dealItem").html());
    },

    cachedElement: function () {
        // 슈퍼마트 버튼
        this.welBtnDeliveryPack = $('#btn_group_delivery');
        this.welSep = this.welBtnDeliveryPack.next();

        // 딜리스트
        this.welWrapDealList = $('#wrap_dealList');
        this.welDealList = $('#dealList');
        this.welDealListInfo = $('#dealListInfo');
        this.welWrapSearchDetail = $('#wrap_btn_search_detail');

        // 속성랭킹 영역
        this.welSearchFilter = $('#searchFilter');

        // 상세검색및 슈퍼마트 버튼 영역
        this.welSearchDetail = $('#searchDetail');

        // 호텔 영역
        this.welHotelSearchUISection = $('.hotel_search_base');

        // 하단 추천 딜
        this.welRecommendDeal = $("#_recommendedDeal");

        // 인기검색어
        this.welPopularKeyword = $("#_popularKeyword");
    },

    setEvent: function () {
        /**
         * 묶음배송 버튼 이벤트
         */
        this.welBtnDeliveryPack.on('click', $.proxy(this.onBtnDeliveryGroup, this));
        /**
         * 아이템 리스트 :: Lazy Load 이벤트
         */
        $(window).on('touchmove scroll', $.proxy(this.onScrollDealList, this));
    },

    initView: function () {
        this.bIsEmptyList = false;
        this.bIsShowBottomUI = false;
        this.onLoadBottomUI();
        /**
         * 최초 InitView 시,
         * 딜리스트 UI를 비우고, 현재 페이지 1로 초기화
         */
        this.oSearchResult.oModel.totalCount = 0;
        this.oSearchResult.oModel.page = 1;
        this.welDealList.empty();
        this.loadDeals();
    },

    loadDeals: function () {
        if (this.oAjax) {
            this.oAjax.abort();
        }
        this.showBottomUI();

        if (this.isLastPage()) {
            //검색 결과 마지막 페이지 입니다.
            this.onLoadBottomUI();
            this.showBottomUI();
            return false;
        }

        if (this.bIsEmptyList) {
            //검색 결과 없음 페이지 입니다.
            this.onLoadBottomUI();
            this.showBottomUI();
            return false;
        }

        this.showDealList();

        var htCurrentModel = $.extend(true, {}, this.oSearchResult.oModel);

        var htAjaxOption = {};

        for (var key in htCurrentModel) {
            if (htCurrentModel.hasOwnProperty(key)) {
                switch (key) {
                    case "keyword":
                        htAjaxOption[key] = htCurrentModel[key];
                        break;
                    case "page":
                        htAjaxOption[key] = htCurrentModel[key];
                        break;
                    case "sort":
                        htAjaxOption[key] = htCurrentModel[key];
                        break;
                    case "order":
                        htAjaxOption[key] = htCurrentModel[key];
                        break;
                    case "attributes":
                        if (htCurrentModel[key].length != 0) {
                            htAjaxOption[key] = htCurrentModel[key].join(',');
                        }
                        break;
                    case "catSrl":
                        htAjaxOption[key] = htCurrentModel[key];
                        break;
                    case "uvCatCode":
                        htAjaxOption[key] = htCurrentModel[key];
                        break;
                    case "isDeliveryFree":
                        htAjaxOption[key] = htCurrentModel[key];
                        break;
                    case "totalCount":
                        htAjaxOption[key] = htCurrentModel[key];
                        break;
                    case "searchType":
                        htAjaxOption[key] = htCurrentModel[key];
                        break;
                    default:
                        break;
                }
            }
        }

        console.log(" 딜 리스트 :: ");
        console.log(htAjaxOption);

        this.oAjax = $.tmAjax({
            url: TMON.search.htAPI.commonSearch,
            method: "GET",
            dataType: 'JSON',
            data: htAjaxOption,
            success: $.proxy(this.renderTmpl, this),
            error: $.proxy(this.showErrorView, this),
            beforeSend: $.proxy(this.showDealLoad, this),
            //complete: $.proxy(this.ajaxComplete, this)
        })
    },

    showDealLoad: function () {
        $('#deal_loading').show();
        $('#deal_loading').find('img').hide();
        $('#deal_loading').find('span').hide();
        var nRandom = Math.floor(Math.random() * 2);  //0,1
        $('#deal_loading').find('img').eq(nRandom).show();
        console.log(nRandom * 2 + Math.floor(Math.random() * 2));
        $('#deal_loading').find('.txt_area>span').eq(nRandom * 2 + Math.floor(Math.random() * 2)).show(); //0,1,2,3
    },

    ajaxComplete: function () {
        $('#deal_loading').hide();
    },

    renderTmpl: function (res) {
        var aResData = res.data;

        this.oSearchResult.oModel.totalCount = aResData.total;

        //검색 결과가 있을 경우
        if (aResData.filteredTotal != 0) {
            this.hideErrorView();
            this.nCommonDealTotal = aResData.filteredTotal;

            this.welDealListInfo.html(this.oSearchResult.oModel.categoryName + ' <em>(' + TMON.util.numberWithComma(this.nCommonDealTotal) + ')</em>');

            this.drawCommonDeal(aResData);

            //속성필터 임시 제거
            this.welWrapDealList.show();
            this.welWrapSearchDetail.show();

            // EAN 호텔딜 관련 검색어일 경우, 호텔의 신 View 노출
            if (aResData.isEanKeyword) {
                // 앱일 경우에만, 호텔의 신 노출
                if (this.oSearchResult.htCommon.sExecutionEnviroment == "app") {
                    this.oSearchResult.oSearchHotel.initView(aResData.hasEanResult, aResData.eanAutocompleteInfo)
                }
            }

            // 묶음배송 정보가 있으면 노출, 없으면 비노출
            this.showSupermart(aResData);

        } else {
            // 검색 결과가 없을 경우
            this.bIsEmptyList = true;
            this.showBottomUI();
            this.showNoResultView();
        }

        $('#deal_loading').hide();
        this.oAjax = null;
    },

    drawCommonDeal: function (aResData) {
        aResData["keyword"] = this.oSearchResult.oModel.keyword;

        if (this.oSearchResult.htCommon.sExecutionEnviroment == "app") {
            aResData["isApp"] = true;
        }

        if (this.oSearchResult.oModel.hasOwnProperty("uvCatCode")) {
            aResData["uvCatCode"] = this.oSearchResult.oModel.uvCatCode.toUpperCase();
        }

        this.welDealList.append(this.welDealItemTemplate(aResData));
    },

    onBtnDeliveryGroup: function (we) {
        if (we != null) {
            we.preventDefault();
        }

        var welInput = this.welBtnDeliveryPack.find('input:checkbox');

        welInput.prop('checked', !welInput.prop('checked'));

        if (welInput.prop('checked')) {
            this.welBtnDeliveryPack.removeClass('off').addClass('on');
            this.oSearchResult.oModel.setCategory("SM");
            this.oSearchResult.oModel.setModelAttribute({
                attributes: [],
                categoryName: "슈퍼마트",
                isSuperMartDelivery: "Y"
            })
            this.oSearchResult.reloadAllView();

        } else {
            this.welBtnDeliveryPack.removeClass('on').addClass('off');
            this.oSearchResult.oModel.setCategory("");
            this.oSearchResult.oModel.setModelAttribute({
                attributes: [],
                categoryName: "전체",
                isSuperMartDelivery: "N"
            })
            this.oSearchResult.reloadAllView();
        }
    },

    onScrollDealList: function () {
        if (this.oAjax) {
            return false;
        }

        if ($(window).scrollTop() >= ($(document).height() - $(window).height()) * 0.85) {
            this.oSearchResult.oModel.page++;
            this.loadDeals();
        }
    },

    showNoResultView: function () {
        this.welSearchFilter.remove();
        this.welWrapDealList.hide();
        this.welSearchDetail.hide();
        this.welHotelSearchUISection.hide();

        $('#ct').prepend(this.welNoResultTemplate({
            searchKeyword: this.oSearchResult.oModel.keyword,
            viewNameIsHome: this.oSearchResult.htCommon.htValue.htViewName.home,
            appQuery: "?" + this.oSearchResult.htAppQuery.sAppQueryForRedirect
        }));
    },

    showErrorView: function () {
        $('#apiError').remove();

        this.bIsEmptyList = true;

        this.welSearchFilter.remove();
        this.welWrapDealList.hide();
        this.welSearchDetail.hide();
        this.welHotelSearchUISection.hide();

        if ($('#apiError').length != 0) {
            return false;
        }

        $('#ct').prepend(this.welObstacleTemplate({
            searchKeyword: this.oSearchResult.oModel.keyword,
            viewNameIsHome: this.oSearchResult.htCommon.htValue.htViewName.home,
            appQuery: "?" + this.oSearchResult.htAppQuery.sAppQueryForRedirect
        }));

        /**
         * 새로고침, 이전 버튼
         */
        this.welDealListRefresh = $('#dealListRefresh');
        this.welDealListPrev = $('#dealListPrev');
        this.welDealListRefresh.on('click', $.proxy(this.onDealListRefresh, this));
        this.welDealListPrev.on('click', $.proxy(this.onDealListPrev, this));

        this.oAjax = null;
    },

    isLastPage: function () {
        return $('.deal_list>li').size() != 0 && $('.deal_list>li').size() >= this.nCommonDealTotal;
    },

    showDealList: function () {
        if (this.welWrapDealList.is(':hidden')) {
            this.welWrapDealList.show();
        }
    },

    showSupermart: function (aResData) {
        // 슈퍼마트 버튼 노출 / 비노출
        if (aResData.isSuperMartDelivery) {
            this.welBtnDeliveryPack.show();
            this.welSep.show();
        } else {
            this.welBtnDeliveryPack.hide();
            this.welSep.hide()
        }

        if (this.oSearchResult.oModel.isSuperMartDelivery == "Y") {
            $('#btn_group_delivery').removeClass('off').addClass('on');
            $('#btn_group_delivery>input').prop('checked', true);
        } else {
            $('#btn_group_delivery').removeClass('on').addClass('off');
            $('#btn_group_delivery>input').prop('checked', false);
        }
    },

    showBottomUI: function () {
        //this.welRecommendDeal.show();
        this.welPopularKeyword.show();
    },

    onDealListRefresh: function (we) {
        we.preventDefault();
        location.href = location.href;
    },

    onDealListPrev: function (we) {
        we.preventDefault();
        history.back();
    },

    onLoadBottomUI: function () {
        if (this.bIsShowBottomUI == false) {
            this.oPopularKeywords.callPopularKeywords(this.oSearchResult.oModel.keyword);
            //this.oSearchResult.oRecommendedDeal.callRecommendedDeal(this.oSearchResult.initKeyword);
            this.bIsShowBottomUI = true;
        }
    },

    hideErrorView: function () {
        $('.search_rst_none').hide();
        $('#apiError').hide();
    }
}