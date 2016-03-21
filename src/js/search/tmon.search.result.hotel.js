var searchResultHotel = function(){
    this.init.apply(this, arguments);
};

searchResultHotel.prototype = {
    init: function(htOptions){
        this._htHotel = {
            sSearchDetail : TMON.search.htURL.hotel + "/hotel/search?",
            sSearchResult : TMON.search.htURL.hotel + "/hotel/search/list?",
            htParam : {
                sHotelType : null,
                nHotelSearchId : null,
                sHotelKeyword : null,
                sHotelFullKeyword : null,
                sHotelCheckInDate : null,
                sHotelCheckOutDate : null,
            },
            htUI : {
                sHotelCheckInDate : "",
                sHotelCheckOutDate: ""
            }
        };
        this.sCacheHotelFullKeyword = null;
        this.sAppQueryN = htOptions.htAppQuery.sAppQueryN;
        this.sAppQueryQ = htOptions.htAppQuery.sAppQueryQ;
        this.bKeywordHasHotelDeal = false;
        this.sNoHotelFullKeyword = "목적지를 입력해 주세요.";
        this.cachedElement();
        this.setEvent();
    },

    cachedElement: function(){
        this.welTmplHotelSearchUI = $("#_eanSearchUITmpl");
        this.welHotelSearchUISection = $('.hotel_search_base');
    },

    setEvent: function(){
        this.welHotelSearchUISection.on("click", "#_btnEanPlace", $.proxy(this.doSearchHotelDeal, this));
        this.welHotelSearchUISection.on("click", ".cal_input a", $.proxy(this.doSearchHotelDeal, this));
        this.welHotelSearchUISection.on("click", "#_btnEanSearch", $.proxy(this.doSearchHotelDeal, this));
    },

    initView : function(bKeywordHasHotelDeal, htParam){
        this.bKeywordHasHotelDeal = bKeywordHasHotelDeal;
        this.sCacheHotelFullKeyword = htParam.eanFullKeyword;

        this._htHotel.htParam.sHotelType = htParam.eanType;
        this._htHotel.htParam.nHotelSearchId = htParam.eanId;
        this._htHotel.htParam.sHotelKeyword = htParam.eanKeyword;
        this._htHotel.htParam.sHotelFullKeyword = htParam.eanFullKeyword;
        this._htHotel.htParam.sHotelCheckInDate = this.formatDate(htParam.arrivalDateString);
        this._htHotel.htParam.sHotelCheckOutDate = this.formatDate(htParam.departureDateString);
        this.formatUIDate(htParam.arrivalDateString, htParam.departureDateString);
        this.renderTmpl();
    },

    formatDate : function(sDate){
        if(!sDate){
            return;
        }

        return $.datepicker.formatDate("mm/dd/yy", new Date(sDate));
    },

    formatUIDate : function(sCheckIn, sCheckOut){
        var _aDayList = ["일", "월", "화", "수", "목", "금", "토"],
            _sCheckInDate = null,
            _sCheckOutnDate = null,
            _aCheckIn = null,
            _aCheckOut = null,
            _sCheckInTemp = null,
            _sCheckOutTemp = null;

        var _getArrangeDate = function(sDate){
            return (sDate.length > 1 || sDate > 9)? sDate : '0'+sDate;
        };

        if(this.bKeywordHasHotelDeal){
            _aCheckIn = sCheckIn.split("-");
            _aCheckOut = sCheckOut.split("-");
            _sCheckInTemp = _aCheckIn[0] + "-" + _aCheckIn[1] + "-" + _aCheckIn[2];
            _sCheckOutTemp = _aCheckOut[0] + "-" + _aCheckOut[1] + "-" + _aCheckOut[2];
        }else{
            var _oToday = new Date();
            _sCheckInTemp = _oToday.getFullYear() + "-" + _getArrangeDate(_oToday.getMonth()+1) + "-" + _getArrangeDate(_oToday.getDate()+1);
            _sCheckOutTemp = _oToday.getFullYear() + "-" + _getArrangeDate(_oToday.getMonth()+1) + "-" + _getArrangeDate(_oToday.getDate()+3);
            this._htHotel.htParam.sHotelCheckInDate = this.formatDate(_sCheckInTemp);
            this._htHotel.htParam.sHotelCheckOutDate = this.formatDate(_sCheckOutTemp);
        }

        _sCheckInDate = new Date(_sCheckInTemp);
        _sCheckOutnDate = new Date(_sCheckOutTemp);

        this._htHotel.htUI.sHotelCheckInDate = _sCheckInDate.getFullYear()+ "년 " +
            _getArrangeDate(_sCheckInDate.getMonth()+1)+ "월 " +
            _getArrangeDate(_sCheckInDate.getDate())+ "일 " +
            _aDayList[_sCheckInDate.getDay()] + "요일";

        this._htHotel.htUI.sHotelCheckOutDate = _sCheckOutnDate.getFullYear()+ "년 " +
            _getArrangeDate(_sCheckOutnDate.getMonth()+1)+ "월 " +
            _getArrangeDate(_sCheckOutnDate.getDate())+ "일 " +
            _aDayList[_sCheckOutnDate.getDay()] + "요일";
    },

    renderTmpl: function(){
        var sHtml = this.welTmplHotelSearchUI.html();
        var sTemplate = Handlebars.compile(sHtml);

        if( !this.bKeywordHasHotelDeal ){
            this._htHotel.htParam.sHotelFullKeyword = this.sNoHotelFullKeyword;
            this.formatUIDate();
        }

        this.welHotelSearchUISection.html(sTemplate(this._htHotel));
        this.showHotelSearchUISection();
    },

    doSearchHotelDeal : function(e){
        e.preventDefault();
        var _target = $(e.currentTarget),
            _sTargetId = _target.attr("id"),
            _sFieldName = _target.attr("data-field-name") || "",
            _sTargetFiled = {
                sInput : "_btnEanPlace",
                sCheckIn :"_btnEanCheckIn",
                sCheckOut : "_btnEanCheckOut",
                sBtnSearch : "_btnEanSearch"
            };

        if(this.bKeywordHasHotelDeal){
            switch(_sTargetId){
                case _sTargetFiled.sBtnSearch :
                    this.gotoHotelDealList();
                    break;
                default :
                    this.gotoHotelSearchDetail(_sFieldName);
                    break;
            }
        }else{
            switch(_sTargetId){
                case _sTargetFiled.sInput :
                    this._htHotel.htParam.sHotelFullKeyword = this.sNoHotelFullKeyword;
                    break;
                case _sTargetFiled.sCheckIn :
                case _sTargetFiled.sCheckOut :
                case _sTargetFiled.sBtnSearch :
                    this._htHotel.htParam.sHotelFullKeyword = this.sCacheHotelFullKeyword;
                    break;
                default:
                    break;
            }

            this.gotoHotelSearchDetail(_sFieldName);
        }
    },

    /**
     *
     * @param sShowWhichField ["place", "checkIn", "checkOut"]
     */
    gotoHotelSearchDetail : function(sShowWhichField){
        var _url = this._htHotel.sSearchDetail
            + "destinationString=" + this._htHotel.htParam.sHotelFullKeyword
            + "&keyword=" + this._htHotel.htParam.sHotelKeyword
            + "&fullKeyword=" + this._htHotel.htParam.sHotelFullKeyword
            + "&arrivalDate=" + this._htHotel.htParam.sHotelCheckInDate
            + "&departureDate=" + this._htHotel.htParam.sHotelCheckOutDate
            + "&searchType=" + this._htHotel.htParam.sHotelType
            + "&searchId=" + this._htHotel.htParam.nHotelSearchId
            + this.sAppQueryN;

        TMON.util.setCookie('clickLink', sShowWhichField, {path : "/", expires : 0});
        window.open(_url, '_self');
    },

    gotoHotelDealList : function(){
        var _url = this._htHotel.sSearchResult
            + "searchType=" + this._htHotel.htParam.sHotelType
            + "&searchId=" + this._htHotel.htParam.nHotelSearchId
            + "&keyword=" + this._htHotel.htParam.sHotelKeyword
            + "&fullKeyword=" + this._htHotel.htParam.sHotelFullKeyword
            + "&arrivalDate=" + this._htHotel.htParam.sHotelCheckInDate
            + "&departureDate=" + this._htHotel.htParam.sHotelCheckOutDate
            + this.sAppQueryN;

        window.open(_url, '_self');
    },

    showHotelSearchUISection : function(){
        this.welHotelSearchUISection.show();
    }
}
