function getAreaExpires() {
    var now = new Date();
    var expires = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

    return expires;
}
function setAreaTrackingCookies(dealId, area) {
    var domain = document.domain.substring(document.domain.indexOf('.'));
    var path = '/';

    $.cookie('daily_area', null, {domain: domain, path: path});
    $.cookie('session_area', null, {domain: domain, path: path});

    if (document.cookie.length > 6 * 1024 || LZString === undefined)
        return;

    var path = '/';
    var expires = getAreaExpires();

    var dailyAreaKey = 'daily_area_v2';
    var dailyAreaCookie = $.cookie(dailyAreaKey);
    var dailyAreaValue = dailyAreaCookie ? JSON.parse(LZString.decompressFromBase64(dailyAreaCookie)) : {};
    var dailyAreaArrayOfDeal = dailyAreaValue[dealId];

    if (dailyAreaArrayOfDeal === undefined)
        dailyAreaValue[dealId] = [area];
    else if (dailyAreaArrayOfDeal.indexOf(area) == -1)
        dailyAreaArrayOfDeal.push(area);

    $.cookie(dailyAreaKey, LZString.compressToBase64(JSON.stringify(dailyAreaValue)), {expires: expires, domain: domain, path: path});

    var sessionAreaKey = 'session_area_v2';
    var sessionAreaCookie = $.cookie(sessionAreaKey);
    var sessionAreaValue = sessionAreaCookie ? JSON.parse(LZString.decompressFromBase64(sessionAreaCookie)) : dailyAreaValue;
    var sessionAreaArrayOfDeal = sessionAreaValue[dealId];

    if (sessionAreaArrayOfDeal === undefined)
        sessionAreaValue[dealId] = [area];
    else if (sessionAreaArrayOfDeal.indexOf(area) == -1)
        sessionAreaArrayOfDeal.push(area);

    $.cookie(sessionAreaKey, LZString.compressToBase64(JSON.stringify(sessionAreaValue)), {domain: domain, path: path});
}
var tlstream = {
    msrl:"",
    ab_name:"",
    ab_ver:"",
    pid:"",
    sid:"",
    sid_ctime:"",
    referer:"",
    co:1,
    logurl:location.protocol + "//wlog.tmon.co.kr",
    dummy_anchor_ele: '',
    imp_params: '',
    io:1,
    init: false,

    getCommonParams: function () {
        var commonParameterMap = {
            curtime: new Date().getTime(),
            msrl: this.msrl,
            ab_name: this.ab_name,
            ab_ver: this.ab_ver,
            pid: this.pid,
            sid: this.sid,
            sid_ctime: this.sid_ctime
        };

        return $.param(commonParameterMap);
    },

    sendClickLog: function (parameterMap) {
        var commParams = this.getCommonParams();
        var url = this.logurl + '/tmc.html?'
            + commParams
            + '&scr_height=' + screen.height
            + '&scr_width=' + screen.width
            + '&' + $.param(parameterMap);

        var clkImg = new Image();
        clkImg.src = url;

        if (location.search.search('view_mode=app') > 0) {
            return;
        }

        sendGaAreaClickLog();

        function sendGaAreaClickLog() {
            var area = parameterMap['area'];
            var order = parameterMap['linkord'];
            var label = parameterMap['label'];
            var href = parameterMap['href'];

            if (!area) {
                return;
            }

            var areaTrackLabel = area + '.' + order;
            if (label) {
                areaTrackLabel += ("_" + label);
            }

            gaSendEventForWeb('MW_AreaTrack', 'click', areaTrackLabel);

            var dealId = parameterMap['dealid'];
            if (dealId) {
                gaSendEventForWeb('MW_Area-Deal', 'click', area, {dimension8: dealId});
                setAreaTrackingCookies(dealId, area);
            }
        }
    },

    send: function (type, params) {
        var commParams = this.getCommonParams();
        var url = '';

        if (type == "impression") {
            url = this.logurl+"/tmi.html?"+commParams;
            url += params;
            url += this.imp_params;
            url += "&io="+this.io;

            referer_info = document.createElement('a');
            referer_info.href = document.referrer;
            var new_referer_host = referer_info.host;
            new_referer_host = new_referer_host.replace(/:[0-9]*$/,"");

            url += "&new_referer_host="+new_referer_host;
            url += "&new_referer_path="+referer_info.pathname;
            url += "&new_referer_q="+encodeURIComponent(referer_info.search);

            referer_cookie_info = document.createElement('a');
            referer_cookie_info.href = $.cookie('PREV_PAGE');
            var seq_referer_host = referer_cookie_info.host;
            seq_referer_host = seq_referer_host.replace(/:[0-9]*$/,"");

            url += "&seq_referer_host="+seq_referer_host;
            url += "&seq_referer_path="+referer_cookie_info.pathname;
            url += "&seq_referer_q="+encodeURIComponent(referer_cookie_info.search);

            var domain = document.domain.substring(document.domain.search(/(\.ticketmonster|\.tmon)/));
            $.cookie('PREV_PAGE', location.href, {domain: domain, path: '/', expires: 1});
        } else if (type == "app_download") {
            /*
             * google analytics
             * 앱 다운로드 click event tracking
             */
            gaSetEventTracking('app_download', 'download', getAgentOs());
        } else {
            return;
        }

        var clkImg = new Image();
        clkImg.src = url;
    },

    set_env: function (msrl, ab_name, ab_ver, pid, sid, sid_ctime, referer) {
                 this.msrl = msrl;
                 this.ab_name = $.stringify(ab_name);
                 this.ab_ver = ab_ver ? $.stringify(ab_ver) : '';
                 this.pid = pid;
                 this.sid = sid;
                 this.sid_ctime = sid_ctime;
                 this.referer = referer;
             }
};


function log_parse_url(href)
{
    if (typeof(href) === "undefined" || href === '' || /^#/.test(href) === true) {
        return {dealid:'', deallist: ''};
    }

    var dealid = '';
    var deallist = '';
	
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ // IE
	    dealid = (href.match(/deal\/detailDaily\/([^\/?#]+)/i) || [,''])[1];
	    deallist = (href.match(/deal\?cat=.*filter=([^\/?#]+)/i) || [,''])[1];
	} else {
	    dealid = (href.match(/\/deal\/detailDaily\/([^\/?#]+)/i) || [,''])[1];
	    deallist = (href.match(/\/deal\?cat=.*filter=([^\/?#]+)/i) || [,''])[1];
	}

    dealid = dealid || (href.match(/[?#&]mainDealSrl=([0-9]*)/i) || [,''])[1];

    return {
        dealid: typeof(dealid) === "undefined" ? '' : dealid,
        deallist: typeof(deallist) === "undefined" ? '' : deallist
    };
}

function log_get_impression_params()
{
    var exclude_areas = {'MHCA':true, 'MRPA':true, 'MFBA':true, 'MSPA':true, 'MTMA':true, 'MCSA':true,
        'MTLA':true, 'MLOA':true, 'MBCA':true, 'M2TA':true, 'SRMLK':true, 'SRMWRK':true, 'SRMWGT':true,
        'SRMWST':true};
    var href_areas = {};
    var dealHashtable = {};
    var areaHashtable = {};
    $("a").each(function() {
        try {
            var obj = $(this);
            var anchor_area = obj.attr("tl:area");
            if (typeof(anchor_area) !== "undefined" && anchor_area.length >= 4) {
                if (exclude_areas[anchor_area] === true) { return 'non-false'; }
                if (!areaHashtable.hasOwnProperty(anchor_area)) { areaHashtable[anchor_area] = ''; }

                var ord = obj.attr("tl:ord");
                if (typeof(ord) === "undefined") { ord = 0; }

                // query parameters
                var p = log_parse_url(this.href, obj.attr('href'));
                if (p.dealid === '' && p.deallist === '' && href_areas[anchor_area] === true) {
                    if (ord != 0) {
                        p.dealid = encodeURIComponent(obj.attr('href'));
                    }
                }

                if (p.dealid !== '' || p.deallist !== '') {
                    var key = p.deallist+','+p.dealid+','+ord;
                    if (!dealHashtable.hasOwnProperty(anchor_area+key)) {
                        dealHashtable[anchor_area+key] = 1;
                        areaHashtable[anchor_area] += key+"|";
                    }
                }
            }
        } catch (e) {}
    });

    var param_str = '';
    for (var area in areaHashtable) {
        if (areaHashtable[area].length > 0) { param_str += "&p[]="+area+"|"+areaHashtable[area]; }
    }

    return param_str;
}

function log_get_xpath(element)
{
    var xpath = '';
    for ( ; element && element.nodeType == 1; element = element.parentNode )
    {
        var id = $(element.parentNode).children(element.tagName).index(element) + 1;
        var nd = element.tagName.toLowerCase();
        if (nd != 'html' && nd != 'body') {
            id = '[' + id + ']';
        } else {
            id = '';
        }
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
    }
    return xpath;
}

function google_analytics_app_download()
{
    tlstream.send("app_download");
}

var cliDoc = document.documentElement && document.documentElement.clientHeight !== 0 ? document.documentElement : document.body;
function log_click(link,event)
{
    if (isFrequentClick()) {
        return;
    }

    function isFrequentClick() {
        var currentTimeMillis = $.now();

        if (window.log_click_timing === undefined
            || currentTimeMillis - window.log_click_timing > 100) {
            window.log_click_timing = currentTimeMillis;

            return false;
        }

        return true;
    }

    var obj = $(link);
    var href = obj.attr('href');
    var pu = log_parse_url(href);
    var area = $.trim(obj.attr("tl:area"));
    var linkord = $.trim(obj.attr("tl:ord"));
    var linktype = $.trim(obj.attr("tl:linktype"));
    var label = $.trim(obj.attr("tl:label"));
    var linktext = $.trim(obj.text().replace(/\s+/g, ' '));
    var xpath = log_get_xpath(link);
    var srch_col = $.trim(obj.attr("tl:srch_col"));

    area = typeof(area) === "undefined" ? '' : area;
    href = typeof(href) === "undefined" ? '' : href;
    linkord = typeof(linkord) === "undefined" ? '' : linkord;
    linktype = typeof(linktype) === "undefined" ? 'img' : linktype;
    label = typeof(label) === "undefined" ? '' : label;
    linktext = typeof(linktext) === "undefined" ? '' : linktext;
    srch_col = typeof(srch_col) === "undefined" ? '' : srch_col;

    obj_pos = {left:0,top:0};
    if (event) {
        obj_pos.left = Math.round(event.pageX);
        obj_pos.top = Math.round(event.pageY);
    }

    var pivot_pos = $("#header").offset();
    if (pivot_pos) {
        pivot_pos.left = Math.round(pivot_pos.left);
        pivot_pos.top = Math.round(pivot_pos.top);
    } else {
        pivot_pos = {left:-1,top:-1};
    }

    var parameterMap = {
        co: tlstream.co++,
        area: area,
        dealid: pu.dealid,
        deallist: pu.deallist,
        link: link.href,
        href: href,
        linkord: linkord,
        linktype: linktype,
        label: label,
        linktext: linktext,
        xpos: obj_pos.left,
        ypos: obj_pos.top,
        pivot_x: pivot_pos.left,
        pivot_y: pivot_pos.top,
        xpath: xpath,
        srch_col: srch_col
    };

    if (typeof(cliDoc) != "undefined") {
        parameterMap["clientw"] = cliDoc.clientWidth;
        parameterMap["clienth"] = cliDoc.clientHeight;
        parameterMap["scrollw"] = cliDoc.scrollWidth;
        parameterMap["scrollh"] = cliDoc.scrollHeight;
        parameterMap["scrollx"] = (window.pageXOffset || cliDoc.scrollLeft);
        parameterMap["scrolly"] = window.pageYOffset || cliDoc.scrollTop;
    }

    tlstream.sendClickLog(parameterMap);
}

function tl_ext_add_impression(params)
{
    if (typeof(params) === "undefined") { return ;}

    tlstream.io++;
    tlstream.imp_params = '';
    if (params.match(/[A-Z,0-9]+\|/)) {
        tlstream.send("impression", "&p[]="+params);
    }
}

function tl_ext_append_impression(params)
{
    if (typeof(params) === "undefined") { return ;}

    if (params.match(/[A-Z,0-9]+\|/)) {
        tlstream.imp_params += "&p[]="+params;
    }
}

function log_impression()
{
    var params_str = log_get_impression_params();
    if (params_str.length > 0) {
        tlstream.send("impression", params_str);
    }
}

function log_init_env()
{
    if (tlstream.init == true) { return; }

    tlstream.dummy_anchor_ele = document.createElement('a');
    if (typeof(tl_vars) === "undefined") {
        tlstream.set_env("","","","","","","");
    } else {
        tlstream.set_env(tl_vars["m_no"],tl_vars["abtest_name"],tl_vars["abtest_version"],tl_vars["p_id"],tl_vars["s_id"],tl_vars["sid_ctime"],tl_vars["referer"]);
        tlstream.init = true;
    }
}

$(document).ready(function(){
        log_init_env();

        log_impression();
});

$(document).on("mousedown", "a", function(event) {
    log_click(this,event);
});
$(document).on("mousedown", "button", function(event) {
    log_click(this,event);
});

/*
 * google analytics event tracking
 */
function getAgentOs() {
    var ua = navigator.userAgent;
    var agentOs = '';
    if (ua.match(/android/i))
        agentOs = 'ad';
    else if (ua.match(/iPhone/i) || ua.match(/iPad/i) || ua.match(/iPod/i))
        agentOs = 'ios';

    return agentOs;
}



function gaSetEventTracking(category, action, label, value, non_interaction) {
    if ((typeof(ga) != "undefined" && ga != null) && category.length > 0 && action.length > 0) {
        label = label || null;
        value = value || null;
        non_interaction = non_interaction || 0;
        
        var fieldObject = {};
        if (value) {
            var value_arr = value.split("&");
            for(var i=0; i < value_arr.length; i++) {
                var tmparr = value_arr[i].split("=");
                var dimension = tmparr[0];
                var dimvalue = tmparr[1];

                fieldObject[dimension] = dimvalue;
            }
        }
        fieldObject['nonInteraction'] = non_interaction;

        ga('send', 'event', "MW_" + category, action, label, fieldObject);
    }
}
