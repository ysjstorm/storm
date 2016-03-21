/**
 * 테마, 키워드 템플릿
 */

var sliderForThemeAndKeyword = function(){
	this.init.apply(this, arguments);
};

sliderForThemeAndKeyword.prototype = {
	oSlick : null,
	direction : "left",
	welDots: [],
	welCrtGroup : null,
	welCrtPg : null,
	wrpGroups : {},
	nWordWrpCount : 0,
	nStart : 2,

	init : function(sel1, sel2, nStart){
		this.nStart = nStart;
		this.cacheElement(sel1, sel2);
		this.setEvent();
		this.initPage();
	},

	cacheElement : function(sel1, sel2) {
		this.welScroller = $(sel1);
		this.welLabelPos = $(sel2);

		this.welDots = this.welLabelPos.find(".ico_pg");

		var welKeywordWrps = this.welScroller.find(".keyword_wrp");
		var welKeywordWrp;
		this.nWordWrpCount = welKeywordWrps.size();

		for (var i=0, max=this.nWordWrpCount; i < max; i++){
			welKeywordWrp = $(welKeywordWrps.get(i));

			var classStr = welKeywordWrp.attr('class');
			var matches = classStr.match(/keyword_([0-9]+)_wrp/);

			if(matches.length > 0){
				if (!this.wrpGroups[matches[1]]){
					this.wrpGroups[matches[1]] = [];
				}

				this.wrpGroups[matches[1]].push(welKeywordWrp);
				$(this.welDots.get(i)).data("page", i + 1);

				if ($(this.welDots.get(i)).hasClass("on")){
					this.welCrtPg = $(this.welDots.get(i));
					this.welCrtGroup = this.welCrtPg.parents("li").addClass("on");
					this.startNum = i;
				}
			}
		}
	},

	setEvent : function(){
		this.welLabelPos.find("button").click($.proxy(this.onButtonClick, this));
	},

	initPage : function(){
		var self = this;
		if (this.nWordWrpCount > 1) {
			this.welScroller.on('init', function(event, slick, n){
				self.onSlickAfterChange(event, slick, self.nStart);
			});
			this.oSlick = this.welScroller.slick({
				infinite: true,
				centerMode: true,
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
				variableWidth: false,
				centerPadding: '0',
				initialSlide: this.nStart
			}).on('afterChange', $.proxy(this.onSlickAfterChange, this)).on('swipe', $.proxy(this.onSlickSwipe, this));
		}
	},

	onSlickAfterChange : function (event, slick, n) {
		this.welDots.removeClass("on");
		this.welCrtPg = $(this.welDots.get(n)).addClass("on");

		n = this.welCrtPg.parents("li").index();

		this.welCrtGroup.removeClass("on");
		this.welCrtGroup = $(this.welLabelPos.get(n)).addClass("on");
	},

	onSlickSwipe : function (obj, c, direction){
		this.direction = direction;
	},

	onButtonClick : function (event) {
		var pg = $(event.target).next().find("span.ico_pg:first");
		var index = pg.data("page");

		this.oSlick.slick("slickGoTo", index - 1);
	}
};
