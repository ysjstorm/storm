
var hotelLocalStorage = function(sKey, nMaxCount){
    this.init(sKey, nMaxCount);
};

hotelLocalStorage.prototype = {
    htConf: {
        salt: "we8d",
        keys: {}
    },

    storage: {},

    init : function(sKey, nMaxCount){
        this.sKey = sKey;
        this.storage = {};
        this.nMaxCount = nMaxCount;
        this.htConf.keys = {};
        var key = this.htConf.keys[sKey] = this.getHash(sKey);
        this.storage[key] = JSON.parse(localStorage.getItem(key));
    },

    errors : {
        invalid_key: function(msg) { this.message = msg + " is an invalid key."; this.name = "invalid_key"; },
        nothing_to_pop: function(msg) { this.message = "Storage(" + msg + ") is empty. Nothing to pop."; this.name = "nothing_to_pop"; }
    },

    addItem : function(obj) {
        var key = this.htConf.keys[this.sKey];

        if (null == this.storage[key]){
            this.storage[key] = new Array(obj);
        }else{
            for (var i= 0; i<this.storage[key].length; i++){
                if (this.storage[key][i].wordKr == obj.wordKr){
                    this.storage[key].splice(i,1); // 같은 목적지가 있으면 삭제한다.
                    i--;
                }
            }
            this.storage[key].unshift(obj);
        }

        this.storage[key] = this.storage[key].slice(0, this.nMaxCount); // 최대 개수만큼 잘라준다.
        localStorage.setItem(key, JSON.stringify(this.storage[key]));
    },

    getLastItem : function() {
        var key = this.htConf.keys[this.sKey];

        if (null == this.storage[key]){
            throw new this.errors.nothing_to_pop(key);
        }else{
            return JSON.parse(localStorage.getItem(key))[0];
        }
    },

    removeAll : function() {
        var key = this.htConf.keys[this.sKey];
        localStorage.removeItem(key);
        this.storage[key] = null;
    },

    getAllItems : function() {
        var key = this.htConf.keys[this.sKey];

        if (this.storage[key] != null){
            return {
                recentKeyword: JSON.parse(localStorage.getItem(key))
            };
        }
    },

    getHash: function(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            v_char = str.charCodeAt(i);
            hash = v_char + (hash << 6) + (hash << 16) - hash;
        }
        return this.htConf.salt+hash;
    }
};