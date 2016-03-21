/**
 * 2015.12.30 기존 PHP의 app launch 코드 소스를 그대로 가져옴
 * 티몬 앱 런칭 공통 스크립트
 */
TMON.launchApp = {
    // 딜 상세로 이동
    goDeal : function(jp, ln, deal_srl){
        if (deal_srl) {
            var ad_url = '&launch_type=dailyDeal&launch_id=' + deal_srl;
            var ios_url = '&type=daily&deal=' + deal_srl;
            TMON.launchApp.__init_run(jp, ln, ad_url, ios_url, deal_srl, 'deal');
        }
    },

    // 기획전으로 이동
    goPlan : function(jp, ln, plan_srl){
        if (plan_srl) {
            var ad_url = '&launch_type=dailyCategory&launch_id=' + plan_srl;
            var ios_url = '&type=dailyCategory&cat_srl=' + plan_srl;
            TMON.launchApp.__init_run(jp, ln, ad_url, ios_url);
        }
    },

    // 상세 카테고리로 이동
    goCategory : function(jp, ln, cat_srl, subcat_srl){
        var l_id;
        if (cat_srl && subcat_srl) {
            l_id = cat_srl + "!" + subcat_srl; // [2차카테고리SRL]![3차카테고리SRL]
            ad_url = '&launch_type=directCategory&launch_id=' + l_id;
            ios_url = '&type=directCategory&launch_id=' + l_id;
        } else {
            l_id = '';
            ad_url = '';
            ios_url = '';
        }
        TMON.launchApp.__init_run(jp, ln, ad_url, ios_url);
    },

    // 프로모션으로 이동
    goPromotion : function(jp, ln, url, rc){
        if (url) {
            var ad_url = '&launch_type=popup&launch_id=' + encodeURIComponent(url);
            var ios_url = '&type=popup&launch_id=' + url;
            TMON.launchApp.__init_run('none', rc, ad_url, ios_url);
        }
    },

    // 콜렉션으로 이동
    goCollection : function(jp, ln, collection_srl) {
        if (collection_srl) {
            var ad_url = '&launch_type=collection&launch_id=' + collection_srl;
            var ios_url = '&type=collection&launch_id=' + collection_srl;
            TMON.launchApp.__init_run(jp, ln, ad_url, ios_url);
        }
    },

    // 메인으로 이동
    goMain : function(jp, ln, referrer){
        TMON.launchApp.__init_run(jp, ln, '', '', referrer);
    },

    __init_run : function(jp, ln, pfx_ad_url, pfx_ios_url, referrer, type){
        // GA Tracking 정보
        var gaParam = TMON.launchApp.__decode_ga_param($.cookie('_ga_param'));

        // 앱 이동 및 설치를 위한 정보
        var jp_val = jp || 'none';
        var ln_val = ln || 'none';
        var ad_url_scheme = 'tmon://main?launch_path=' + ln_val + pfx_ad_url;
        var ios_url_scheme = 'tmonapp://launch?launch_path=' + ln_val + pfx_ios_url;
        var ref_scheme = referrer || (gaParam || ('utm_source=' + ln_val + '&utm_medium=' + jp_val));

        if (TMON.app) {
            TMON.app.runAppOrInstall(ad_url_scheme, ios_url_scheme, ref_scheme, type);
        } else {
            alert('TMON.app object not found!');
        }
    },

    __decode_ga_param : function(gaParam){
        var ga_param = null;
        if (gaParam && gaParam.length > 0) {
            ga_param = decodeURI(gaParam);
            ga_param = ga_param.replace(/#s!/gi, '');
            ga_param = ga_param.replace(/#25/gi, '%');
            ga_param = ga_param.replace(/%3D/gi, '=');
            ga_param = ga_param.replace(/%26/gi, '&');
            ga_param = decodeURI(ga_param);
        }
        return ga_param;
    }
};