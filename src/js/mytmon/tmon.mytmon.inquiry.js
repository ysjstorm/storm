/**
 * 1:1 문의하기 전반적인 자잘한 JS들 모아 둠.
 */
var inquiry = function () {
    this.init();
};

inquiry.prototype = {
    init: function () {

        // 문의내역확인 에서 "삭제"
        this.initDeleteInquiry();
    },

    initDeleteInquiry: function () {
        var welBtnDel = $("#_btnDeleteInquiry");
        welBtnDel.click($.proxy(function () {
            if (!confirm("1:1문의를 삭제하시겠습니까?")) {
                return false;
            }

            var qnaNo = welBtnDel.attr("data-qnaNo");
            $.ajax({
                url: "/api/m/qna/qnas/" + qnaNo,
                method: "DELETE"
            }).done(cbDelete);

        }, this));

        var cbDelete = function (res) {
            if (res.data.result == false){
                alert(res.data.errorMsg);
            }
            location.href = TMON.util.attachQuerySting(res.data.redirectTo);
        };
    }
};