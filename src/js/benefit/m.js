var TmonMobile = function(view_mode, app_os) {
    this.view_mode = view_mode;
    this.app_os = app_os;
}

// default value
TmonMobile.prototype.view_mode = 'web';
TmonMobile.prototype.app_os = '';
TmonMobile.prototype.interfaceMap = {};

// methods
TmonMobile.prototype.setTitle = function(title) {
    document.title = title + ' - 티몬 모바일';
    if (this.view_mode == 'web')
        $('#web_header_title').text(title);
}

TmonMobile.prototype.isAndroid = function() {
    return navigator.userAgent.match(/android/i);
}

TmonMobile.prototype.isIos = function() {
    return navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i);
}

TmonMobile.prototype.isIphone = function() {
    return (navigator.userAgent.match(/iPhone/i) &&
        !navigator.userAgent.match(/iPhone OS 3_1_2/i) &&
        !navigator.userAgent.match(/iPhone OS 3_2_2/i)) ||
        navigator.userAgent.match(/iPod/i);
}

TmonMobile.prototype.isIpad = function() {
    return navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPhone OS 3_1_2/i) ||
        navigator.userAgent.match(/iPhone OS 3_2_2/i);
}

TmonMobile.prototype.isChrome = function() {
    return navigator.userAgent.match(/Chrome/i);
}

TmonMobile.prototype.callApp = function(type, func, arg1, arg2, more) {
    if (this.view_mode != 'app')
        return;

    if (!type)
        return;

    if (this.app_os == 'ios') {
        var url = 'tmon-ios://' + type + '/' + func;
        if (arguments.length > 2) {
            var sep = '?';
            for (var i = 2; i < arguments.length; i++) {
                url += sep + (i - 2) + '=' + encodeURIComponent(arguments[i]);
                sep = '&';
            }
        }
        var iframe = document.createElement('IFRAME');
        iframe.setAttribute('src', url);
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
    }
    else if (this.app_os == 'ad') {
        var interface_name = "";
        if (type == "tmon_hasoffers") {
            interface_name = type;
        }
        else {
            interface_name = 'tmon_ad_' + type;
        }
        console.log(window);
        console.log(window[interface_name]);
        if (window[interface_name] == null)
            return;

        if (window[interface_name][func] == null)
            return;

        var args = Array.prototype.slice.call(arguments, 2);
        console.log(window[interface_name][func]);
        window[interface_name][func].apply(window[interface_name], args);
    }
}

TmonMobile.prototype.callWeb = function(type, func, arg1, arg2, more) {
    if (this.view_mode != 'app')
        return;

    if (this.interfaceMap[type] == null)
        return;

    if (this.interfaceMap[type][func] == null)
        return;

    var args = Array.prototype.slice.call(arguments, 2);
    return this.interfaceMap[type][func].apply(this.interfaceMap[type], args);
}

TmonMobile.prototype.registerWebInterface = function(type, interface_obj) {
    this.interfaceMap[type] = interface_obj;
}

TmonMobile.prototype.runAppOrInstall = function(ad_url_scheme, ios_url_scheme, ad_referrer) {

    var start = new Date();
    var isAndroid = this.isAndroid();
    var isIos = this.isIos();
    var isChrome = this.isChrome();

    var mat_ad_url = $.cookie('_mat_ad_url');
    var mat_ios_url = $.cookie('_mat_ios_url');
    setTimeout(function() { //설치된 앱으로 이동하지 못한 경우 처리

        //app 실행후 다시 브라우저로 왔을때 setTimeout이 실행되는 경우가 있으므로
        //2초 이내에 setTimeout 이 실행된 경우에만 앱 설치페이지로 이동함
        var re_start = new Date();
        var datediff = re_start.getTime() - start.getTime();
        if (datediff > 2000) {
            return;
        }

        if (isAndroid) {
            //do nothing
        }
        else if (isIos) {
            //app store 이동
            window.location.href = 'https://itunes.apple.com/kr/app/timon-tmon/id463434588?mt=8&uo=4';
        }
        else {
            //모바일 웹으로 이동
            window.location.href = '/';
        }

    }, 1000);
    if (isAndroid) {
        if (mat_ad_url) {
            window.location.href = mat_ad_url;
        } else {
            if (ad_referrer) {
                ad_url_scheme += "&" + ad_referrer;
            }
            window.location.href = "market://details?id=com.tmon&url=tmon://" + encodeURIComponent(ad_url_scheme.replace("tmon://", "")) + (ad_referrer ? "&referrer=" + encodeURIComponent(ad_referrer) : "");
        }
    } else if (isIos) {
        if (mat_ios_url)
            window.location.href = mat_ios_url;
        else
            window.location.href = ios_url_scheme;
    } else {
        //모바일 웹으로 이동
        window.location.href = '/';
    }
}

TmonMobile.prototype.getURLParam = function(sname) {
    var params = location.search.substr(location.search.indexOf("?")+1);
    var sval = "";
    params = params.split("&");
    for (var i=0; i<params.length; i++) {
        temp = params[i].split("=");
        if ([temp[0]] == sname) {
            sval = temp[1];
            break;
        }
    }
    return sval;
}

TmonMobile.prototype.matchURL = function(pattern) {
    var path = location.pathname;
    var re = new RegExp(pattern);
    return re.test(path);
}

TmonMobile.prototype.gaPageView = function() {
    if (this.view_mode != 'app')
        return;

    this.callApp("ga", "setPageViewTracking", location.pathname);
}

TmonMobile.prototype.gaEcommerce = function (transaction, items) {
    for (var i = 0; i < items.length; ++i) {
        var item = items[i];
        this.callApp('ga', 'setEcommerceTrackingByItem', item.id.toString(), item.name, item.sku, item.category, parseInt(item.price), parseInt(item.quantity), item.currency);
    }

    this.callApp('ga', 'setEcommerceTracking', transaction.id.toString(), transaction.affiliation, parseInt(transaction.revenue), parseInt(transaction.tax), parseInt(transaction.shipping), transaction.currency);
}

TmonMobile.prototype.gaSendEvent = function(eventMap) {
    this.callApp("ga", "setEventTracking", eventMap.eventCategory, eventMap.eventAction, eventMap.eventLabel, parseInt(eventMap.eventValue));
}

TmonMobile.prototype.gaEventTracking = function(category, action, label, value, fieldMap) {
    if (this.view_mode != 'app')
        return;

    category = this.app_os.toUpperCase() + "_" + category;

    label = label || '';
    value = value || 0;
    fieldMap = fieldMap || null;

    if (category && action) {
        if (fieldMap)
            this.callApp("ga", "setEventTracking", category, action, label, parseInt(value), fieldMap);
        else
            this.callApp("ga", "setEventTracking", category, action, label, parseInt(value));
    }
}

TmonMobile.prototype.hasoffersEcommerce = function(transaction, items) {
    transaction.currencyCode = transaction.currency;
    delete transaction.currency;

    for (var i = 0; i < items.length; i++){
        items[i].currencyCode = items[i].currency;
        delete items[i].currency;
    }

    transaction.items = items;

    var jsonStr = JSON.stringify(transaction);

    this.callApp("tmon_hasoffers", "setPurchaseTracking", jsonStr);
}

TmonMobile.prototype.hasoffersRegister = function(userNo, age, gender) {
    if (userNo) {
        if (gender == "M")
            gender = "0";
        else if (gender == "F")
            gender = "1";

        this.callApp("tmon_hasoffers", "setRegisterTraking", userNo, null, null, age, gender);
    }
}

/* other stuffs */
var supportsOrientationChange = "onorientationchange" in window,
orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";


var catCookieKey = "tm_recent_cat";
var locCookieKey = "tm_location";
var applinkCookieKey = "tm_app_link";

function rollBanner()
{
    goNext();
}

var initOffset = 0;
var rollPage = 0;
var totalPage = 0;
var id = null;

function goPrev()
{
    rollPage = rollPage <= 0 ? totalPage - 1 : rollPage - 1;
    setPage(rollPage);
    clearInterval(id);
    id = serInterval(rollBanner, 3000);
}

function goNext()
{
    rollPage = rollPage >= totalPage - 1 ? 0 : rollPage + 1;
    setPage(rollPage);
    clearInterval(id);
    id = setInterval(rollBanner, 3000);
}

function runSpin(elementId){
    var opts = {
        lines: 13,
        length: 4,
        width: 2,
        radius: 5,
        coners: 1,
        rotate: 0,
        color: '#0f0f0f',
        speed: 1.6,
        trail: 60,
        shadow: false,
        hwaccel: true,
        className: 'spinner',
        zIndex: 2e9,
        top: 70,
        left: 'auto'
    };
    var target = document.getElementById(elementId);
    var spinner = new Spinner(opts).spin(target);
}
