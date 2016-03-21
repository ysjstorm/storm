/**
 * 테마, 키워드 템플릿
 */

var themeAndKeyword = function(){
    this.init.apply(this, arguments);
};

themeAndKeyword.prototype = {
    wrpGroups : [],
    wrpGroupCounts : [],
    aSliders : [],
    aDirections : [],
    welDots : [],

    init :function(htOptions){
        this.oDoSearch = htOptions.htCommon.htModule.oSearch;
        this.oSearchLocalStorage = htOptions.htCommon.htModule.oLocalStorage;
        this.sExecutionEnviroment = htOptions.htCommon.sExecutionEnviroment;
        this.bHasRecentSearchKeyword = this.oSearchLocalStorage.checkHasKeyword();
        this.oAjax = null;
        this.selectedThemeKeywordDotIndex = 0;
        this.selectedKeywordDotIndex = 0;
        this.selectedThemeDotIndex = 0;
        this.viewStatus = {
            hasKeyword : "hasKeyword",
            noKeyword : "noKeyword"
        };

        this.cacheElement();
        this.setEvent();
        this.initPage();
    },

    cacheElement : function(){
        this.welThemeBase = $(".home_theme");
        this.welRoot = $("div.search_theme");
        this.welTmplHomeKeyword = $("#_homeKeywordTmpl");
        this.welTmplHomeTheme = $("#_homeThemeTmpl");
        this.welTmplHomeThemeKeyword = $("#_themeKeywordTmpl");
        this.welHomeThemeKeywordSection = $("#_themeKeyword");
        this.welHomeSplitThemeKeywordSection = $("#_splitThemeKeyword");
        this.welHomeSplitKeyword = this.welHomeSplitThemeKeywordSection.find(".keyword");
        this.welHomeSplitTheme = this.welHomeSplitThemeKeywordSection.find(".theme");
    },

    setEvent : function(){
        this.welThemeBase.on("click", ".keyword_lst li a", $.proxy(this.callSearch, this));
    },

    initPage : function(){
        this.callThemeAndKeyword();
    },

    callThemeAndKeyword : function(){
        if(this.oAjax) {
            this.oAjax.abort();
        }

        var bHasKeyword = this.oSearchLocalStorage.checkHasKeyword(),
            htData = {
                isRecentKeywordPresent : true
            };

        if(!bHasKeyword){
            htData.isRecentKeywordPresent = false;
        }

        this.oAjax = $.ajax({
            url: TMON.search.htAPI.homeThemeAndKeywords,
            type: 'GET',
            data: htData,
            dataType: 'json',
            context: this,
            cache: true,
            success: $.proxy(this.checkRenderStatus, this),
            error: function (xhr) {
                if(xhr.status === 503){
                    //this.obstacleTmplRender();
                }
            }
        })
    },

    checkRenderStatus : function(htRes){
        if( this.oSearchLocalStorage.checkHasKeyword() ){
            this.welHomeSplitThemeKeywordSection.hide();
            this.renderTmpl(this.viewStatus.hasKeyword, htRes);
        } else {
            this.welHomeThemeKeywordSection.hide();
            this.renderTmpl(this.viewStatus.noKeyword, htRes);
        }

        this.createSliders();
    },

    // TODO :: 템플릿별로 렌더 메소드 추가
    renderTmpl : function(sViewStatus, htRes){
        if( $.isEmptyObject(htRes.data)){
            return;
        }

        var htRenderData = htRes.data,
            aContentList = htRes.data.contentList,
            aUpperAreaContentList = null,
            bHasRecnetKeyword = htRes.data.recentKeywordPresent,
            aRendomNum = [],
            aRendomThemeBg = ["theme_bg1","theme_bg2","theme_bg3"],
            raw_temp_theme_keyword = null,
            raw_temp_keyword = null,
            raw_temp_theme = null,
            template_theme_keyword = null,
            template_keyword = null,
            template_theme = null;

        if(bHasRecnetKeyword){
            if(htRenderData.titleList !== undefined && htRenderData.titleList.length !== 0) {
                htRenderData.titleList[0].initActiveDot = true;
                this.selectedThemeKeywordDotIndex = htRes.data.selectedDotIndex;
            }
        }else{
            if(htRenderData.titleList !== undefined && htRenderData.titleList.length !== 0){
                htRenderData.titleList[0].initActiveDot = true;
                this.selectedThemeDotIndex = htRes.data.selectedDotIndex;
            }
            if(htRenderData.upperAreaTitleList !== undefined && htRenderData.upperAreaTitleList.length !== 0){
                htRenderData.upperAreaTitleList[0].initActiveDot = true;
                aUpperAreaContentList = htRes.data.upperAreaContentList;
                this.selectedKeywordDotIndex = htRes.data.upperAreaSelectedDotIndex;
            }
        }

        $.extend(htRenderData,{"sExecutionEnviroment":this.sExecutionEnviroment});

        if(htRenderData.titleList !== undefined && htRenderData.titleList.length !== 0){
            for (var i = 0; i < aRendomThemeBg.length; i++) {
                aRendomNum.push(Math.floor(Math.random() * aRendomThemeBg.length));
            }

            for (var i = 0; i < aContentList.length; i++) {
                if (aContentList[i].tabType === "theme") {
                    aContentList[i].bgClass = aRendomThemeBg[aRendomNum[i]];
                }
            }
        }

        if(htRenderData.titleList !== undefined && htRenderData.titleList.length !== 0){
            for (var i = 0; i < aContentList.length; i++) {
                aRendomNum.push(Math.floor(Math.random() * aRendomThemeBg.length));
            }

            for (var i = 0; i < aContentList.length; i++) {
                if (aContentList[i].tabType === "theme") {
                    aContentList[i].bgClass = aRendomThemeBg[aRendomNum[i]];

                }
            }
        }

        switch( bHasRecnetKeyword ){
            case false :
                raw_temp_keyword = this.welTmplHomeKeyword.html();
                raw_temp_theme = this.welTmplHomeTheme.html();
                template_keyword = Handlebars.compile( raw_temp_keyword );
                template_theme = Handlebars.compile( raw_temp_theme );

                this.welHomeSplitKeyword.html(template_keyword(htRenderData));
                this.welHomeSplitTheme.html( template_theme(htRenderData));

                if( !this.welHomeSplitThemeKeywordSection.is(":visible") ){
                    this.showSplitThemeAndKeywordSection();
                }
                break;
            case true :
                raw_temp_theme_keyword = this.welTmplHomeThemeKeyword.html();
                template_theme_keyword = Handlebars.compile( raw_temp_theme_keyword );

                this.welHomeThemeKeywordSection.html(template_theme_keyword(htRenderData));

                if( !this.welHomeThemeKeywordSection.is(":visible") ){
                    this.showThemeAndKeywordSection();
                }
                break;
        }

    },

    createSliders : function (){
        var self = this;

        $(".split_theme_keyword div.search_theme div._scroller").each(function (i, n) {
            new sliderForThemeAndKeyword(
                this,
                $(this).parents("div.search_theme").find("nav.theme_cate ul li"),
                self.selectedKeywordDotIndex
            );
        });

        $(".theme_keyword div.search_theme div._scroller").each(function (i, n) {
            new sliderForThemeAndKeyword(
                this,
                $(this).parents("div.search_theme").find("nav.theme_cate ul li"),
                self.selectedThemeKeywordDotIndex
            );
        });

        $(".split_theme_keyword .theme .search_theme ._scroller").each(function (i, n) {
            new sliderForThemeAndKeyword(
                this,
                $(this).parents("div.search_theme").find("nav.theme_cate ul li"),
                self.selectedThemeDotIndex
            );
        });
    },

    callSearch : function(e){
        e.preventDefault();
        var _target = $(e.currentTarget),
            _htQueryOpt = {
                sKeyword : _target.parent().attr("data-keyword")
            };


        this.oDoSearch.searchStart(_htQueryOpt);
    },

    showThemeAndKeywordSection : function(){
        this.welHomeThemeKeywordSection.show();
    },

    hideThemeAndKeywordSection : function(){
        this.welHomeThemeKeywordSection.hide();
    },

    showSplitThemeAndKeywordSection : function(){
        this.welHomeSplitThemeKeywordSection.show();
    },

    hideSplitThemeAndKeywordSection : function(){
        this.welHomeSplitThemeKeywordSection.hide();
    }
}
