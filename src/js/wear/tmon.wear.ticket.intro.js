var wearTicketIntro = function(){
	this.init();
};

wearTicketIntro.prototype = {
	_sDirection : "left",
	_nSpeed: 500,
	_htMax: { "w": 256, "h": 272 },
	_htMin: { "w": 193, "h": 205 },
	_nBigWidth: 0,
	_nSmallWidth: 0,

	init: function() {
		this.cacheElement();
		this.setEvent();
		this.ready();
		this.onResizeWindow();
		this.setTicketMainCookie();

		// TODO: DOM 구조가 구성되는 동안 점멸현상을 가리기 위한 임시변통.
		this._welContainer.animate({
			"opacity": 1
		}, {
			"duration": 1000
		});
	},

	ready: function(){
		// 무한 rotation을 위한 앞뒤 버퍼 추가.
		if(this.getSlides().size() > 1){
			var _welPre = this.getSlides().clone(true).replaceClass("big", "small").addClass("cloned");
			var _welPost = _welPre.clone(true);

			this._welContainer.append(_welPre);
			this._welContainer.prepend(_welPost);
		}else{
			this._welContainer.addClass("only");
		}

		var welBig = this.getBigSlide();
		var welSmall = this.getSlides().filter(".small");

		welBig.prev().addClass("prev");
		welBig.next().addClass("next");

		this._welContainer.width(welSmall.size() * this._nSmallWidth + welBig.size() * this._nBigWidth);
		this._welBox.width("100%");
	},

	cacheElement: function(){
		this._welContainer = $(".gallery");
		this._welBox = this._welContainer.parent();
		this.getSlides().first().replaceClass("small", "big");

		var welBig = this.getBigSlide();
		var welSmall = this.getSlides().filter(".small");

		this._htMax = {
			"w": welBig.width(),
			"h": welBig.height()
		};
		this._htMin = {
			"w": welSmall.width(),
			"h": welSmall.height()
		};

		this._nBigWidth = welBig.outerWidth(true);
		this._nSmallWidth = welSmall.outerWidth(true);
	},

	setEvent: function() {
		$(window).resize($.proxy(this.onResizeWindow, this));

		// slide 갯수가 1개인 경우 애니메이션 listener를 등록하지 않는다.
		if(this.getSlides().size() > 1){
			this._welContainer.swipe($.proxy(this.onSwipe, this), {preventDefault: false});

			this._welContainer.on("click", "li.prev a", $.proxy(this.onClickPrev, this));
			this._welContainer.on("click", "li.next a", $.proxy(this.onClickNext, this));
			this._welContainer.on("click", "li.small a", function(event){
				event.preventDefault();
				event.stopPropagation();
			});

			$(document).on("keydown", $.proxy(this.onKeydown, this));
		}
	},

	// 계속 변화하는 값이므로 버퍼에 넣을 수 없다.
	getBigSlide: function(){
		return this._welContainer.find("li.big");
	},

	getSlides: function(){
		return this._welContainer.find("li");
	},

	onClickPrev: function(event){
		event.preventDefault();
		event.stopPropagation();

		this._sDirection = "right";
		this.goPrev();
	},

	onClickNext: function(event){
		event.preventDefault();
		event.stopPropagation();

		this._sDirection = "left";
		this.goNext();
	},

	onKeydown: function(event){
		switch(event.keyCode){
			case 37: // 좌
				this._sDirection = "right";
				this.goPrev();
				break;
			case 39: // 우
				this._sDirection = "left";
				this.goNext();
				break;
		}
	},

	onSwipe: function(sDirection){
		this._sDirection = sDirection;

		if(this._sDirection == "right"){
			this.goPrev();
		}else if(this._sDirection == "left"){
			this.goNext();
		}
	},

	onResizeWindow: function(){
		if(this._welContainer.width() > this._welBox.width()){
			var nCount = this.getBigSlide().prevAll().size();
			var nLeft = this._welBox.width() / 2 - nCount * this._nSmallWidth - this._nBigWidth / 2;

			this._welContainer.animate({
				"marginLeft": nLeft
			}, 0);
		}
	},

	goBasic: function(){
		// TODO: 현재 애니메이션이 동작중일 경우 새로운 동작요청은 무시한다. 추후에 Queue를 도입할 것.
		var welBig = this.getBigSlide();

		if(welBig.is(":animated")){
			return false;
		}

		// .big이 작아지는 애니메이션.
		welBig.animate({
			"width": this._htMin.w,
			"height": this._htMin.h,
			"marginTop": 50,
			"boxShadowX": 3,
			"boxShadowY": 3
		}, {
			"duration": this._nSpeed,
			"queue": false,
			"easing": "easeOutSine",
			"complete": function(){
				welBig.replaceClass("big", "small");
			}
		});

		welBig.find("img").animate({
			"width": this._htMin.w,
			"height": this._htMin.h
		}, {
			"duration": this._nSpeed,
			"queue": false,
			"easing": "easeOutSine"
		});

		// .small이 .big이 되는 애니메이션.
		var welChallenger = this._sDirection == "right" ? welBig.prev() : welBig.next();
		welChallenger.animate({
			"width": this._htMax.w,
			"height": this._htMax.h,
			"marginTop": 0,
			"boxShadowX": 5,
			"boxShadowY": 5
		}, {
			"duration": this._nSpeed,
			"queue": false,
			"easing": "easeOutSine",
			complete: function(){
				welChallenger.replaceClass("small", "big").removeClass("prev next");
			}
		});

		welChallenger.find("img").animate({
			"width": this._htMax.w,
			"height": this._htMax.h
		}, {
			"duration": this._nSpeed,
			"queue": false,
			"easing": "easeOutSine"
		});
	},

	// 시계방향(right)
	goPrev: function(){
		if(this.goBasic() == false){
			return;
		}

		this._welContainer.animate({
			"marginLeft": "+=" + this._nSmallWidth
		}, this._nSpeed, "easeOutSine", function(){
			var welItem = this.getSlides().last().remove();
			this._welContainer.prepend(welItem);

			this._welContainer.animate({
				"marginLeft": "-=" + this._nSmallWidth
			}, 0);

			this.getBigSlide().prev().addClass("prev").prev().removeClass("prev next");
			this.getBigSlide().next().addClass("next").next().removeClass("prev next");
		}.bind(this));
	},

	// 반시계방향(left)
	goNext: function(){
		if(this.goBasic() == false){
			return;
		}

		this._welContainer.animate({
			"marginLeft": "-=" + this._nSmallWidth
		}, this._nSpeed, "easeOutSine", function(){
			var welItem = this.getSlides().first().remove();
			this._welContainer.append(welItem);

			this._welContainer.animate({
				"marginLeft": "+=" + this._nSmallWidth
			}, 0);

			this.getBigSlide().prev().addClass("prev").prev().removeClass("prev next");
			this.getBigSlide().next().addClass("next").next().removeClass("prev next");
		}.bind(this));
	},
	
	// 방문기록 쿠키
	setTicketMainCookie : function(){
        TMON.util.setCookie("WW_TICKET_MAIN", "Y", {path: '/'});
    },
};

// TODO : 아래내용삭제, 라이브러리 그대로 가져와 추가할것
(function($) {
	$.fn.replaceClass = function(toReplace, replaceWith){
		return $(this).each(function(){
			return $(this).removeClass(toReplace).addClass(replaceWith);
		});
	};

	// boxShadow get hooks
	// https://github.com/brandonaaron/jquery-cssHooks/blob/master/boxshadow.js
	var div = document.createElement('div'),
		divStyle = div.style,
		support = $.support,
		rWhitespace = /\s/,
		rParenWhitespace = /\)\s/;

	support.boxShadow =
		divStyle.MozBoxShadow     === ''? 'MozBoxShadow'    :
			(divStyle.MsBoxShadow     === ''? 'MsBoxShadow'     :
				(divStyle.WebkitBoxShadow === ''? 'WebkitBoxShadow' :
					(divStyle.OBoxShadow      === ''? 'OBoxShadow'      :
						(divStyle.boxShadow       === ''? 'BoxShadow'       :
							false))));

	div = null;

	// helper function to inject a value into an existing string
	// is there a better way to do this? it seems like a common pattern
	function insert_into(string, value, index) {
		var parts  = string.split(rWhitespace);
		parts[index] = value;
		return parts.join(" ");
	}

	if ( support.boxShadow && support.boxShadow !== "BoxShadow" ) {
		$.cssHooks.boxShadow = {
			get: function( elem, computed, extra ) {
				return $.css(elem, support.boxShadow);
			},
			set: function( elem, value ) {
				elem.style[ support.boxShadow ] = value;
			}
		};

		$.cssHooks.boxShadowColor = {
			get: function ( elem, computed, extra ) {
				return $.css(elem, support.boxShadow).split(rParenWhitespace)[0] + ')';
			},
			set: function( elem, value ) {
				elem.style[ support.boxShadow ] = value + " " + $.css(elem, support.boxShadow).split(rParenWhitespace)[1];
			}
		};

		$.cssHooks.boxShadowBlur = {
			get: function ( elem, computed, extra ) {
				return $.css(elem, support.boxShadow).split(rWhitespace)[5];
			},
			set: function( elem, value ) {
				elem.style[ support.boxShadow ] = insert_into($.css(elem, support.boxShadow), value, 5);
			}
		};

		$.cssHooks.boxShadowSpread = {
			get: function ( elem, computed, extra ) {
				return $.css(elem, support.boxShadow).split(rWhitespace)[6];
			},
			set: function( elem, value ) {
				elem.style[ support.boxShadow ] = insert_into($.css(elem, support.boxShadow), value, 6);
			}
		};

		$.cssHooks.boxShadowX = {
			get: function ( elem, computed, extra ) {
				return $.css(elem, support.boxShadow).split(rWhitespace)[3];
			},
			set: function( elem, value ) {
				elem.style[ support.boxShadow ] = insert_into($.css(elem, support.boxShadow), value, 3);
			}
		};

		$.cssHooks.boxShadowY = {
			get: function ( elem, computed, extra ) {
				return $.css(elem, support.boxShadow).split(rWhitespace)[4];
			},
			set: function( elem, value ) {
				elem.style[ support.boxShadow ] = insert_into($.css(elem, support.boxShadow), value, 4);
			}
		};

		// setup fx hooks
		var fxHooks = "Blur Spread X Y".split(" ");
		$.each(fxHooks, function( i, suffix ) {
			var hook = "boxShadow" + suffix;
			$.fx.step[ hook ] = function( fx ) {
				$.cssHooks[ hook ].set( fx.elem, fx.now + fx.unit );
			};
		});
	}
})(jQuery);