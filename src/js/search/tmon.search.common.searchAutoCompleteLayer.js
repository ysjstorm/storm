/**
 * 검색 자동완성 레이어
 */

var searchAutoCompleteLayer = function(){
    this.init.apply(this, arguments);
};

searchAutoCompleteLayer.prototype = {
    htSimilarRecentKeyword : {},
    /**
     * 자동완성 생성자 초기화
     * @param {object} htOptions
     */
    init : function(htOptions){
        this.RECENT_KEYWORD_MAX_COUNT = 2;
        this.CATEGORY_MAX_COUNT = 3;
        this.WORD_MAX_COUNT = 12;
        this.oDoSearch = htOptions.htCommon.htModule.oSearch;
        this.oSearchLocalStorage = htOptions.htCommon.htModule.oLocalStorage;
        this.sExecutionEnviroment = htOptions.htCommon.sExecutionEnviroment;
        this.oRecentSearchKeywordLayer = htOptions.oRecentSearchKeywordLayer;
        this.sSearchQuery = htOptions.sSearchQuery;
        this.bIsIos = htOptions.htCommon.bIsIos;
        this.sIosWebviewKeyboardClass = "virtual_keyboard_on";
        this.sIosWebviewAutoCompleteClass = "auto_complete_on";
        this.bIsAutoCompleteLayerOpen = false;
        this.oAjax = null;
        this.cacheElement();
        this.setEvent();
        this.setTemplate();
    },

    cacheElement : function(){
        this.welWindow = $(window);
        this.welBody = $("body");
        this.welSearchAutoCompleteSection = $('#_searchAutoComplete');
        this.welFieldSearch = $(".search_area .search_bar .inp");
    },

    setEvent : function(){
        //this.welSearchAutoCompleteSection.on("scroll touchmove", $.proxy(this.hideAppKeyboard, this));
        this.welSearchAutoCompleteSection.on("click", ".srch_auto_complete_lst li .del", $.proxy(this.removeRecentSearchKeyword, this));
        this.welSearchAutoCompleteSection.on("click", ".srch_auto_complete_lst li a", $.proxy(this.callSearch, this));
    },

    hideAppKeyboard : function(){
        /**
         * 모바일 환경에서 자동완성 레이어 노출시 스크롤하면 키보드 숨김처리
         * Ios는 blur로 키보드 컨트롤
         * Android는 앱에서 처리
         */

        if(this.sExecutionEnviroment === "app" && this.bIsIos){
            if(this.bIsAutoCompleteLayerOpen){
                this.welFieldSearch.blur();
                this.welBody.removeClass(this.sIosWebviewKeyboardClass);
            }else{
                return;
            }
        }
    },

    setTemplate : function () {
        // 자동완성 최근검색
        $.template(
            "autoCompleteLayer",
            '<div class="deal_area">'+
            '<ul class="srch_auto_complete_lst">'+
                // 모바일 APP
            '{{if sExecutionEnviroment == "app"}}'+
                // 최근 검색어
            '{{each recentKeyword.aData}}'+
            '{{if sCategoryName !== ""}}'+
            '<li class="rct ctg" data-keyword="${sPlainKeyword}" data-category-name="${sCategoryName}" data-category-srl="${sCategorySrl}" data-user-view-title="${sUserViewTitle}">'+
            '{{else}}'+
            '<li class="rct" data-keyword="${sPlainKeyword}" data-category-name="${sCategoryName}" data-category-srl="${sCategorySrl}" data-user-view-title="${sUserViewTitle}">'+
            '{{/if}}'+
            '<a href="#" tl:area="ASRKL" tl:ord="${$index + 1}">' +
            '<span class="keyword">{{html sKeyword}}</span>' +
            '{{if sCategoryName !== ""}}'+
            '{{if sCategoryName == "슈퍼마트"}}'+
            '<span class="included_category2 super_mart">슈퍼<b>마트</b></span>'+
            '{{else}}'+
            '<span class="included_category2">${sCategoryName}</span>'+
            '{{/if}}'+
            '{{/if}}'+
            '</a>'+
            '<em class="date">${sDate}</em>'+
            '<button type="button" class="del"><i class="blind">삭제</i></button>'+
            '</li>'+
            '{{/each}}'+

                // 마트
            '{{if autoComplete.martType}}'+
                '{{if autoComplete.martType.catSrl !== 0}}'+
                '<li class="ctg" data-keyword="${autoComplete.martType.word}" data-category-name="${autoComplete.martType.catInfo}" data-category-srl="${autoComplete.martType.catSrl}" data-user-view-title="${autoComplete.martType.userViewTitle}">'+
                '<a href="#" tl:area="ASSPCL" tl:ord="1">'+
                '<span class="keyword">{{html autoComplete.martType.html}}</span>'+
                '<span class="included_category2 super_mart">슈퍼<b>마트</b></span>'+
                '</a>'+
                '</li>'+
                '{{/if}}'+
            '{{/if}}'+

                // 카테고리 있는 키워드
            '{{each autoComplete.categoryType}}'+
            '<li class="ctg" data-keyword="${word}" data-category-name="${catInfo}" data-category-srl="${catSrl}" data-user-view-title="${userViewTitle}">'+
            '<a href="#" tl:area="ASACCL" tl:ord="${$index + 1}">'+
            '<span class="keyword">{{html html}}</span>'+
            '<span class="included_category2">${catInfo}</span>'+
            '</a>'+
            '</li>'+
            '{{/each}}'+

                // 카테고리 없는 키워드
            '{{each autoComplete.wordType}}'+
            '<li class="_acList" data-keyword="${word}">'+
            '<a href="#" tl:area="ASACL" tl:ord="${$index + 1}">'+
            '<span class="keyword">{{html html}}</span>'+
            '</a>'+
            '</li>'+
            '{{/each}}'+
            '{{/if}}'+
                // 모바일 WEB
            '{{if sExecutionEnviroment == "mweb"}}'+
                // 최근 검색어
            '{{each recentKeyword.aData}}'+
            '{{if sCategoryName !== ""}}'+
            '<li class="rct ctg" data-keyword="${sPlainKeyword}" data-category-name="${sCategoryName}" data-category-srl="${sCategorySrl}" data-user-view-title="${sUserViewTitle}">'+
            '{{else}}'+
            '<li class="rct" data-keyword="${sPlainKeyword}" data-category-name="${sCategoryName}" data-category-srl="${sCategorySrl}" data-user-view-title="${sUserViewTitle}">'+
            '{{/if}}'+
            '<a href="#" tl:area="MWSRKL" tl:ord="${$index + 1}">' +
            '<span class="keyword">{{html sKeyword}}</span>' +
            '{{if sCategoryName !== ""}}'+
            '{{if sCategoryName == "슈퍼마트"}}'+
            '<span class="included_category2 super_mart">슈퍼<b>마트</b></span>'+
            '{{else}}'+
            '<span class="included_category2">${sCategoryName}</span>'+
            '{{/if}}'+
            '{{/if}}'+
            '</a>'+
            '<em class="date">${sDate}</em>'+
            '<button type="button" class="del"><i class="blind">삭제</i></button>'+
            '</li>'+
            '{{/each}}'+

                // 마트
            '{{if autoComplete.martType}}'+
                '{{if autoComplete.martType.catSrl !== 0}}'+
                '<li class="ctg" data-keyword="${autoComplete.martType.word}" data-category-name="${autoComplete.martType.catInfo}" data-category-srl="${autoComplete.martType.catSrl}" data-user-view-title="${autoComplete.martType.userViewTitle}">'+
                '<a href="#" tl:area="MWSSPCL" tl:ord="1">'+
                '<span class="keyword">{{html autoComplete.martType.html}}</span>'+
                '<span class="included_category2 super_mart">슈퍼<b>마트</b></span>'+
                '</a>'+
                '</li>'+
                '{{/if}}'+
            '{{/if}}'+

                // 카테고리 있는 키워드
            '{{each autoComplete.categoryType}}'+
            '<li class="ctg" data-keyword="${word}" data-category-name="${catInfo}" data-category-srl="${catSrl}" data-user-view-title="${userViewTitle}">'+
            '<a href="#" tl:area="MWSACCL" tl:ord="${$index + 1}">'+
            '<span class="keyword">{{html html}}</span>'+
            '<span class="included_category2">${catInfo}</span>'+
            '</a>'+
            '</li>'+
            '{{/each}}'+

                // 카테고리 없는 키워드
            '{{each autoComplete.wordType}}'+
            '<li class="_acList" data-keyword="${word}">'+
            '<a href="#" tl:area="MWSACL" tl:ord="${$index + 1}">'+
            '<span class="keyword">{{html html}}</span>'+
            '</a>'+
            '</li>'+
            '{{/each}}'+
            '{{/if}}'+
            '</ul>'+
            '</div>'
        );
    },

    callAutoCompleteKeyword : function(sKeyword){
        if(this.oAjax) {
            this.oAjax.abort();
        }

        this.htSimilarRecentKeyword = this.getSimilarKeywords(sKeyword);

        this.oAjax = $.tmAjax({
            url: TMON.search.htAPI.autoComplete + encodeURI(sKeyword),
            type: 'GET',
            dataType: 'json',
            context: this,
            cache : true,
            success: $.proxy(this.renderTmpl, this),
            error: function (xhr) {

            }
        })
    },

    renderTmpl : function(htRes){
        this.oAjax = null;

        if( $.isEmptyObject(htRes) || htRes.wordType.length === 0 ){
            return;
        }

        var htRenderData = {};

        if(htRes.categoryType.length > this.CATEGORY_MAX_COUNT){
            htRes.categoryType.splice(this.CATEGORY_MAX_COUNT, htRes.categoryType.length);
        }

        if(htRes.wordType.length > this.WORD_MAX_COUNT){
            htRes.wordType.splice(this.WORD_MAX_COUNT, htRes.wordType.length);
        }

        htRenderData["autoComplete"] = htRes;
        htRenderData["recentKeyword"] = this.htSimilarRecentKeyword;
        htRenderData["sExecutionEnviroment"] = this.sExecutionEnviroment;

        this.removeDuplicateKeywords(htRenderData);
        this.oRecentSearchKeywordLayer.hideRecentSearchKeywordLayerSection();
        var welTmplAutoComplete = $.tmpl("autoCompleteLayer", htRenderData).outerHTML();
        this.welSearchAutoCompleteSection.html(welTmplAutoComplete);

        this.showAutoCompleteSection();
    },

    /**
     * 최근검색어 자동완성 중복 키워드 자동완성에서 제거
     * @param htRenderData
     */
    removeDuplicateKeywords : function(htRenderData){
        var recentKeyword = htRenderData.recentKeyword.aData,
            martType = htRenderData.autoComplete.martType,
            categoryAutoComplete = htRenderData.autoComplete.categoryType,
            wordAutoComplete = htRenderData.autoComplete.wordType;

        if(recentKeyword.length === 0){
            return;
        }

        // 마트 자동완성 중복 키워드 제거
        if(martType){
            if(martType.catSrl !== 0){
                for(var g=0; g<recentKeyword.length; g++){
                    if(recentKeyword[g].sPlainKeyword === martType.word && recentKeyword[g].sCategoryName === martType.catInfo){
                        martType.catSrl = 0;
                    }
                }
            }
        }

        // 카테고리 자동완성 중복 키워드 제거
        if(categoryAutoComplete){
            for(var i=0; i<recentKeyword.length; i++){
                for(var j=0; j<categoryAutoComplete.length; j++){
                    if(recentKeyword[i].sPlainKeyword === categoryAutoComplete[j].word && recentKeyword[i].sCategoryName === categoryAutoComplete[j].catInfo){
                        categoryAutoComplete.splice(j, 1);
                    }
                }
            }
        }

        // 노멀 자동완성 중복 키워드 제거
        if(wordAutoComplete) {
            for (var k = 0; k < recentKeyword.length; k++) {
                for (var m = 0; m < wordAutoComplete.length; m++) {
                    if (recentKeyword[k].sPlainKeyword === wordAutoComplete[m].word) {
                        wordAutoComplete.splice(m, 1);
                    }
                }
            }
        }
    },

    getSimilarKeywords: function(sKeyword) {
        var sEscapedKeyword = sKeyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        var htRecentKeywords = this.oSearchLocalStorage.getTheItem("recentSearchKeyword");
        var aResult = [];

        if(!htRecentKeywords){
            return {aData : []};
        }

        for (var i= 0, nFoundCount = 0; i<htRecentKeywords.aData.length; i++) {
            if(htRecentKeywords.aData[i].sKeyword.indexOf(sEscapedKeyword) < 0) {
                continue;
            }

            aResult.push(htRecentKeywords.aData[i]);
            if(++nFoundCount >= this.RECENT_KEYWORD_MAX_COUNT){
                break;
            }
        }

        for(var i=0;i<aResult.length;i++){
            aResult[i].sPlainKeyword = aResult[i].sKeyword;
            aResult[i].sKeyword = aResult[i].sKeyword.replace(sEscapedKeyword, "<strong>" + sEscapedKeyword + "</strong>"); // keyword 하이라이트
        }

        return {aData : aResult};
    },

    removeRecentSearchKeyword : function(e){
        var _target = $(e.currentTarget),
            _htData = {
                sKeyword : _target.parent().attr("data-keyword"),
                sCategoryName : _target.parent().attr("data-category-name") || ""
            };

        this.oSearchLocalStorage.removeTheItem(_htData);
        this.callAutoCompleteKeyword($(".inp").val());
        _target.parent().hide();
    },

    callSearch : function(e){
        var _target = $(e.currentTarget),
            _htQueryOpt = {
                sKeyword : _target.parent().attr("data-keyword"),
                sCategoryName : _target.parent().attr("data-category-name"),
                sCategorySrl : _target.parent().attr("data-category-srl"),
                sUserViewTitle : _target.parent().attr("data-user-view-title"),
                sSearchQuery : this.sSearchQuery
            };

        this.oDoSearch.searchStart(_htQueryOpt);
    },

    showAutoCompleteSection : function(){
        this.welSearchAutoCompleteSection.show();
        this.welBody.addClass(this.sIosWebviewAutoCompleteClass);
        this.bIsAutoCompleteLayerOpen = true;
    },

    hideAutoCompleteSection : function(){
        this.welSearchAutoCompleteSection.hide();
        this.welBody.removeClass(this.sIosWebviewAutoCompleteClass);
        this.bIsAutoCompleteLayerOpen = false;
    }
};
