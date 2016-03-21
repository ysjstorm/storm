var eanImage = function(option){
    this.init(option);
};

eanImage.prototype = {
    init : function(o){
    	var self = this;
        self.options = {
            imageSuffixes : ['z', 'y', 'b', 'l', 's', 't'],
            classNamePrefix : '.eanImage-'
        };
        $.extend(self.options, o);

        // ie7, 8 indexOf 폴백
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (obj, start) {
                for (var i = (start || 0); i < this.length; i++) {
                    if (this[i] == obj) {
                        return i;
                    }
                }
            }
        }

        self.imageSuffixes = self.options.imageSuffixes;
		self.classNamePrefix = self.options.classNamePrefix;
		self.classNameSelector = self.getClassNameArray(self.classNamePrefix, self.imageSuffixes).join(',');
		$(self.classNameSelector).each(function(){
		    try{
		        var target = this;
		        var classSuffix = self.getSuffixFromClassName($(this).attr('class'));
		        var imageUrl = self.getImageUrl(this);

		        if(!self.isValidImageUrlOfEan(imageUrl)){
		            return;
		        }

		        if(self.isGoodEnough(target)){
		            return;
		        }
		        self.tryWithDifferentImageSuffix(target, self.imageSuffixes, self.imageSuffixes.indexOf(classSuffix));
		    } catch(e){
		        console.log('error!!');
		        console.log(e);
		    }
		});
    },

    getImageUrl : function(htmlElement){
        if(this.isImageObject(htmlElement)){
            return htmlElement.src;
        }
        return $(htmlElement).css('background-image').replace(/url\(\"?([^\"]*)\"?\)/, "$1");
    },

    isImageObject : function(htmlElement){
        return htmlElement.tagName == 'IMG';
    },

    isImageExistent : function(url) {
        var img = new Image();
        var deferred = $.Deferred();
        img.onload = function(){
            if ('naturalHeight' in this) {
                if (this.naturalHeight + this.naturalWidth === 0) {
                    this.onerror();
                    return;
                }
            } else if (this.width + this.height == 0) {
                this.onerror();
                return;
            }
            deferred.resolve(url);
        }
        img.onerror = function(){
            deferred.reject(url);
        }
        img.src = url;
        return deferred.promise();
    },

    isLocalImageExistent : function(imageObject){
		if ('naturalHeight' in imageObject) {
		    if (imageObject.naturalHeight + imageObject.naturalWidth === 0) {
		        return false;
		    }
		} else if (imageObject.width + imageObject.height == 0) {
		    return false;
		}
		return true;
    },

    getFileName : function(url){
		var regExp = /[^/]*$/;
        return regExp.exec(url)[0];
    },

    removeFileExtension : function(fileName){
    	var regExp = /^[^.]*/;
        return regExp.exec(fileName)[0];
    },

    getFileNameWithoutExtension : function(url){
    	return this.removeFileExtension(this.getFileName(url));
    },

    getLastCharacter : function(input){
    	return input.charAt(input.length-1);
    },

    bindImage : function(htmlElement, url){
        if(this.isImageObject(htmlElement)){
    	   htmlElement.src = url;
           return;
        }
        $(htmlElement).css('background-image', 'url(' + url + ')');
    },

    getNextSuffix : function(imageSuffixes, i){
    	var i = 0;
        if(imageSuffixes.length == ++i){
            return null;
        }
        return imageSuffixes[i];
    },

    replaceCharAt : function(str, index, newChar){
    	return str.substring(0, index) + newChar + str.substring(index+1);
    },

    getSuffixFromClassName : function(className){
    	var regExp = /eanImage-([a-z])/;
		return regExp.exec(className)[1];
    },

    getClassNameArray : function(prefix, suffixArray){
        var newArray = [];
        for(var i=0, len=suffixArray.length; i < len; i++){
            newArray.push(prefix + suffixArray[i]);
        }
        return newArray;
        // return suffixArray.map(function(suffix){ return prefix + suffix});
    },

    isGoodEnough : function(htmlElement){
        var imageUrl = this.getImageUrl(htmlElement);
        var isImageObject = this.isImageObject(htmlElement);
        var classSuffix = this.getSuffixFromClassName($(htmlElement).attr('class'));
        var lastCharacter = this.getLastCharacter(this.getFileNameWithoutExtension(imageUrl));
        var isImageExistent = this.isLocalImageExistent(htmlElement);
        if(!isImageObject){
            isImageExistent = this.isImageExistent(imageUrl);
        }

		if(isImageExistent && (this.imageSuffixes.indexOf(classSuffix) >= this.imageSuffixes.indexOf(lastCharacter))){
		    return true;
		}
		return false;
    },

    tryWithDifferentImageSuffix : function(htmlElement, imageSuffixes, i){
    	var self = this;
		if(i >= imageSuffixes.length){
		    return;
		}
		var imageUrl = self.getImageUrl(htmlElement);
		var newImageUrl = this.replaceCharAt(imageUrl, imageUrl.lastIndexOf('.')-1, imageSuffixes[i]);
		var promise = this.isImageExistent(newImageUrl);
		promise.then(function(url){
		    self.bindImage(htmlElement, url)
		}, function(){
		    self.tryWithDifferentImageSuffix(htmlElement, imageSuffixes, ++i);
		});
    },

    isValidImageUrlOfEan : function(imageUrl){
		var regExp = new RegExp('http://(images.travelnow.com|media.expedia.com)/hotels/[0-9/]+_[0-9]{1,4}_[a-z]\..*');
		if(regExp.test(imageUrl)){
		    return true;
		}
		return false;
    }
}
