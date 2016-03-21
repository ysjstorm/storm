/**
 * Created by belwort on 15. 2. 2..
 */

TMON.util = {
    dump : function(obj, doAlert) {
        var s = '';
        for (var i in obj)
            s += i+': '+obj[i]+"\n";

        if (doAlert){
            alert(s);
        }else{
            return s;
        }
    },

    setCookie : function(name, value, options) {
        options = options || {};
        if (!options.domains) {
            if (!options.domain)
                options.domains = ['.tmon.co.kr', '.ticketmonster.co.kr'];
            else
                options.domains = [options.domain];
        }
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var secure = options.secure ? '; secure' : '';
        for (var i in options.domains) {
            var domain = '; domain=' + (options.domains[i]);
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        }
    },

    getCookie : function(name) { //only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie;
            var start_idx = cookies.indexOf(name+'=');
            if (start_idx != -1) {
                cookieValue = cookies.substring(start_idx+name.length+1);
                var end_idx = cookieValue.indexOf(';');
                if (end_idx == -1){
                    end_idx = cookieValue.length;
                }
                cookieValue = decodeURIComponent(cookieValue.substring(0,end_idx));
            }
        }
        return cookieValue;
    },

    /**
     * 현재 모드가 app일 경우 redirect URL에 query string을 추가해서 리턴한다.
     * @param sUrl
     */
    attachQuerySting : function(sUrl){
        if(TMON.view_mode != "app" || TMON.sAppQuery == ""){
            return sUrl;
        }

        return sUrl.indexOf("?") > 0 ? (sUrl + "&" + TMON.sAppQuery) : (sUrl + "?" + TMON.sAppQuery);
    },

    /**
     * IOS 버전을 리턴한다.
     * @returns {*[]}
     */
    getIOSVersion : function(){
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
            var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
        }

        return false;
    },

    /**
     * 100000 => 100,000
     * @param nNum
     * @returns {string}
     */
    numberWithComma : function(nNum){
        return nNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    /**
     * Get parameter value from URL
     * @param name : parameter name
     * @returns {*}
     */
    gup : function(name) {
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( window.location.href );
        if( results == null ){
            return null;
        }
        else{
            return results[1];
        }
    },

    getHash : function(){
        return location.hash.replace(/^#/, "");
    }

};


jQuery.extend({
    stringify  : function stringify(obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string"){
                obj = '"' + obj + '"';
            }
            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);

            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (obj.hasOwnProperty(n)) {
                    if (t == "string") {
                        v = '"' + v + '"';
                    } else if (t == "object" && v !== null) {
                        v = jQuery.stringify(v);
                    }
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    }
});

/**
 * 자기 자신 전체 HTML을 리턴한다.
 * @returns {string|outerHTML}
 */
jQuery.fn.outerHTML = function() {
    return (this[0]) ? this[0].outerHTML : '';
};

if (typeof console == "undefined") {
    this.console = {log: function() {}};
}

/**
 * array에서 특정 값 제거
 * @param x
 */
Array.prototype.remove = function(x) {
    var i;
    for(i in this){
        if(this[i].toString() == x.toString()){
            this.splice(i,1)
        }
    }
};

/**
 * string String::cutByte(int len)
 * 글자를 앞에서부터 원하는 바이트만큼 잘라 리턴합니다.
 * 한글의 경우 2바이트로 계산하며, 글자 중간에서 잘리지 않습니다.
 */
String.prototype.cutByte = function(len) {
    var str = this;
    var count = 0;

    for(var i = 0; i < str.length; i++) {
        if(escape(str.charAt(i)).length >= 4)
            count += 2;
        else
        if(escape(str.charAt(i)) != "%0D")
            count++;


        if(count >  len) {
            if(escape(str.charAt(i)) == "%0A")
                i--;
            break;
        }
    }
    return str.substring(0, i);
};

/**
 * bool String::byte(void)
 * 해당스트링의 바이트단위 길이를 리턴합니다. (기존의 length 속성은 2바이트 문자를 한글자로 간주합니다)
 */
String.prototype.byte = function() {
    var str = this;
    var length = 0;
    for(var i = 0; i < str.length; i++)
    {
        if(escape(str.charAt(i)).length >= 4)
            length += 2;
        else if(escape(str.charAt(i)) == "%A7")
            length += 2;
        else
        if(escape(str.charAt(i)) != "%0D")
            length++;
    }
    return length;
};