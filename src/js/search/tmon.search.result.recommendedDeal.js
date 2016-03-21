/**
 * 하단 추천
 */

var recommendedDeal = function(){
    this.init.apply(this, arguments);
};

recommendedDeal.prototype = {
    init : function(htOptions){
        this.oDoSearch = htOptions.htCommon.htModule.oSearch;
        this.sExecutionEnviroment = htOptions.htCommon.sExecutionEnviroment;
        this.sAppQueryN = htOptions.htCommon.htAppQuery.sAppQueryN;
        this.EXPOSURE_MAX_COUNT = 12;
        this.sRecommendedDealType = null;
        this.oAjax = null;
        this.cacheElement();
        this.setEvent();
        //this.callRecommendedDeal("샤오미 셀카봉");
    },

    cacheElement : function(){
        this.welTmplRecommendDeal = $("#_recommendedDealTmpl");
        this.welRecommendDealSection = $("#_recommendedDeal");
        this.welTmplDealLoading = $("#_dealLoadingTmpl");
    },

    setEvent : function(){
        this.welRecommendDealSection.on("click", ".crslinr li a", $.proxy(this.callSearch, this));
        this.welRecommendDealSection.on("click", ".more", $.proxy(this.callSearch, this));
    },

    callRecommendedDeal : function(sKeyword){
        if(sKeyword === undefined || sKeyword === "" || sKeyword === null){
            return;
        }

        if(this.oAjax) {
            this.oAjax.abort();
        }

        this.oAjax = $.tmAjax({
            url: TMON.search.htAPI.recommendedDeal + encodeURI(sKeyword),
            type: 'GET',
            dataType: 'json',
            data : {"numOfItems" : this.EXPOSURE_MAX_COUNT},
            context: this,
            success: $.proxy(this.renderTmpl, this),
            beforeSend : function(){
                //this.getDealLoading();
                //this.showRecommendedDealSection();
            }
        })
    },

    renderTmpl : function(htRes){

        if(htRes.data.empty || $.isEmptyObject(htRes.data) || htRes.data.list.length === 0){
            this.hideRecommendedDealSection();
            return;
        }

        var _raw_temp = this.welTmplRecommendDeal.html(),
            _template = Handlebars.compile(_raw_temp),
            _htRenderData = htRes;

        _htRenderData.data["sKeyword"] = decodeURIComponent(TMON.util.gup("keyword")) || "";
        _htRenderData.data["sExecutionEnviroment"] = this.sExecutionEnviroment;
        _htRenderData.data["sAppQuery"] = this.sAppQueryN;

        this.sRecommendedDealType = _htRenderData.data.type;
        this.welRecommendDealSection.html(_template(_htRenderData));

        this.welRecommendDealSection.find(".crslinr").css({"width": $(".crslinr .itm").length * 128});
    },

    getDealLoading : function(){
        var _raw_temp = this.welTmplDealLoading.html(),
            _template = Handlebars.compile(_raw_temp);

        this.welRecommendDealSection.html(_template());
        this.welRecommendDealSection.find(".deal_load").show();
    },

    callSearch : function(e){
        var _target = $(e.currentTarget),
            _htQueryOpt = {
                sKeyword : null,
                sCategoryName : null,
                sCategorySrl : null,
                sUserViewTitle : null
            };

        if(_target.hasClass("more")){
            _htQueryOpt.sKeyword = this.welRecommendDealSection.find(".keyword .hl").text();
            this.oDoSearch.searchStart(_htQueryOpt);
        }else{
            if(this.sRecommendedDealType === "partial_match" || this.sRecommendedDealType === "theme" || this.sRecommendedDealType === "relation"){
                return;
            }
            _htQueryOpt.sKeyword = _target.parent().attr("data-keyword");
            _htQueryOpt.sCategoryName = _target.parent().attr("data-category-name");
            _htQueryOpt.sCategorySrl = _target.parent().attr("data-category-srl");
            this.oDoSearch.searchStart(_htQueryOpt);
        }
    },

    showRecommendedDealSection : function(){
        this.welRecommendDealSection.show();
    },

    hideRecommendedDealSection : function(){
        this.welRecommendDealSection.hide();
    }
};
