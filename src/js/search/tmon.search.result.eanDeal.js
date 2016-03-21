var searchResultEanDeal = function(){
    this.init.apply(this, arguments);
}

searchResultEanDeal.prototype = {
    bIsFinishEanDeal: false,
    init: function(){
        this.cachedElement();
        this.setEvent();
    },

    cachedElement: function(){
        this.welDealLoad = $('#deal_loading');
        this.welDealList = $('.deal_list');
        this.welTmplEan = $('#tmpl_eanDealItem');
    },

    setEvent: function(){

    },

    initView: function(){
        if(this.bIsFinishEanDeal){
            this.bIsFinishEanDeal = false;
        }

        if(this.oAjax){
            this.oAjax.abort();
        }

        this.oAjax = $.ajax({
            //url: "/api/ean/search/"+ this.oSearchResult.aSearchKeyword[0],
            url: "/api/search/hotel/속초",
            type: 'GET',
            dataType: 'json',
            success: $.proxy(this.renderTmpl, this),
            error: function (xhr) {
                if(xhr.status === 503){
                    //TODO: response 503
                }
            }
        })
    },

    renderTmpl: function(res){
        if(res.data.total > 0) {
            var sHtml = this.welTmplEan.html();
            var sTemplate = Handlebars.compile(sHtml);

            this.welDealList.append(sTemplate(res.data));
        }
    }
}