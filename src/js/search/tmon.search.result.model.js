var searchResultModel = function () {
    this.init.apply(this, arguments);
}

searchResultModel.prototype = {
    attributes: [],

    init: function () {
        var keyword = decodeURIComponent((TMON.util.gup("keyword")));
        var attributes = decodeURIComponent((TMON.util.gup("attributes")));
        var searchType = decodeURIComponent((TMON.util.gup("searchType")));
        var categoryName = decodeURIComponent((TMON.util.gup("categoryName")));
        var uvCatCode = decodeURIComponent((TMON.util.gup("uvCatCode")));
        var catSrl = decodeURIComponent((TMON.util.gup("catSrl")));
        var page = decodeURIComponent((TMON.util.gup("page")));
        var sort = decodeURIComponent((TMON.util.gup("sort")));
        var order = decodeURIComponent((TMON.util.gup("order")));
        var isDeliveryFree = decodeURIComponent((TMON.util.gup("isDeliveryFree")));
        var isSuperMartDelivery = decodeURIComponent((TMON.util.gup("isSuperMartDelivery")));

        if (keyword != "null") {
            this.keyword = keyword;
        }

        if (attributes != "null") {
            this.attributes = attributes.split(",");
        } else {
            this.attributes = [];
        }

        if (page != "null") {
            this.page = page;
        } else {
            this.page = 1;
        }

        if (sort != "null") {
            this.sort = sort;
        } else {
            this.sort = "popular";
        }

        if (order != "null") {
            this.sort = order;
        }

        if (searchType != "null") {
            this.searchType = searchType;
        }

        if (categoryName != "null") {
            this.categoryName = categoryName;
        } else {
            this.categoryName = "전체";
        }

        if (catSrl != "null") {
            var nSupermartCatSrl = "19000000";

            if (catSrl == nSupermartCatSrl) {
                this.uvCatCode = "SM";
            } else {
                this.catSrl = catSrl;
            }
        }

        if (isDeliveryFree != "null") {
            this.isDeliveryFree = isDeliveryFree;
        } else {
            this.isDeliveryFree = "N";
        }

        if (isSuperMartDelivery != "null") {
            this.isSuperMartDelivery = "Y";
        } else if (this.uvCatCode == "SM") {
            this.isSuperMartDelivery = "Y";
        } else {
            this.isSuperMartDelivery = "N";
        }
    },

    reload: function(){
        var attributes = decodeURIComponent((TMON.util.gup("attributes")));

        if (attributes != "null") {
            this.attributes = attributes.split(",");
        } else {
            this.attributes = [];
        }
    },

    setCategory: function (category) {
        if ($.isNumeric(category)) {
            this.catSrl = Number(category);
            delete this.uvCatCode;
        } else if (category != "") {
            this.uvCatCode = category;
            delete this.catSrl;
        } else {
            delete this.catSrl;
            delete this.uvCatCode;
        }
    },

    removeCategory: function () {
        delete this.catSrl;
        delete this.uvCatCode;
    },

    pushAttribute: function (obj) {
        this.attributes.push(obj);
        this.callAttributeHandler("push");
    },

    popAttribute: function (sRemoveKeyword) {
        this.attributes = $.grep(this.attributes, function (value) {
            return value != sRemoveKeyword;
        })
        this.callAttributeHandler("pop");
    },

    callAttributeHandler: function (sType) {
        //this.hashUpdate();
    },

    hashUpdate: function () {
        this.nHashNumber = 1;
        this.setLocationHash();
    },

    setLocationHash: function () {
        if (this.attributes.length != 0) {
            location.hash = this.nHashNumber + "&attributes=" + this.attributes.join(",");
        } else {
            location.hash = this.nHashNumber;
        }

        this.nHashNumber++;
    },

    setModelAttribute: function (htOption) {
        for (var key in htOption) {
            if (htOption.hasOwnProperty(key)) {
                this[key] = htOption[key];
            }
        }
    }
}