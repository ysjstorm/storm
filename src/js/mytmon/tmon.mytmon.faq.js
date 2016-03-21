var mytmonFaq = function(){
    this.init();
};

mytmonFaq.prototype = {
    init : function(){
        this.cacheElement();
        this.setEvent();
        this.setTextCounterEvent();
    },

    cacheElement : function(){
        this.welItemList = $(".q_lst");
    },

    setEvent : function(){
        this.welItemList.on("click", "dt a", $.proxy(this.onClickItem, this));
        // 자주묻는 질문의 답변에 링크가 있으면 동작이 안되게 한다.
        this.welItemList.on("click", "dd .info a", function(){return false;});

        // 답변 궁금증 해결 등록
        this.welItemList.on("click", ".ipt button", $.proxy(this.onClickUserSolveSubmit, this));
    },

    onClickItem : function(e){
        var nCurDataSerial = $(e.target).attr("data-serial");

        // 같은 아이템이 다시 클릭된경우 해당 아이템을 닫아야 한다.
        if(this.nItemSerial == nCurDataSerial){
            this.closeItem();
            return false;
        }

        if(this.welAnswer){
            this.welAnswer.slideUp();
        }

        this.welTarget = $(e.target);
        this.nItemSerial = nCurDataSerial;
        $.getJSON('/api/faq/contents/' + this.nItemSerial, {}, $.proxy(this.cbGetItem, this));

        return false;
    },

    cbGetItem : function(res){
        if(!res){return false;}
        if(!res.data){return false;}

        var htItem = res.data.faqNew;
        this.welAnswer = this.welTarget.parents("dt").next();
        this.welAnswer.find(".info").html(htItem.contents);
        this.welAnswer.slideDown();
    },

    closeItem : function(){
        this.welAnswer.slideUp();
        this.nItemSerial = null;
    },

    /**
     * textCounter 플러그인을 사용하여 텍스트 수를 제한한다.
     */
    setTextCounterEvent : function(){
        var welElements = this.welItemList.find(".ipt");
        for(var i= 0, max=welElements.length; i < max ; i++){
            new textCounter(welElements.eq(i).find("textarea"), welElements.eq(i).next().find("i"), 200);
        }
    },

    onClickUserSolveSubmit : function(e){
        var welTarget = $(e.target);
        var welForm = welTarget.parents(".cs_review");
        var welSolveChecked = welForm.find("input[name='rdo_g1']:checked");

        if(welSolveChecked.length < 1){
            alert("해결 여부를 선택 해 주세요.");
            return false;
        }

        var welTextarea = welForm.find("textarea");
        $.post(welForm.attr("action"), {
            solved : welSolveChecked.val(),
            description : welTextarea.val()
        }, function(res){
            if(res.data.result === true){
                alert("소중한 의견 감사합니다.");
                welTextarea.val("");
            }else{
                alert("잠시 후 다시 시도해 주세요.");
            }
        });
        return false;
    }
};