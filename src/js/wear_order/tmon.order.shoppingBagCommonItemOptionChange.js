/**
 * 쇼핑백의 일반상품 옵션 변경
 * @constructor
 */
var shoppingBagCommonItemOptionChange = function(oCommonItem){
    this.oCommonItem = oCommonItem;
	this.init();
};

shoppingBagCommonItemOptionChange.prototype = {
	init: function() {
		this.cacheElement();
        this.setTemplate();
		this.setEvent();
	},

    setTemplate : function(){
        this.tplOptions = Handlebars.compile($("#optionChangeTemplate").html());
    },

	cacheElement: function(){
        this.welList = $("#_commonItemList");
        this.welOptionSelectLayer = $("#_optionSelectLayer");
        this.welOptionSelectLayerContent = this.welOptionSelectLayer.find(".sel_opts");
	},

	setEvent: function(){
        this.welList.on("click", "._changeOption", $.proxy(this.onChangeOption, this)); // 옵션 변경
        this.welOptionSelectLayer.on("click", ".btn_detail_cancel", $.proxy(this.closeOptionLayer, this)); // 레이어 닫기
        this.welOptionSelectLayer.on("click", ".mainoption input", $.proxy(this.onSelectMainOption, this)); // 옵션선택
        this.welOptionSelectLayer.on("click", ".ly_footer .confirm", $.proxy(this.onSubmit, this)); // 변경
    },

    onChangeOption : function(e){
        var wel = $(e.currentTarget);
        var welLi = wel.parents("li:first");
        this.welTargetLi = welLi;
        this.sOption1 = wel.attr("data-optiondepth1");
        this.sOption2 = wel.attr("data-optiondepth2");

        $.ajax({
            url : TMON.order.htAPI.getDealOptions,
            data : {
                mainDealSrl : welLi.attr("data-maindealsrl")
            },
            dataType : 'json',
            contentType : "application/json;charset=UTF-8",
            success : $.proxy(this.cbChangeOption, this),
            error : function(res) {
                if(res.responseJSON.data.errorMessage){
                    alert(res.responseJSON.data.errorMessage);
                }
            }
        });
    },

    cbChangeOption : function(res){
        this.showOptionLayer(res.data);
    },

    showOptionLayer : function(aData){
        /**
         * 옵션은 최대 2개의 옵션이 내려오고(aData),
         * 첫 옵션의 master값이 true인 경우 2개의 옵션을 가지고
         * false 인경우 하나의 옵션만 가진다
         * 하나의 옵션만 가질 경우엔 aData의 첫번쨰 옵션이 서브옵션이다.
         */
        this.welOptionSelectLayerContent.html(this.tplOptions({aItems : aData}));

        if(aData[0].master == true){ // 옵션이 2개인 경우
            // 기존 선택되어 있는 옵션을 선택해 준다
            var welOption1 = this.welOptionSelectLayer.find(".mainoption input[value='"+ this.sOption1 +"']").prop("checked",true).parents("li:first");

            var sMainNo = welOption1.attr("data-mainno");
            this.welOptionSelectLayer.find(".suboption[data-subno=" + sMainNo + "]").find("input[value='" + this.sOption2 + "']").prop("checked", true);
            this.showSubOption(sMainNo);
        }else{ // 옵션이 1개인 경우
            this.welOptionSelectLayer.find(".suboption").find("input[value='" + this.sOption1 + "']").prop("checked", true);
        }

        this.welOptionSelectLayer.show();
        TMON.commonWear.layerOpen();
    },

    /**
     * 옵션 레이어를 닫는다.
     */
    closeOptionLayer : function(){
        history.back();
        this.welOptionSelectLayer.hide();
    },

    /**
     * 메인 옵션 넘버에 따른 하위 옵션을 보여준다.
     * @param sMainNo
     */
    showSubOption : function(sMainNo){
        this.welOptionSelectLayer.find(".suboption").hide();
        this.welOptionSelectLayer.find(".suboption[data-subno=" + sMainNo + "]").show();
    },

    /**
     * 메인 옵션 선택시에 그에 따른 하위 옵션을 보여준다.
     * @param e
     */
    onSelectMainOption : function(e){
        var welLi = $(e.currentTarget).parents("li:first");
        this.showSubOption(welLi.attr("data-mainno"));
    },

    /**
     * 선택된 옵션 딜 번호를 반환
     * @returns {*}
     */
    getSelectedOptionInfo : function(){
        var wel = this.welOptionSelectLayer.find(".suboption:visible input:checked");
        return {
            sMainDealNo : wel.attr("data-maindealno"),
            sDealNo : wel.attr("data-dealno"),
            sRestCount : wel.attr("data-restcount")
        }
    },

    /**
     * 선택된 옵션 텍스트를 가져온다.
     */
    getSelectedOptionText : function(){
        var sMainOptionName = this.welOptionSelectLayer.find(".mainoption:visible input:checked").val() || "";
        var sSubOptionName = this.welOptionSelectLayer.find(".suboption:visible input:checked").val() || "";
        return [
            sMainOptionName ? sMainOptionName : sSubOptionName,
            sSubOptionName
        ]
    },

    onSubmit : function(){
        var htSeletecOption = this.getSelectedOptionInfo();

        if(!htSeletecOption.sMainDealNo){
            alert("옵션을 선택해 주세요.");
            return false;
        }

        if(this.checkDuplicateOption() == true){
            alert("선택하신 옵션은 이미 담겨 있는 옵션입니다.\n담긴 옵션 확인 후 수량을 조정해 주세요.");
            return false;
        }

        this.oCommonItem.changeOption(this.welTargetLi, htSeletecOption, this.getSelectedOptionText());
    },

    /**
     * 중복 옵션인지 확인
     */
    checkDuplicateOption : function(){
        var htSelectedInfo = this.getSelectedOptionInfo();
        var welOptions = this.welTargetLi.parents("ul.deal_lst2:first").find("li");

        for(var i= 0, max=welOptions.length; i<max ; i++){
            if(welOptions.eq(i).attr("data-dealsrl") == htSelectedInfo.sDealNo){
                return true;
            }
        }

        return false;
    }
};