var searchResultBanner = function () {
    this.init.apply(this, arguments);
}

searchResultBanner.prototype = {
    init: function (oSearchResult) {
        this.oSearchResult = oSearchResult;

        this.cachedTemplate();
    },

    cachedTemplate: function () {
        this.welBannerTemplate = Handlebars.compile($("#tmpl_dealBanner").html());
    },

    initView: function () {
        if (this.oAjax) {
            this.oAjax.abort();
        }

        var htAjaxOption = {
            keyword: this.oSearchResult.oModel.keyword
        };

        $.ajax({
            cache: true,
            url: TMON.search.htAPI.mobileBanner,
            type: 'GET',
            dataType: 'JSON',
            data: htAjaxOption,
            success: $.proxy(this.renderTmpl, this)
        })
    },

    renderTmpl: function (res) {
        var aBannerDatas = res.data.list;

        // 앱이 아닐 경우, 배너 비노출
        if (this.oSearchResult.htCommon.sExecutionEnviroment != "app") {
            return false;
        }

        if (aBannerDatas.length > 0) {

            var htBannerData = {
                aBanners: aBannerDatas
            };

            setTimeout(function () {
                $('.deal_list>li').first().after(this.welBannerTemplate(htBannerData));

                // attached slick event.
                $('.deal_item_banner_list').slick({arrows: false});
            }.bind(this), 100);
        }
    }
}
