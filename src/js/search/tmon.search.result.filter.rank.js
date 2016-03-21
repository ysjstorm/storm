var searchResultFilter = function () {
    this.init.apply(this, arguments);
}

searchResultFilter.prototype = {
    init: function (oSearchResult) {
        this.oSearchResult = oSearchResult;

        this.cachedTemplate();
        this.cacheElement();
        this.setEvent();
    },

    cachedTemplate: function () {
        this.welRelatedKeywordTemplate = Handlebars.compile($("#tmpl_filterRank").html());
        this.welHistoryKeywordTemplate = Handlebars.compile($("#tmpl_filterRankHistory").html());
    },

    cacheElement: function () {
        /* 속성랭킹 영역 */
        this.welSearchFilter = $('#searchFilter');
        this.welWrapKeyword = $('#wrap_keyword');

        /* 속성랭킹 : 관련 키워드 */
        this.welRelatedKeyword = $('#related_keyword');
        this.welRelatedKeywordList = this.welRelatedKeyword.find('ul');

        /* 속성랭킹 : 히스토리 키워드 */
        this.welHistoryKeyword = $('#history_keyword');
        this.welHistoryKeywordScroll = this.welHistoryKeyword.find('#wrap_scroll');
        this.welHistoryKeywordList = this.welHistoryKeywordScroll.find('ul');

        /* 속성랭킹 : 로딩중... */
        this.welDimmedFilter = $('#dimmed_filter');
    },

    setEvent: function () {
        /**
         *  속성랭킹 : 관련 키워드 클릭
         */
        this.welRelatedKeyword.on('click', '.btn_keyword', $.proxy(this._onRelatedKeyword, this));
        /**
         * 속성랭킹 : 히스토리 키워드 스크롤
         */
        this.welHistoryKeywordScroll.on('scroll', $.proxy(this._onScrollHistoryKeyword, this));
        /**
         * 속성랭킹 : 히스토리 키워드 클릭
         */
        this.welHistoryKeywordScroll.on('click', 'li', $.proxy(this._removeHistoryKeyword, this));
    },

    initView: function () {
        if (this.oAjax) {
            this.oAjax.abort();
        }

        var htCurrentModel = $.extend(true, {}, this.oSearchResult.oModel);

        var htAjaxOption = {};

        for (var key in htCurrentModel) {
            if (htCurrentModel.hasOwnProperty(key)) {
                switch (key) {
                    case "keyword":
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
                    default:
                        break;
                }
            }
        }

        console.log(" 속성 랭킹 :: ");
        console.log(htAjaxOption);

        this.oAjax = $.ajax({
            method: "GET",
            url: TMON.search.htAPI.filterRank,
            data: htAjaxOption,
            dataType: 'JSON',
            success: $.proxy(this.renderTmpl, this),
            beforeSend: $.proxy(this.beforeSend, this),
            complete: $.proxy(this.completeLoad, this),
            error: function () {
                $('#searchFilter').hide();
            }
        })
    },

    beforeSend: function () {
        this.welDimmedFilter.show();
    },

    completeLoad: function () {
        if (this.oSearchResult.oSearchInput.oAjax) {
            $.when(this.oSearchResult.oSearchInput.oAjax).done(function(){
                this.welDimmedFilter.hide();
            }.bind(this));
            //this.welDimmedFilter.delay(500).hide();
        } else {
            this.welDimmedFilter.hide();
        }
    },

    renderTmpl: function (res) {
        var htResponseData = res.data;

        if (this.oSearchResult.oModel.attributes.length > 0) {
            this.welHistoryKeywordList.empty();

            var htTemplateData = {};
            htTemplateData.attributes = this.oSearchResult.oModel.attributes;

            if (this.oSearchResult.htCommon.sExecutionEnviroment == "app") {
                htTemplateData["isApp"] = true;
            }

            this.welHistoryKeywordList.append(this.welHistoryKeywordTemplate(htTemplateData));

            this.welHistoryKeyword.show();
        } else {
            this.welHistoryKeywordList.empty();
            this.welHistoryKeyword.hide();
        }

        if (htResponseData.hasOwnProperty("values") && htResponseData.values.length > 0) {
            htResponseData.sExecutionEnviroment = this.oSearchResult.htCommon.sExecutionEnviroment;

            if (this.oSearchResult.htCommon.sExecutionEnviroment == "app") {
                htResponseData["isApp"] = true;
            }

            this.welRelatedKeywordList.html(this.welRelatedKeywordTemplate(htResponseData));

            this.welWrapKeyword.css('height', 'auto');

            this.welRelatedKeywordList.show();
            this.welRelatedKeyword.show();
            this.welSearchFilter.show();
        } else {
            if (this.welHistoryKeywordList.children().size() == 0) {
                this.welSearchFilter.hide();
            }

            this.welRelatedKeywordList.empty();
            this.welRelatedKeyword.hide();
        }

        this.oAjax = null;
    },

    _onRelatedKeyword: function (we) {
        we.preventDefault();

        this.welDimmedFilter.show();
        var sKeywordValue = $(we.currentTarget).text();

        this.oSearchResult.oModel.pushAttribute(sKeywordValue);

        this._setFilterKeyword();
    },


    _removeHistoryKeyword: function (we) {
        we.preventDefault();

        this.welDimmedFilter.show();

        var welCurrentTarget = $(we.currentTarget);

        var sRemoveKeyword = welCurrentTarget.find('.btn_keyword').text();

        welCurrentTarget.remove();

        //if (this.welHistoryKeyword.find('li').length == 0) {
        //    this.welHistoryKeyword.hide();
        //}

        if (this.welHistoryKeyword.find('ul').width() <= this.welHistoryKeywordScroll.width()) {
            this.welWrapKeyword.find('.left_gradient').hide();
            this.welWrapKeyword.find('.right_gradient').hide();
        }

        this.oSearchResult.oModel.popAttribute(sRemoveKeyword);

        this._setFilterKeyword();
    },

    _setFilterKeyword: function () {
        this.oSearchResult.reloadFilterDetailView();
        this.oSearchResult.reloadInputView();
        this.oSearchResult.reloadFilterRankView();
    },

    _onScrollHistoryKeyword: function (we) {
        var welCurrentTarget = $(we.currentTarget);
        var welLeftGradient = this.welHistoryKeyword.find('.left_gradient');
        var welRightGradient = this.welHistoryKeyword.find('.right_gradient');

        var nScrollLeft = welCurrentTarget.scrollLeft();
        var nInnerWidth = welCurrentTarget.find('ul').width();
        var nWidth = welCurrentTarget.width();
        var nGap = nInnerWidth - nWidth;

        if (nScrollLeft < 10) {
            welLeftGradient.hide();
            welRightGradient.show();
        } else if (nScrollLeft > 10 && nScrollLeft < nGap - 10) {
            welLeftGradient.show();
            welRightGradient.show();
        } else {
            welLeftGradient.show();
            welRightGradient.hide();
        }
    },

    show: function () {
        this.welSearchFilter.show();
        this.welWrapKeyword.show();
    }
}
