/**
 * Wear Deal
 */
var wearDeal = function(htOptions){
    $.extend(this, htOptions);
    this.init(htOptions);
};

wearDeal.prototype = {

    init: function (htOptions) {
        this.oDealRecent = new wearDealRecent(htOptions);
        this.cartType = ''; //해당 딜이 티켓3딜인지, 일반딜인지를 정의하는 변수
        this._pos_downloadCoupon = true;
        this._pos_putShoppingbag = true;
        this.cacheElement();
        this.setEvent();
        this.setTemplate();
        this.getCartkeyCookie();
        this.setCartType();
        this.getCouponList();
        this.getDealOption();
        this.initSlide();
        this.initSnsShare(this.htDealDetail);
    },

    cacheElement: function () {
        this.welIntroGallery = $('#_wrapImageList'); //상단 메인이미지 영역
        this.welIntroGalleryPaginate = $('#_wrapImagePaginate'); //상단 메인이미지 paginate 영역
        this.welIntroGalleryPrevButton = $('#_btDetailGalleryPrev'); //상단 메인이미지 이전버튼
        this.welIntroGalleryNextButton = $('#_btDetailGalleryNext'); //상단 메인이미지 다음버튼

        this.welCouponDownloadButton = $('#_couponDownloadButton'); //쿠폰다운로드 버튼
        this.welCardBenefitButton = $('#_cardBenefitButton'); //카드혜택 자세히보기 버튼
        this.welMoreDetailButton = $('#_moreDetailButton'); //상품설명 더보기 버튼
        this.welShareButton = $('#_btnShare'); //공유하기 버튼
        this.welToggleHiddenInfoButton = $('[data-role=toggle_button]');

        this.welCouponDownloadAfterLoginButton = $('#_couponDownloadAfterLoginButton'); //비로그인시 쿠폰다운로드 버튼
        this.welCouponDownloadLayer = $('#_couponDownloadLayer'); //쿠폰다운로드 레이어
        this.welCardBenefitLayer = $('#_cardBenefitLayer'); //카드혜택 레이어
        this.welMoreDetail = $('.hidden_info'); //카드혜택 레이어
        this.welShareLayer = $('.share_ly'); //공유하기 레이어

        this.welLayerCloseButton = $('.btn_detail_cancel'); //레이어 닫기버튼

        this.welShoppingLayer = $('.detail_func');
        this.welShoppingbagPutButton = $('#_putShoppingBagBtn'); //쇼핑백담기 버튼
        this.welShoppingbagOptions = $('.sel_opts'); //쇼핑레이어 옵션버튼
        this.welShoppingbagBuyDirectButton = $('#_dircetBuy'); //쇼핑레이어 바로구매 버튼
        this.welGoShoppingbagButton = $('#_goShoppingbagButton'); //쇼핑백 바로가기 버튼

        this.welCouponList = $('[data-template-id=_couponList]'); //쿠폰 다운로드 리스트 템플릿 wrapper

        this.welDealOptions = $('[data-template-id=dealDetailOptionTemplate]'); //쇼핑레이어 옵션버튼 템플릿 wrapper
        this.welShoppingbagList = $('[data-template-id=dealDetailShoppingbagListTemplate]'); //쇼핑레이어 쇼핑백 상품 리스트 템플릿 wrapper

        this.welMainOption = $('[data-role=mainOption]'); //쇼핑레이어 메인옵션그룹
    },

    setEvent: function () {
        this.welCouponDownloadButton.click($.proxy(this.showCouponDownloadLayer, this)); // 쿠폰다운로드 레이어 열기
        this.welCardBenefitButton.click($.proxy(this.showCardBenefitLayer, this)); // 카트혜택 레이어 열기
        this.welMoreDetailButton.click($.proxy(this.showMoreDetail, this)); // 상품설명 더보기
        this.welShareButton.click($.proxy(this.showShareLayer, this)); // 공유하기 레이어 열기
        this.welToggleHiddenInfoButton.click($.proxy(this.toggleHiddenInfo, this));

        this.welCouponDownloadAfterLoginButton.click($.proxy(this.couponDownloadAfterLogin, this));
        this.welCouponList.on('click', 'a', $.proxy(this.downloadCoupon, this)); //쿠폰다운로드 버튼 클릭
        this.welCardBenefitLayer.on('click', '.tab button', $.proxy(this.changeCardBenefitLayerTab, this)); // 카드혜택 레이어 탭 변경

        $('body').on('click', 'button[data-role=toggler]', $.proxy(this.checkShoppingbagLayer, this)); //쇼핑백 레이어 상태가 바뀔 때, 어떤 레이어가 열려있는지 검사하기 위한 메서드 호출
        this.welShoppingbagPutButton.click($.proxy(this.putShoppingbag, this)); // 쇼핑백 담기 액션
        this.welDealOptions.on('change', '[data-role=mainOption]', $.proxy(this.changeOptionGroup, this)); //쇼핑레이어 옵션버튼 값이 변경될 때
        this.welShoppingbagBuyDirectButton.click($.proxy(this.buyDirect, this)); //쇼핑레이어 바로구매 버튼 클릭
        this.welGoShoppingbagButton.click($.proxy(this.goShoppingbag, this)); //쇼핑백 바로가기 버튼 클릭

        this.welLayerCloseButton.on('click',function(){history.back();}); //레이어 닫기버튼 클릭
    },

    setTemplate: function () {
        this.tplCouponList = Handlebars.compile($("#couponList").html()); //쿠폰 리스트 템플릿

        this.tplDetailOption = Handlebars.compile($("#dealDetailOptionTemplate").html()); //쇼핑레이어 상품옵션 템플릿
        this.tplDetailShoppingbagList = Handlebars.compile($("#dealDetailShoppingbagListTemplate").html()); //쇼핑레이어 쇼핑백리스트 템플릿
    },

    couponDownloadAfterLogin : function(e){
        var welClickedButton = $(e.currentTarget);
        var sLoginUrl = welClickedButton.attr('data-src');

        if(TMON.view_mode == 'app'){
            TMON.app.callApp('webview','login');
        }else{
            location.href = sLoginUrl;
        }
    },

    /**
     * 쿠폰리스트 API 를 호출하여 쿠폰리스트를 가져온다.
     */
    getCouponList : function(){
        if(this.htDealDetail.bViewCoupon == true){
            $.ajax({
                url: TMON.wear.htAPI.getCouponList.replace('{dealNo}',this.htDealDetail.sDealNo),
                contentType: 'application/json;charset=UTF-8',
                dataType: 'json',
                success: $.proxy(this.renderCouponList, this),
                error: function (jqXHR, textStatus) {
                    if (textStatus == "abort") {
                        return;
                    }
                    alert("상품 옵션을 불러올 수 없습니다. 새로고침 후 다시 시도해 주세요.");
                    return;
                }
            });
        }
    },

    /**
     * 쿠폰리스트를 렌더링한다.
     * @param res
     */
    renderCouponList : function(res){
        var welCouponList = $(this.welCouponList);
        if(res.httpStatus != 'OK' || (res.data.avCoupons.length < 1 && res.data.myCoupons.length < 1) || res.data.avCoupons == null || res.data == null){
            welCouponList.addClass('empty');
        }else{
            var htCouponData = {
                aItems : res.data.avCoupons,
                complete : 'N'
            }
            var sHtml = this.tplCouponList(htCouponData);
            welCouponList.html(sHtml);

            var htCouponData = {
                aItems : res.data.myCoupons,
                complete : 'Y'
            }
            var sHtml = this.tplCouponList(htCouponData);
            welCouponList.append(sHtml);
        }

    },

    /**
     * 쿠폰 다운로드 리스트에서 쿠폰을 클릭했을 때 호출한다. 로그인을 하지 않았을 때는, app 인 경우 callApp('webview','login') 한다.
     * @param e
     * @returns {boolean}
     */
    downloadCoupon : function (e){

        if(this._pos_downloadCoupon == false){
            alert('처리 중입니다. 잠시만 기다려 주세요');
            return false;
        }
        this._pos_downloadCoupon = false;

        var welClickedButton = $(e.currentTarget),
            nCouponNo = welClickedButton.closest('li').attr('data-coupon-no');
        if(welClickedButton.closest("li").hasClass('complete') == true){
            //이미 받은 쿠폰
            alert('이미 받은 쿠폰입니다.');
            this._pos_downloadCoupon = true;
            return false;
        }else if(this.htUserInfo.memberNo == ''){
            //받지 않은 쿠폰이지만 로그인 안 한 상태
            var sLoginUrl = this.htUri.loginPage_m + encodeURIComponent(location.href) + this.htConnectEnvironment.sAppQueryN;
            alert('로그인 후 받을 수 있습니다.');
            if(this.htConnectEnvironment.viewMode == 'app'){
                TMON.app.callApp('webview','login');
            }else{
                location.href=sLoginUrl;
            }
            this._pos_downloadCoupon = true;
            return false;
        }

        //받지 않은 쿠폰이고, 로그인도 한 상태
        $.ajax({
            method: "POST",
            url: TMON.wear.htAPI.getCoupon.replace('{dealNo}',this.htDealDetail.sDealNo).replace('{couponNo}', nCouponNo),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: $.proxy(this.getCouponAfterDown, this),
            error: function (jqXHR, textStatus) {
                this._pos_downloadCoupon = true;
                if (textStatus == "abort") {
                    return;
                }
                alert("상품 옵션을 불러올 수 없습니다. 새로고침 후 다시 시도해 주세요.");
                return;
            }
        });

        return false;
    },

    /**
     * 쿠폰을 받은 후 다시 쿠폰리스트를 가져오기 위해 사용한다.
     */
    getCouponAfterDown: function(res) {
        if(res.data.isSuccess == "true"){
            alert('쿠폰이 발급되었습니다.');
        }else{
            alert('유효하지 않은 쿠폰 입니다. 새로고침 후 다시 시도해 주세요.');
            this.getCouponList();
        }
        this.getCouponList();
        this._pos_downloadCoupon = true;
    },

    /**
     * 쇼핑레이어 상태가 변경될 때 호출한다. 쇼핑레이어에 숨겨진 input[type=checkbox] 가 세 개 있는데, 어떤 게 토글되었느냐에 따라 다른 액션을 취할 수 있다.
     */
    checkShoppingbagLayer : function(e) {
        var welShoppingLayer = $(this.welShoppingLayer);
        var welClickedButton = $(e.currentTarget);
        var sStatus = welClickedButton.attr('data-status');
        welShoppingLayer.attr('id',sStatus);

        if(sStatus == '_toggleShowAdded'){
        }else if(sStatus == '_toggleShowSbag'){
        }else{
            this.getDealOption();
        }
    },

    /**
     * 쇼핑레이어의 옵션 버튼의 상태가 바뀌었을 때 호출하며, main 옵션이 변경되면 그에 해당하는 sub 옵션을 노출시켜준다.
     * @param e
     */
    changeOptionGroup : function() {
        var welDealOptions = $(this.welDealOptions);
        var nSelectedMainDealNo = welDealOptions.find('[data-role=mainOption]:checked').closest('li').attr('data-mainno');
        if(nSelectedMainDealNo != this.nLastSelectedMainDealNo){
            welDealOptions.find('li.suboption input').attr('checked',false);
        }
        welDealOptions.find('li.suboption').hide();
        welDealOptions.find('li.suboption[data-subno='+nSelectedMainDealNo+']').show();
        this.nLastSelectedMainDealNo = nSelectedMainDealNo;
    },

    /**
     * 쇼핑레이어의 옵션 정보를 받아온다.
     */
    getDealOption : function() {
        $.ajax({
            url: TMON.wear.htAPI.getDealOption.replace('{dealNo}',this.htDealDetail.sDealNo),
            contentType: 'application/json',
            dataType: 'json',
            success: $.proxy(this.renderDealOption, this),
            error: function (jqXHR, textStatus) {
                if (textStatus == "abort") {
                    return;
                }
                alert("상품 옵션을 불러올 수 없습니다. 새로고침 후 다시 시도해 주세요.");
                return;
            }
        });
    },

    /**
     * 쇼핑레이어의 옵션 정보를 렌더링한다.
     * @param res
     * @returns {boolean}
     */
    renderDealOption : function(res){
        var welDealOptions = $(this.welDealOptions);
        if (res.httpStatus != "OK") {
            return false;
        }
        var htDealOptionData = {
            aItems : res.data
        };
        var sHtml = this.tplDetailOption(htDealOptionData);
        welDealOptions.html(sHtml);
        var welFirstValidRadio = welDealOptions.find('.mainoption input:enabled:first-child:eq(0)');
        welFirstValidRadio.attr('checked', true);
        this.changeOptionGroup();

    },

    /**
     * 해당 딜이 티켓3 딜인지, 일반 딜인지 체크하여 this.cartType 에 담는다.
     */
    setCartType : function (){
        if(this.htDealDetail.sWearType == this.htWearType.normal){
            //일반상품일 때
            this.cartType =  this.htCartType.normal;
        }else if(this.htDealDetail.sWearType == this.htWearType.ticket3){
            //티켓3 상품일 때
            this.cartType =  this.htCartType.ticket3;
        }
    },

    /**
     * 바로구매시, 혹은 카트담기시 어떤 옵션이 선택되었는지 체크하여 리턴한다.
     * @returns {{nMainDealNo: string, nDealNo: string, sCartType: string, bOptionChecked: boolean}|*}
     */
    getCheckedOptionInfo : function (){
        var htData = {
                nMainDealNo : this.welShoppingbagOptions.find('li.suboption input:checked').attr('data-mainDealNo'),
                nDealNo : this.welShoppingbagOptions.find('li.suboption input:checked').attr('data-dealNo'),
                sCartType : this.cartType,
                bOptionChecked : false
            },
            nMainDealNo = htData.nMainDealNo,
            nDealNo = htData.nDealNo;

        if(!nDealNo || !nMainDealNo || nDealNo == '0' || nMainDealNo == '0'){
            htData.bOptionChecked = false;
        }else{
            htData.bOptionChecked = true;
        }

        return htData;
    },

    /**
     * 쇼핑백담기 버튼을 눌렀을 때 호출한다. getCheckedOptionInfo 메서드를 호출하여 정보를 받아온 뒤, 제대로 된 옵션이 선택되었다면 쇼핑백 담기 API 를 호출한다.
     * @returns {boolean}
     */
    putShoppingbag : function (){
        if(this._pos_putShoppingbag == false){
            alert('처리 중입니다. 잠시만 기다려 주세요');
            return false;
        }
        this._pos_putShoppingbag = false;
        var htCheckedOptionInfo = this.getCheckedOptionInfo();
        if (htCheckedOptionInfo.bOptionChecked == false){
            alert('옵션을 먼저 선택해 주세요');
            this._pos_putShoppingbag = true;
            return false;
        }
        if(htCheckedOptionInfo.sCartType == this.htCartType.normal){
            var sCartValue = this.htUserInfo.cartValueNormal;
        }else if(htCheckedOptionInfo.sCartType == this.htCartType.ticket3){
            var sCartValue = this.htUserInfo.cartValueTicket3;
        }

        if(this.htUserInfo.memberNo != ''){
            sCartValue = '';
        }

        //TMON.app.callApp('webview', 'showView', '교환환불정보', '<tmonUrl:get key="wear_m"/><tmonUrl:get key="wear_m_uri_refundInfo" var1="${DATA.detail.dealNo}"/>', true);
        $.ajax({
            url: TMON.wear.htAPI.putShoppingbag.replace('{cartType}', htCheckedOptionInfo.sCartType),
            data: {
                cartKey : sCartValue,
                mainDealNo : htCheckedOptionInfo.nMainDealNo,
                dealNo : htCheckedOptionInfo.nDealNo,
                count : 1
            },
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: $.proxy(this.putShoppingbagComplete, this),
            error: function (jqXHR, textStatus) {
                this._pos_putShoppingbag = true;
                if (textStatus == "abort") {
                    return;
                }
                alert("일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
                return;
            }
        });
    },

    /**
     * 쇼핑백 담기 API 가 완료되면 호출한다. 티켓3 딜일 경우 쇼핑백리스트를 보여주고 카트키를 쿠키로 굽는다.
     * 일반딜일 경우 쇼핑레이어를 닫고 alert 을 띄운다.
     * @param res
     */
    putShoppingbagComplete : function(res){
        this._pos_putShoppingbag = true;
        if(res.httpStatus == 'OK'){
            if (res.data.isSuccess == 'true') {
                if(this.cartType == this.htCartType.ticket3){
                    this.welShoppingLayer.attr('id', '_toggleShowSbag');
                }else if(this.cartType == this.htCartType.normal){
                    this.welShoppingLayer.attr('id', '_closeAllLayer');
                    alert('선택하신 상품이 쇼핑백에 담겼습니다.');
                }
                //console.log(res);
                this.setCartkeyCookie(res.data.key);

            }else{
                alert(res.data.errorMessage);
            }
        }else{
            alert('일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.');
        }

    },
    /**
     * 바로 구매 버튼이 클릭되면 호출한다. getCheckedOptionInfo 메서드를 호출하여 선택된 옵션을 받은 뒤, 문제가 없으면 바로구매 API 를 호출한다.
     * @returns {boolean}
     */
    buyDirect : function(){
        var sBuyDirectUrl = this.htUri.order_m_uri_direct_buy;
        if(this._pos_buyDirect == false){
            alert('처리 중입니다. 잠시만 기다려 주세요');
            return false;
        }
        this._pos_buyDirect = false;
        var htCheckedOptionInfo = this.getCheckedOptionInfo();
        if (htCheckedOptionInfo.bOptionChecked == false){
            alert('옵션을 먼저 선택해 주세요');
            this._pos_buyDirect = true;
            return false;
        }

        sBuyDirectUrl = sBuyDirectUrl.replace('{count}', 1);
        sBuyDirectUrl = sBuyDirectUrl.replace('{dealSrl}', htCheckedOptionInfo.nDealNo);
        sBuyDirectUrl = sBuyDirectUrl.replace('{mainDealSrl}', htCheckedOptionInfo.nMainDealNo);
        if(this.htConnectEnvironment.viewMode == 'app'){
            TMON.app.callApp('cart', 'goBuy', sBuyDirectUrl + this.htConnectEnvironment.sAppQueryN + '&' + this.htConnectEnvironment.sLoginParameter);
        }else{
            location.href=sBuyDirectUrl;
        }

        this._pos_buyDirect = true;
    },

    /**
     * 쇼핑백 버튼을 눌렀을 때 호출한다. 접속환경이 앱이면 return false 시키고 call App 한다.
     */
    goShoppingbag : function(){
        if(this.htConnectEnvironment.viewMode == 'app'){
            TMON.app.callApp('wear', 'goCart');
            return false;
        }
    },

    /**
     * 카트키를 받아 쿠키로 굽는다.
     * @param sCookie
     */
    setCartkeyCookie : function(sCookie){
        if(sCookie && sCookie.substring(0,9) != 'TMON_CART') {
            if(this.cartType == this.htCartType.ticket3){
                TMON.commonWear.setT3CartKeyToCookie(sCookie);
                this.getShoppingbagList();
            }else if(this.cartType == this.htCartType.normal){
                TMON.commonWear.setGNCartKeyToCookie(sCookie);
            }
        }
        //로그인 한 사용자의 경우 쇼핑백 담기가 완료되었을 때 쿠키를 구워서는 안됨.
        //로그인 한 사용자의 경우 응답받은 카트키가 TMON_CART 로 시작되므로, 앞의 9글자를 체크하여 TMON_CART 일 경우 쿠키를 굽지 않음.


        TMON.commonWear.updateShoppingbagCount();
    },

    /**
     * 쿠키로 구워진 카트키를 리턴한다.
     */
    getCartkeyCookie : function(){
        var htCartKey = TMON.commonWear.getCartKeyFromCookie();
        this.htUserInfo.cartValueNormal = htCartKey.sCartKeyNormal;
        this.htUserInfo.cartValueTicket3 = htCartKey.sCartKeyTicket3;
    },

    /**
     * 쇼핑백 리스트 API 를 호출하여 쇼핑백에 담긴 리스트를 renderShoppingbagList 메서드에 넘긴다.
     */
    getShoppingbagList : function(){
        var sCartType = this.cartType;
        if(sCartType == this.htCartType.normal){
            var sCartValue = this.htUserInfo.cartValueNormal;
        }else if(sCartType == this.htCartType.ticket3){
            var sCartValue = this.htUserInfo.cartValueTicket3;
        }

        $.ajax({
            url: TMON.wear.htAPI.getShoppingbagList.replace('{cartType}', sCartType),
            data: {
                cartKey : sCartValue,
                memberNo : this.htUserInfo.memberNo
            },
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            success: $.proxy(this.renderShoppingbagList, this),
            error: function (jqXHR, textStatus) {
                if (textStatus == "abort") {
                    return;
                }
                alert("일시적인 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
                return;
            }
        });
    },

    /**
     * 전달받은 쇼핑백 리스트 정보를 렌더링한다.
     * @param res
     * @returns {boolean}
     */
    renderShoppingbagList : function(res){
        if (res.httpStatus != "OK") {
            return false;
        }
        var htShoppingbagListData = {
            aItems : res.data,
            htUri : this.htUri,
            sAppQuery : this.htConnectEnvironment.sAppQueryQ
        };
        var sHtml = this.tplDetailShoppingbagList(htShoppingbagListData);
        this.welShoppingbagList.html(sHtml);
    },

    /**
     * 쿠폰다운로드 레이어를 띄운다.
     */
    showCouponDownloadLayer : function () {
        TMON.commonWear.layerOpen();
        var welCouponDownloadLayer = $(this.welCouponDownloadLayer);
        welCouponDownloadLayer.show();
    },

    /**
     * 카드 혜택 레이어를 띄운다.
     */
    showCardBenefitLayer : function () {
        TMON.commonWear.layerOpen();
        var welCardBenefitLayer = $(this.welCardBenefitLayer);
        welCardBenefitLayer.show();
    },

    /**
     * 상품설명 더보기
     */
    showMoreDetail : function () {
        var welMoreDetailButton = this.welMoreDetailButton
        var welMoreDetail = $(this.welMoreDetail);
        welMoreDetailButton.hide();
        welMoreDetail.show();
    },

    /**
     * 공유하기 레이어를 띄운다.
     */
    showShareLayer : function() {
        var welShareLayer = this.welShareLayer;
        welShareLayer.toggleClass('open');
    },

    toggleHiddenInfo : function(e){
        var welToggle = $(e.currentTarget).closest('.toggle');
        if(welToggle.hasClass('open')){
            welToggle.removeClass('open');
            welToggle.find('.toggle_info').slideUp( 200 );
        }else{
            welToggle.addClass('open');
            welToggle.find('.toggle_info').slideDown( 200 );
        }
    },

    /**
     * 카드 혜택 레이어 내 탭 버튼이 클릭되었을 때 호출하며, 어떤 버튼이 클릭되었느냐에 따라 내용을 토글한다.
     * @param e
     */
    changeCardBenefitLayerTab : function(e){
        var welClickedTab = $(e.currentTarget),
            welCardBenefitLayer = $(this.welCardBenefitLayer);
        welCardBenefitLayer.find('.tab li').removeClass('on');
        welCardBenefitLayer.find('.card_lst').hide();
        welClickedTab.closest('li').addClass('on');
        welCardBenefitLayer.find('.card_lst#'+welClickedTab.attr('data-target-id')).show();

    },

    /**
     * 상단 메인이미지 영역에 티몬 슬라이더 플러그인을 적용한다.
     */
    initSlide: function () {
        // 상단 Intro Gallery 부분에 Slide Init
        var welIntroGalleryPaginate = $(this.welIntroGalleryPaginate);
        var welIntroGallery = $(this.welIntroGallery);

        if(welIntroGallery.find('li').length > 1){
            welIntroGallery.tmonSlider({
                flexible : true,
                counter : function (e){
                    welIntroGalleryPaginate.find('strong').html(e.current);
                    welIntroGalleryPaginate.find('span').html(e.total);
                },
                btn_prev : this.welIntroGalleryPrevButton,
                btn_next : this.welIntroGalleryNextButton
            });
        }
    },

    /**
     * SNS 공유 버튼에 SNS 플러그인을 적용한다.
     * @param htDealInfo
     */
    initSnsShare: function (htDealInfo) {
        new SnsShare({
            sHashTags : '티몬,티켓몬스터,웨어웨어',
            htKakaotalk: {
                sMessage: '이 상품 어때요?\n' + htDealInfo.sDealTitle
            }
        });
    }
};