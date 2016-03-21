var claimSearchZipcode = function(){
    this.init();
};

claimSearchZipcode.prototype = {

    init : function(){
        this.cacheElement();
        this.setEvent();

        // 우편번호 선택시 이벤트 처리
        // 도로명 주소: clickStreetZipcode
        // 지번 주소: clickNumberZipcode
        this.zipcode = $(this);
    },

    cacheElement : function(){
        this._welBody = $("body");
        // 우편번호 레이어
        this._welDimmed = $("#dimmed");
        this._welLayerZipcode = $("#_layer_zipcode");
        this._welBtnClose = this._welLayerZipcode.find(".__btn_close");
        this._welSearchTextStreet = this._welLayerZipcode.find("#_srch_txt_street");
        this._welSearchTextNumber = this._welLayerZipcode.find("#_srch_txt_number");
        this._welTab = this._welLayerZipcode.find("#_addr_tab");
        this._welTabStreet = this._welLayerZipcode.find("#_addr_tab_street");
        this._welTabNumber = this._welLayerZipcode.find("#_addr_tab_number");
        this._welBtnDelete = this._welLayerZipcode.find(".__btn_delete_keyword");

        // 도로명 검색
        this._welStreetWrap = this._welLayerZipcode.find("#_addr_street");
        this._welInputAddress = this._welStreetWrap.find("#zip3");
        this._welBtnSearchStreet = this._welStreetWrap.find(".__btn_search");
        this._welSearchCount = this._welStreetWrap.find("#_srch_count");
        this._welResultEmpty = this._welStreetWrap.find("#_result_empty");
        this._welResultTable = this._welStreetWrap.find("#_result_table");

        // 지번 검색
        this._welNumberWrap = this._welLayerZipcode.find("#_addr_number");
        this._welAddressKeyword = this._welNumberWrap.find("#zip4");
        this._welBtnSearchNumber = this._welNumberWrap.find(".__btn_search");
        this._welResultNumberEmpty = this._welNumberWrap.find("#_result_number_empty");
        this._welResultNumberTable = this._welNumberWrap.find("#_result_number_table");
    },

    setEvent : function(){
        this._welTabStreet.on("click", $.proxy(this._onClickTabStreet, this));
        this._welTabNumber.on("click", $.proxy(this._onClickTabNumber, this));
        this._welBtnClose.on("click", $.proxy(this._hideLayer, this));

        // 도로명 검색
        this._welBtnSearchStreet.on("click", $.proxy(this._onClickBtnSearchStreet, this));
        this._welStreetWrap.on("click", ".__zipcode", $.proxy(this._onClickStreetZipcode, this));

        // 지번 검색
        this._welBtnSearchNumber.on("click", $.proxy(this._onClickBtnSearchNumber, this));
        this._welNumberWrap.on("click", ".__zipcode", $.proxy(this._onClickNumberZipcode, this));
    },

    /**
     * 우편번호 검색 레이어 노출
     * @public
     */
    showLayer : function(){
        this._welDimmed.show();
        this._welLayerZipcode.css("top", this._welBody.scrollTop() + 50).show();
    },

    /**
     * 우편번호 검색 레이어 닫기
     */
    _hideLayer : function(){
        this._welDimmed.hide();
        this._welLayerZipcode.hide();
    },

    /**
     * 도로명 주소 검색 탭 클릭
     */
    _onClickTabStreet : function(we){
        this._welTabStreet.parent().addClass("on");
        this._welTabNumber.parent().removeClass("on");
        this._welStreetWrap.show();
        this._welNumberWrap.hide();
    },

    /**
     * 지번 주소 검색 탭 클릭
     */
    _onClickTabNumber : function(we){
        this._welTabStreet.parent().removeClass("on");
        this._welTabNumber.parent().addClass("on");
        this._welStreetWrap.hide();
        this._welNumberWrap.show();
    },

    /**
     * 도로명 주소 검색버튼 클릭시
     */
    _onClickBtnSearchStreet : function(){
        var oData = {
                "flag" : "street",
                "input_data" : this._welInputAddress.val()
            };

        if(this._validateStreetInputs()){
            $.ajax({
                url : TMON.claim.htAPI.getPostCodeByAjax,
                data : oData,
                success : $.proxy(this._onSuccessSearchStreet, this),
                error : function(){
                    alert("주소 검색에 실패했습니다. 다시 시도해주세요.");
                }
            });
        }
    },

    /**
     * 도로명 주소 호출 성공시
     * 검색결과 건수 갱신
     * 우편번호 테이블에 정보 추가
     */
    _onSuccessSearchStreet : function(res){
        var oResponse = JSON.parse(res.data);
        var bHasResult = oResponse.result !== null;
        var aResult;
        var welTbody = this._welResultTable.find("tbody");
        var template = Handlebars.compile('<tr><th scope="row">{{ init_district_no }}</th><td><a href="#" class="__zipcode" data-zipcode="{{ init_district_no }}" data-jibun="{{ jibun }}" data-street="{{ street }}" data-add-info="{{ add_info }}"><em class="lbl_st">도로명</em>{{ street }} {{#if add_info}}({{ add_info }}){{/if}}</a><p class="txt_no"><em class="lbl_no">지번</em>{{ jibun }}</p></td></tr>');

        if(bHasResult){
            aResult = JSON.parse(res.data).result.data;

            this._assignNotice(this._welSearchTextStreet, aResult.length);
            this._welResultEmpty.hide();
            welTbody.html('');

            $.each(aResult.slice(0, 100), function(index, info){
                $(template(info)).appendTo(welTbody);
            });
        }else{
            this._welSearchCount.text("0");
            this._welResultEmpty.show();
        }
    },

    /**
     * 검색 요구조건을 입력했는지 확인
     * @returns {boolean}
     */
    _validateStreetInputs : function(){
        var isAddressWritten = this._welInputAddress.val().length > 0;
        var isAddressEnough = this._welInputAddress.val().length > 2;

        if(!isAddressWritten){
            alert("주소명을 입력하셔야 합니다.");
            return false;
        }else if(!isAddressEnough){
            alert("주소명을 두 글자 이상 입력하셔야 합니다.");
            return false;
        }else{
            return true;
        }
    },

    /**
     * 도로명 주소 검색 후 선택시
     */
    _onClickStreetZipcode : function(we){
        var welZipcode = $(we.currentTarget);
        var oData = welZipcode.data();
        var sAddressFirst = [oData.jibun].join(" ");
        var sAddressText = [oData.street, oData.addInfo].join(" ");
        var oEventData = {
            zip1 : oData.zipcode,
            zip2 : "",
            addr1 : sAddressFirst,
            addr1_street : sAddressText
        };

        we.preventDefault();

        this.zipcode.trigger("clickStreetZipcode", oEventData);

        this._hideLayer();
    },

    /**
     * 지번 주소 검색 버튼 클릭시
     */
    _onClickBtnSearchNumber : function(){
        var oData = {
                "flag" : "jibun",
                "input_data" : this._welAddressKeyword.val()
            };

        var isAddressWritten = this._welAddressKeyword.val().length > 0;

        if(isAddressWritten){
            $.ajax({
                url : TMON.claim.htAPI.getPostCodeByAjax,
                data : oData,
                success : $.proxy(this._onSuccessSearchNumber, this),
                error : function(){
                    alert("주소 검색에 실패했습니다. 다시 시도해주세요.");
                }
            });
        }else{
            alert("주소명을 입력하세요.");
        }
    },

    /**
     * 지번 주소 호출 성공시
     */
    _onSuccessSearchNumber : function(res){
        var oResponse = JSON.parse(res.data);
        var bHasResult = oResponse.result !== null;
        var aResult;
        var welTbody = this._welResultNumberTable.find("tbody");
        var template = Handlebars.compile('<tr><th scope="row">{{ init_district_no }}</th><td><a href="#" class="__zipcode" data-zipcode="{{ init_district_no }}" data-address="{{ jibun }}">{{ jibun }}</a></td></tr>');

        if(bHasResult){
            aResult = JSON.parse(res.data).result.data;

            this._assignNotice(this._welSearchTextNumber, aResult.length);
            this._welResultNumberEmpty.hide();
            welTbody.html('');

            $.each(aResult, function(index, info){
                $(template(info)).appendTo(welTbody);
            });

            this._welResultNumberTable.show();
        }else{
            this._welResultNumberEmpty.show();
            this._welResultNumberTable.hide();
        }
    },

    /**
     * 지번 주소 검색 후 선택시
     */
    _onClickNumberZipcode : function(we){
        var welZipcode = $(we.currentTarget);
        var oData = welZipcode.data();
        var oEventData = {
            zip1 : oData.zipcode,
            zip2 : "",
            addr1 : oData.address
        };

        we.preventDefault();

        this.zipcode.trigger("clickNumberZipcode", oEventData);

        this._hideLayer();
    },

    /**
     * 검색결과 안내문구 처리
     */
    _assignNotice : function(welText, nLength){
        var welSearchText = welText.find(".__srch_txt");
        var welSearchTextAll = welText.find(".__srch_txt_all");
        var welSearchResultCount = welText.find(".__srch_count");
        var welSearchResultCountAll = welText.find(".__srch_count_all");

        // 100건이 초과되면 100건까지만 노출하고 검색 안내문구 노출
        if(nLength <= 100){
            welSearchText.show();
            welSearchTextAll.hide();
            welSearchResultCount.text(nLength);
        }else{
            welSearchText.hide();
            welSearchTextAll.show();
            welSearchResultCountAll.text(TMON.claim.util.addCommaToNumber(nLength));
        }
    }
};
