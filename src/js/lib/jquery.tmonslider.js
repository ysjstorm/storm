/**
 * @name	jQuery.tmonSlider
 * @author	dohoons ( http://dohoons.com/ )
 *
 * @version	201207
 * @since	201106
 *
 * @param Object	settings	환경변수 오브젝트
 *		roll			-	순환 (default true)
 *		flexible		-	유동 레이아웃 (default false)
 *		view			-	다중 컬럼 (default 1)
 *		speed			-	애니메이션 속도 (default 75)
 *		range			-	넘김 판정 범위 (default 0.15)
 *		btn_prev		-	prev 버튼 (jQuery Object, default null)
 *		btn_next		-	next 버튼 (jQuery Object, default null)
 *		paging			-	page 버튼 (jQuery Object, default null)
 *		initComplete	-	초기화 콜백
 *		counter			-	슬라이드 콜백, 카운터
 *
 * @example

 $("#target").tmonSlider({
		flexible : true
	});

 */

(function ($) {

    $.fn.tmonSlider = function (settings) {

        settings = jQuery.extend({
            roll : true,
            flexible : false,
            btn_prev : null,
            btn_next : null,
            paging : null,
            speed : 75,
            view : 1,
            range : 0.15,
            initComplete : null,
            counter : null,
            autoPaging : false,
            autoPagingInterval : 3000
        }, settings);

        var opts = [];
        opts = $.extend({}, $.fn.tmonSlider.defaults, settings);

        return this.each(function () {

            $.fn.extend(this, tmonSlider);

            var _this = this;

            this.opts = opts;
            this._view = this.opts.view;
            this._speed = this.opts.speed;
            this._tg = $(this);
            this._list = this._tg.children().children();
            this._width = parseInt(this._tg.css("width"));
            this._item_w = parseInt(this._list.css("width"));
            this._len = this._list.length;
            this._range = this.opts.range * this._width;
            this._pos = [];
            this._start = [];
            this._startX = 0;
            this._startY = 0;
            this._left = 0;
            this._top = 0;
            this._drag = false;
            this._scroll = false;
            this._btn_prev;
            this._btn_next;
            this._timer = null;

            this.init();

            $(this)
                .bind("touchstart", this.touchstart)
                .bind("touchmove", this.touchmove)
                .bind("touchend", this.touchend)
                .bind("dragstart", this.touchstart)
                .bind("drag", this.touchmove)
                .bind("dragend", this.touchend);

            $(window).bind("orientationchange resize", function () {
                _this.resize(_this);
            });
        });

    };

    var tmonSlider = {

        init : function () {
            var _this = this;

            $(this).children().css({
                "width":this._width + "px",
                "overflow":"visible"
            });

            if(this.opts.flexible) this._item_w = this._width / this._view;
            if(this.opts.roll) this._len = Math.ceil(this._len / this._view) * this._view;

            for(var i=0; i<this._len; ++i) {
                this._pos[i] = this._item_w * i;
                this._start[i] = this._pos[i];
                this._list.eq(i).css({
                    "float" : "none",
                    "display" : "block",
                    "position" : "absolute",
                    "top" : "0",
                    "left" : this._pos[i] + "px",
                    "width" : this._item_w + "px"
                });
            }

            if(this.opts.btn_prev && this.opts.btn_next) {
                this.opts.btn_prev.bind("click", function() {
                    _this.animate(1, true);
                    return false;
                });
                this.opts.btn_next.bind("click", function() {
                    _this.animate(-1, true);
                    return false;
                });
            }

            if(this.opts.paging) {
                $(this._list).each(function (i, el) {
                    var btn_page = _this.opts.paging.eq(0).clone();
                    _this.opts.paging.before(btn_page);
                    btn_page.bind("click", function() {
                        var crt = ($.inArray(0, _this._pos) / _this._view) + 1;
                        var cal = crt - (i + 1);

                        while(cal != 0) {
                            if(cal < 0) {
                                _this.animate(-1, true);
                                cal++;
                            } else if(cal > 0) {
                                _this.animate(1, true);
                                cal--;
                            }
                        }

                        return false;
                    });
                });

                this.opts.paging.remove();
            }

            this.setAutoPaging();
            this.counter();
            this.initComplete();
        },

        initComplete : function () {
            if(typeof(this.opts.initComplete) == "function") {
                this.opts.initComplete(this);
            }
        },

        resize : function (e) {
            if(e.opts.flexible) {
                var tmp_w = e._item_w;

                e._width = parseInt(e._tg.css("width"));
                e._item_w = e._width / e._view;
                e._range = e.opts.range * e._width;

                for(var i=0; i<e._len; ++i) {
                    e._pos[i] = e._pos[i] / tmp_w * e._item_w;
                    e._list.eq(i).css({
                        "left" : e._pos[i] + "px",
                        "width" : e._item_w + "px"
                    });
                }
            }
        },

        touchstart : function (e) {
            if((e.type == "touchstart" && e.originalEvent.touches.length <= 1) || e.type == "dragstart")
            {
                clearInterval(this._timer);
                this._startX = e.pageX || e.originalEvent.touches[0].pageX;
                this._startY = e.pageY || e.originalEvent.touches[0].pageY;
                this._start = [];
                for(var i=0; i<this._len; ++i) {
                    this._start[i] = this._pos[i];
                }
            }
        },

        touchmove : function (e) {
            if((e.type == "touchmove" && e.originalEvent.touches.length <= 1) || e.type == "drag") {
                this._left = (e.pageX || e.originalEvent.touches[0].pageX) - this._startX;
                this._top = (e.pageY || e.originalEvent.touches[0].pageY) - this._startY;
                var w = this._left < 0 ? this._left * -1 : this._left;
                var h = this._top < 0 ? this._top * -1 : this._top;

                if (w < h || (this._scroll && !this._drag)) {
                    this._left = 0;
                    this._drag = false;
                    this._scroll = true;
                } else {
                    e.preventDefault();
                    this._drag = true;
                    this._scroll = false;
                    this.position(e);
                }

                for(var i=0; i<this._len; ++i) {
                    var tmp = this._start[i] + this._left;
                    this._list.eq(i).css("left", tmp + "px");
                    this._pos[i] = tmp;
                }
            }
        },

        touchend : function (e) {
            if((e.type == "touchend" && e.originalEvent.touches.length <= 1) || e.type == "dragend") {
                if(this._scroll) {
                    this._drag = false;
                    this._scroll = false;
                    return false;
                }
                this.setAutoPaging();
                this.animate(this.direction(), false);
                this._drag = false;
                this._scroll = false;
            }
        },

        setAutoPaging : function()
        {
            var _this = this;
            if(this.opts.autoPaging)
            {
                this._timer = setInterval(function()
                {
                    _this.animate(-1, true, _this);
                }, this.opts.autoPagingInterval);
            }
        },

        position : function (d) {
            var gap = this._view * this._item_w;

            if(d == -1 || d == 1) {
                this._startX = 0;
                this._start = [];
                for(var i=0; i<this._len; ++i) {
                    this._start[i] = this._pos[i];
                }
                this._left = d * gap;
            } else {
                if(this._left > gap) this._left = gap;
                if(this._left < - gap) this._left = - gap;
            }

            if(this.opts.roll) {
                var tmp_pos = [];
                for(var i=0; i<this._len; ++i) {
                    tmp_pos[i] = this._pos[i];
                }
                tmp_pos.sort(function(a,b){return a-b;});

                var max_chk = tmp_pos[this._len-this._view];
                var p_min = $.inArray(tmp_pos[0], this._pos);
                var p_max = $.inArray(max_chk, this._pos);

                if(this._view <= 1) max_chk = this._len - 1;

                if((d == 1 && tmp_pos[0] >= 0) || (this._drag && tmp_pos[0] > 0)) {
                    for(var i=0; i<this._view; ++i, ++p_min, ++p_max) {
                        this._start[p_max] = this._start[p_min] - gap;
                        this._list.eq(p_max).css("left", this._start[p_max] + "px");
                    }
                } else if((d == -1 && tmp_pos[max_chk] <= 0) || (this._drag && tmp_pos[max_chk] <= 0)) {
                    for(var i=0; i<this._view; ++i, ++p_min, ++p_max) {
                        this._start[p_min] = this._start[p_max] + gap;
                        this._list.eq(p_min).css("left", this._start[p_min] + "px");
                    }
                }
            } else {
                var last_p = parseInt((this._len - 1) / this._view) * this._view;
                if(	(this._start[0] == 0 && this._left > 0) || (this._start[last_p] == 0 && this._left < 0) ) this._left = 0;
            }
        },

        animate : function (d, btn_click, me)
        {
            var _this = me ? me : this;

            var c = ($.inArray(0, this._pos) / this._view) + 1;
            if (c < 1 || c > _this._len / 2)
                _this.position(0);

            if(_this._drag || !_this._scroll || btn_click)
            {
                if(btn_click) {
                    _this.position(d);
                }

                var gap = d * (_this._item_w * _this._view);
                if(_this._left == 0) gap = 0;

                for(var i=0; i<_this._len; ++i)
                {
                    _this._pos[i] = _this._start[i] + gap;
                    _this._list.eq(i).animate({"left": _this._pos[i] + "px"}, _this._speed, function() {
                        //_this.position(0);
                    });
                }

                _this.counter();
            }

        },

        direction : function () {
            var r = 0;

            if(this._left < -(this._range)) r = -1;
            else if(this._left > this._range) r = 1;

            if(!this._drag || this._scroll) r = 0;

            return r;
        },

        counter : function () {
            if(typeof(this.opts.counter) == "function") {
                var param = {
                    total : Math.ceil(this._len / this._view),
                    current : ($.inArray(0, this._pos) / this._view) + 1
                };
                this.opts.counter(param);
            }
        }

    };

})(jQuery);