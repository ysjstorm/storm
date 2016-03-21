var searchFilterDetail = function () {
    this.init.apply(this, arguments);
}

searchFilterDetail.prototype = {
    htFilterOption: {},
    bChangedCategory: false,
    bClickedCategory: true,

    init: function (oSearchResult) {
        this.oSearchResult = oSearchResult;

        this.cachedTemplate();
        this.cachedElement();
        this.setEvent();
    },

    cachedTemplate: function () {
        this.welFilterDetailTemplate = Handlebars.compile($('#tmpl_search_detail').html());
    },

    cachedElement: function () {
        /* 상세검색 펼침/닫힘 버튼 */
        this.welSearchDetailOpen = $('#btn_search_detail');
        this.welSearchDetailClose = $('#btn_layer_close');

        /* 레이어 펼쳐질때 나타나는 Dimmed 레이어 */
        this.welDimmed_search_detail = $('#dimmed_search_detail_layer');

        /* 상세검색 디테일 카테고리 */
        this.welSearchDetail = $('#search_filter_detail');
        this.welSearchFilterList = $('#search_filter_list');
        this.welFilterHeader = $('#filter_header');

        /* 상세검색 로더 */
        this.welSearchDetailLoader = $('#dimmed_search_detail_loader');
        this.welLoadingLogo = $('#loading_logo');

        /* 레이어 하단 버튼 */
        this.welFilterApply = $('#btn_apply_filter');
        this.welFilterReset = $('#btn_reset_filter');
    },

    setEvent: function () {
        /**
         * 상세검색 필터 레이어
         */
        this.welSearchDetailOpen.on('click', $.proxy(this._onSearchDetailLayer, this));
        this.welSearchDetailClose.on('click', $.proxy(this._onCloseDetailLayer, this));
        this.welDimmed_search_detail.on('click', $.proxy(this._onCloseDetailLayer, this));
        /**
         * 상세필터 : 오픈 서브 카테고리
         */
        this.welSearchFilterList.on('click', 'li.openable', $.proxy(this._onOpenSubCategory, this));
        this.welSearchFilterList.on('click', 'li.disabled', $.proxy(this._onRevertFilter, this));
        /**
         * 상세필터 : 필터 선택
         */
        this.welSearchFilterList.on('click', '.lst_sub_category li', $.proxy(this._onSelectFilter, this));
        /**
         *  상태검색 : 조건적용 버튼
         */
        this.welFilterApply.on('click', $.proxy(this.applyFilter, this));
        this.welFilterReset.on('click', $.proxy(this.resetFilter, this));
    },

    initView: function () {
        this.bClickedCategory = true;
        this.sBeforeCategoryName = this.oSearchResult.oModel.categoryName;

        // reset 시 초기화
        this.htFilterOption = $.extend(true, {}, this.oSearchResult.oModel);

        this.loadDetailFilter();
    },

    loadDetailFilter: function () {
        if (this.oAjax) {
            this.oAjax.abort();
        }

        //로딩중 배경
        this.welSearchDetailLoader.show();

        var htAjaxOption = {};

        // Ajax Option filtering
        for (var key in this.htFilterOption) {
            if (this.htFilterOption.hasOwnProperty(key)) {
                switch (key) {
                    case "keyword":
                        htAjaxOption[key] = this.htFilterOption[key];
                        break;
                    case "attributes":
                        if (this.htFilterOption[key].length != 0) {
                            htAjaxOption[key] = this.htFilterOption[key].join(',');
                        }
                        break;
                    case "catSrl":
                        htAjaxOption[key] = this.htFilterOption[key];
                        break;
                    case "uvCatCode":
                        htAjaxOption[key] = this.htFilterOption[key];
                        break;
                    case "isDeliveryFree":
                        htAjaxOption[key] = this.htFilterOption[key];
                        break;
                    default:
                        break;
                }
            }
        }

        console.log(" 속성 상세 :: ");
        console.log(htAjaxOption);

        this.oAjax = $.ajax({
            url: TMON.search.htAPI.filterDetail,
            type: 'GET',
            dataType: 'JSON',
            data: htAjaxOption,
            success: $.proxy(this.renderTmpl, this),
            complete: $.proxy(this.onHideLoader, this),
            error: $.proxy(this.onHideLoader, this)
        });
    },

    onHideLoader: function () {
        this.welSearchDetailLoader.hide();
        this.welLoadingLogo.hide();
    },

    renderTmpl: function (res) {
        var htTemplateData = res.data;

        if(this.oSearchResult.htCommon.sExecutionEnviroment == "app"){
            htTemplateData["isApp"] = true;
        }

        //this.welSearchFilterList.empty();
        this.welSearchFilterList.html(this.welFilterDetailTemplate(htTemplateData));

        if (htTemplateData.showFreeDelivery == false) {
            this.htFilterOption.isDeliveryFree = "N";
        }

        this._setDeliveryView();
        this._setCategoryView();
        this._setSortView();
        this._setKeywordView();

        if (this.bClickedCategory) {
            $('#filter_category>.lst_sub_category').hide();
            $('#filter_category').removeClass('on');
            this.bClickedCategory = false;
        }

        this.oAjax = null;
    },

    _onCloseDetailLayer: function (we) {
        if (we != null) {
            we.preventDefault();
        }

        this._onSearchDetailLayer();

        setTimeout(function(){
            this.resetFilter();
        }.bind(this), 200);
    },

    applyFilter: function (we) {
        if (we != null) {
            we.preventDefault();
        }

        // Ajax Option filtering
        for (var key in this.htFilterOption) {
            if (this.htFilterOption.hasOwnProperty(key)) {
                switch (key) {
                    case "keyword":
                        this.oSearchResult.oModel[key] = this.htFilterOption[key];
                        break;
                    case "attributes":
                        this.oSearchResult.oModel[key] = this.htFilterOption[key];
                        break;
                    case "uvCatCode":
                        this.oSearchResult.oModel.setCategory(this.htFilterOption[key]);
                        break;
                    case "catSrl":
                        this.oSearchResult.oModel.setCategory(this.htFilterOption[key]);
                        break;
                    case "isDeliveryFree":
                        this.oSearchResult.oModel[key] = this.htFilterOption[key];
                        break;
                    case "sort":
                        this.oSearchResult.oModel[key] = this.htFilterOption[key];
                        if (this.htFilterOption[key].indexOf("price") == -1) {
                            delete this.oSearchResult.oModel.order;
                        }
                        break;
                    case "order":
                        this.oSearchResult.oModel[key] = this.htFilterOption[key];
                        break;
                    case "categoryName":
                        this.oSearchResult.oModel[key] = this.htFilterOption[key];
                        break;
                    case "isSuperMartDelivery":
                        this.oSearchResult.oModel[key] = this.htFilterOption[key];
                        break;
                    default:
                        break;
                }
            }
        }

        /* 속성 키워드가 없을 경우 */
        if(!this.htFilterOption.hasOwnProperty("catSrl") && !this.htFilterOption.hasOwnProperty("uvCatCode")){
            this.oSearchResult.oModel.removeCategory();
        }

        this.bClickedCategory = true;

        this.oSearchResult.totalCount = 0;
        this._onSearchDetailLayer();

        setTimeout(function () {
            this.oSearchResult.reloadInputView();
            this.oSearchResult.reloadFilterRankView();
        }.bind(this), 200);
    },

    resetFilter: function (we) {
        if (we != null) {
            we.preventDefault();
        }

        this.bClickedCategory = true;

        this.initView();
    },

    _setDeliveryView: function () {
        var welFilterDelivery = $('#filter_delivery');

        if (this.htFilterOption.isSuperMartDelivery == "Y") {
            if (this.bChangedCategory == false || !this.htFilterOption.hasOwnProperty("catSrl")) {
                this.htFilterOption.uvCatCode = "SM";
            } else {

            }
        }

        if (this.htFilterOption.isDeliveryFree == "Y") {
            welFilterDelivery.find('.filter_value').text("무료배송");
            welFilterDelivery.find('li').addClass("on");
        }
    },

    _setCategoryView: function () {
        var welFilterCategory = $('#filter_category');

        var welSelectCategory = welFilterCategory.find('[name="전체"]');

        if (this.htFilterOption.hasOwnProperty("uvCatCode") && this.htFilterOption["uvCatCode"] != "") {
            welSelectCategory = welFilterCategory.find('[catsrl="' + this.htFilterOption.uvCatCode + '"]');
        }

        if (this.htFilterOption.hasOwnProperty("catSrl") && this.htFilterOption["catSrl"] != "") {
            welSelectCategory = welFilterCategory.find('[catsrl="' + this.htFilterOption.catSrl + '"]');
        }

        // 상세검색 검색결과수 노출
        // 추후 기능 추가 예정 우선 보류
        //this.welFilterHeader.find('em').html('(' + welSelectCategory.find('.count').first().text() + ')');

        // 선택한 카테고리가 있으면,
        if (welSelectCategory.size() != 0) {
            welFilterCategory.find('.filter_value').text(welSelectCategory.find('.name').first().text());
            welSelectCategory.addClass('on');

            if (welSelectCategory.find('.lst_sub_category2').size() > 0) {
                welSelectCategory.find('.lst_sub_category2').show();
                return false;
            }

            if (welSelectCategory.parent().hasClass('lst_sub_category2')) {
                welSelectCategory.parent().show();
                this.bClickedCategory = false;
                return false;
            }
            // 선택한 카테고리가 없으면,
        } else {
            welFilterCategory.find('li.on').removeClass('on');
            welFilterCategory.find('li').first().addClass('on');
            //TODO 전체 카테고리 선택

            $('#filter_category').find('.filter_value').text("전체");

            // 카운트 기능 보류
            //this.welFilterHeader.find('em').html('(' + welFilterCategory.find('.count').first().text() + ')');
        }
    },

    _setSortView: function () {
        switch (this.htFilterOption.sort) {
            case "popular" : // 티몬인기순
                $('#filter_sort').find('li').eq(0).click();
                break;
            case "sales" : // 많이팔린순
                $('#filter_sort').find('li').eq(1).click();
                break;
            case "price" :
                if (this.htFilterOption.order == "desc") {
                    $('#filter_sort').find('li').eq(2).click(); // 높은가격순
                } else if (this.htFilterOption.order == "asc") {
                    $('#filter_sort').find('li').eq(3).click(); // 낮은가격순
                } else {
                    $('#filter_sort').find('li').eq(0).click();
                }
                break;
            case "new" : // 신규상품순
                $('#filter_sort').find('li').eq(4).click();
                break;
            default :
                console.error("정렬 선택 오류");
                break;
        }
    },

    _setKeywordView: function(){
        if(this.sHistoryKeyword != null){
            $("[data-filtername=keyword]:contains(" + this.sHistoryKeyword + ")").click();
        }
    },

    _onRevertFilter: function (we) {
        if (we != null) {
            we.preventDefault();
        }

        var sHistoryKeyword = $(we.currentTarget).data('historykeyword');

        this.sHistoryKeyword = sHistoryKeyword;

        this.htFilterOption.attributes = $.grep(this.htFilterOption.attributes, function (value) {
            return value != sHistoryKeyword;
        })

        this.bClickedCategory = true;
        this.loadDetailFilter();
    },

    _onSelectFilter: function (we) {
        if (we != null) {
            we.preventDefault();
        }

        var welTarget = $(we.currentTarget);
        var wel1DepthCategory = welTarget.closest('.openable');
        var sSelectFilter = wel1DepthCategory.data('filtername');

        if (sSelectFilter == "category") {
            this.htFilterOption.attributes = [];
            this.onSelectCategoryFilter(welTarget);
            return false;
        }

        if (sSelectFilter == "sort") {
            this.bChangedCategory = false;
            this.onSelectSortFilter(welTarget);
            return false;
        }

        if (sSelectFilter == "groupDelivery") {
            this.htFilterOption.attributes = [];
            this.welLoadingLogo.show();
            this.bChangedCategory = false;
            this.onSelectGroupDeliverFilter(welTarget);
            return false;
        }

        if (sSelectFilter == "keyword") {
            this.welLoadingLogo.show();
            this.bChangedCategory = false;
            this.onSelectKeywordFilter(welTarget);
            return false;
        }

        if (sSelectFilter == "historyKeyword") {
            this.welLoadingLogo.show();
            this.bChangedCategory = false;
            this.onSelectHistoryKeywordFilter(welTarget);
            return false;
        }
    },

    onSelectHistoryKeywordFilter: function (welTarget) {
        var sSelectValue = welTarget.find('.name').text();

        this.htFilterOption.attributes = $.grep(aSearchKeyword, function (value) {
            return value != sSelectValue;
        })

        this.loadDetailFilter();
    },

    onSelectKeywordFilter: function (welTarget) {
        var wel1DepthCategory = welTarget.closest('.openable');
        var wel2DepthCategory = wel1DepthCategory.find('.lst_sub_category');
        var sSelectValue = welTarget.find('.name').first().text();

        if (!welTarget.hasClass('on')) {
            wel1DepthCategory.find('li.on').removeClass('on');
            welTarget.addClass('on');
            wel1DepthCategory.find('.filter_value').text(sSelectValue);
        } else {
            welTarget.removeClass('on');
            wel1DepthCategory.data('value', "");
            wel1DepthCategory.find('.filter_value').text("");
        }

        this.htFilterOption.attributes.push(sSelectValue);

        wel2DepthCategory.slideUp(150);
        wel1DepthCategory.removeClass('on');

        this.bClickedCategory = true;

        this.loadDetailFilter();
    },

    onSelectGroupDeliverFilter: function (welTarget) {
        var wel1DepthCategory = $('#filter_delivery');

        if (welTarget.hasClass('on')) {
            welTarget.removeClass('on');
            wel1DepthCategory.find('.filter_value').text("");
            this.htFilterOption.isDeliveryFree = "N"

        } else {
            wel1DepthCategory.find('li.on').removeClass('on');
            wel1DepthCategory.find('.filter_value').text(welTarget.find('.name').text());
            welTarget.addClass('on');
            this.htFilterOption.isDeliveryFree = "Y"
        }

        //wel1DepthCategory.click();
        //wel1DepthCategory.removeClass('on');
        this.bClickedCategory = true;

        this.loadDetailFilter();
    },

    onSelectSortFilter: function (welTarget) {
        var wel1DepthCategory = welTarget.closest('.openable');
        var wel2DepthCategory = welTarget.closest('.lst_sub_category');

        if (!welTarget.hasClass('on')) {
            wel1DepthCategory.find('li.on').removeClass('on');
            welTarget.addClass('on');
            wel1DepthCategory.find('.filter_value').text(welTarget.find('.name').first().text());
        }

        var sort = welTarget.find('[data-value]').data('value');

        if (sort.split(" ").length == 1) {
            this.htFilterOption.sort = sort.split(" ")[0];
            delete this.htFilterOption.order;
        }

        if (sort.split(" ").length == 2) {
            this.htFilterOption.sort = sort.split(" ")[0];
            this.htFilterOption.order = sort.split(" ")[1];
        }

        wel2DepthCategory.slideUp(150);
        wel1DepthCategory.removeClass('on');
    },

    onSelectCategoryFilter: function (welTarget) {
        var filterCategory = $('#filter_category');

        if (welTarget.attr('catsrl') != null && welTarget.attr('catsrl').indexOf("-") != -1) {
            welTarget.attr('catsrl', welTarget.attr('catsrl').split("-")[1])
        }

        //UI처리
        filterCategory.data('value', welTarget.attr('catsrl'));
        filterCategory.find('.filter_value').text(welTarget.attr('name'));

        if (welTarget.attr('isvertical') == "true") {
            if (welTarget.hasClass('on')) {
                return false;
            }
            filterCategory.find('li.on').removeClass('on');
            welTarget.addClass('on');

            welTarget.parent().find('.lst_sub_category2').slideUp(150);
            welTarget.find('.lst_sub_category2').slideDown(150);
        } else {
            if (welTarget.hasClass('on')) {
                return false;
            }
            filterCategory.find('li.on').removeClass('on');
            welTarget.addClass('on');
            //filterCategory.click();
        }

        //데이터 처리
        if (welTarget.attr('name') == "전체") {
            delete this.htFilterOption.catSrl;
            delete this.htFilterOption.uvCatCode;
        } else if (welTarget.attr('isvertical') == "true") {
            this.htFilterOption.uvCatCode = welTarget.attr("catsrl");
            delete this.htFilterOption.catSrl;
        } else {
            this.htFilterOption.catSrl = Number(welTarget.attr("catsrl"));
            delete this.htFilterOption.uvCatCode;
        }

        this.htFilterOption.categoryName = welTarget.attr('name');

        // 슈퍼마트 설정
        if (welTarget.attr("catSrl") == "SM") {
            this.htFilterOption.isSuperMartDelivery = "Y";
        } else if (typeof welTarget.parent().parent().attr("catSrl") == "string" && welTarget.parent().parent().attr("catSrl").split(",")[0] == "SM") {
            this.htFilterOption.isSuperMartDelivery = "Y";
        } else {
            this.htFilterOption.isSuperMartDelivery = "N";
        }

        if (this.sBeforeCategoryName != this.htFilterOption.categoryName) {
            this.bChangedCategory = true;
            this.sBeforeCategoryName = this.htFilterOption.categoryName;
        }

        this.welLoadingLogo.show();

        this.loadDetailFilter();
    },

    setCategory: function (category) {
        if ($.isNumeric(category)) {
            this.catSrl = Number(category);
            delete this.uvCatCode;
        } else {
            this.uvCatCode = category;
            delete this.catSrl;
        }
    },

    _onOpenSubCategory: function (we) {
        if (we != null) {
            we.preventDefault();
        }

        var welClickedCategory = $(we.currentTarget);
        var welSubCategoryList = welClickedCategory.find('.lst_sub_category');

        if (welClickedCategory.hasClass('on')) {
            welClickedCategory.removeClass('on');
            welSubCategoryList.slideUp(150);
        } else {
            welClickedCategory.addClass('on');
            welSubCategoryList.slideDown(150);
        }
    },

    _onSearchDetailLayer: function (we) {
        if (we != null) {
            we.preventDefault();
        }

        this.sHistoryKeyword = null;

        if (!this.welSearchDetail.hasClass('active')) {
            // 레이어 열림
            this.welDimmed_search_detail.show();
            this._disableScrollEvent();
            this.welSearchDetail.toggleClass('active');
        } else {
            // 레이어 닫힘
            this.welDimmed_search_detail.hide();
            this._enableScrollEvent();
            this.welSearchDetail.toggleClass('active');
        }
    },

    _enableScrollEvent: function () {
        $('body').css({
            'overflow-y': 'auto',
            'position': 'static',
            'top': this.winPosTopAsShowLayer
        });

        $(window).scrollTop(this.winPosTopAsShowLayer * -1);
    },

    _disableScrollEvent: function () {
        this.winPosTopAsShowLayer = this.welSearchDetail * -1;

        $('body').css({
            'overflow-y': 'hidden',
            'position': 'fixed',
            'top': this.winPosTopAsShowLayer
        });
    }
}
