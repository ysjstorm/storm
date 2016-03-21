var claimListLoad = function(api, bIsClaimList, sDealType){
    this.init(api, bIsClaimList, sDealType);
};

claimListLoad.prototype = {

    nCurrentPageSrl : 1, // 1페이지는 서버 렌더링
    nListPerPage : 50, // 페이지당 50개의 목록을 가져온다 (고정)
    bIsClaimList : false, // 취소내역 여부
    bIsFetching : false, // 호출 중
    bIsReturned : false, // 상세정보로 넘어갈 때 true로 변경

    init : function(api, bIsClaimList, sDealType){
        this.cacheElement();
        this.api = api;
        this.bIsClaimList = bIsClaimList;
        this.sDealType = sDealType;
        this.template = Handlebars.compile($("#_template_list_item").html());

        if(this.welListItems.length < this.nListPerPage){
            this.welListEnd.show();
        }else{
            this.bindScroll();
        }
    },

    cacheElement : function(){
        this.welWindow = $(window);
        this.welList = $("#_load_list");
        this.welListItems = this.welList.find(".__list_item");
        this.welListEnd = $("#_list_end");
        this.welSpinner = $("#_spinner");
    },

    bindScroll : function(){
        this.welWindow.on("scroll", $.proxy(this.onScroll, this));
    },

    unbindScroll : function(){
        this.welWindow.off("scroll", $.proxy(this.onScroll, this));
    },

    fetchList : function(){
        this.welSpinner.show();

        $.ajax({
            url : this.api,
            type : "GET",
            data : {
                pageSrl : this.nCurrentPageSrl + 1,
                dealType : this.sDealType
            },
            context : this,
            success : $.proxy(this.cbFetchList, this),
            error : $.proxy(function(){
                this.welSpinner.hide();
            }, this)
        });
    },

    cbFetchList : function(res){
        var aData = res.data;
        var welListAppending = $(this.template({
            data : aData,
            pageSrl : this.nCurrentPageSrl + 1
        }));

        if(this.bIsClaimList){
            welListAppending = this.assignBundle(welListAppending);
        }
        if(aData.length > 0){
            welListAppending.appendTo(this.welList);
            this.nCurrentPageSrl += 1;
        }
        if(aData.length < this.nListPerPage){
            this.welListEnd.show();
            this.welSpinner.hide();

            return;
        }
        this.bindScroll();
        this.bIsFetching = false;
        this.welSpinner.hide();
    },

    /**
     * 취소내역에서 묶음배송상품인 경우 bundle 클래스 추가
     */
    assignBundle : function(welListAppending){
        return $.each(welListAppending, function(index, el){
            var wel = $(el);
            var prevDeliveryGroupSrl = $(welListAppending[index - 1]).data("deliveryGroupSrl");
            var deliveryGroupSrl = wel.data("deliveryGroupSrl");

            if(prevDeliveryGroupSrl === deliveryGroupSrl){
                wel.find(".__link_detail_deal").addClass("bundle");
            }
        });
    },

    onScroll : function(){
        var welLastItem = this.welList.find(".__list_item").last();
        var nLastItemTop = welLastItem.offset().top;
        var nWindowHeight = this.welWindow.height();
        var nCurrentScroll = this.welWindow.scrollTop() + nWindowHeight;
        var bIsFetchNeeded = nCurrentScroll > (nLastItemTop - nWindowHeight);

        if(bIsFetchNeeded && this.bIsFetching === false){
            this.unbindScroll();
            this.bIsFetching = true;
            this.fetchList();
        }
    }
};
