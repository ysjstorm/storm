/**
 * WearUI v1
 *   - Scrolling Anchor
 *   - Sliding Page
 *
 * @author mornya
 */
var WearUI = function(pOptions){
	this.init(pOptions);
};
WearUI.prototype = {
	init: function(pOptions){
		this.vars = {
			'scrollAnchorTop': 0,
			'scrollAnchorIndex': 0
		};
		this.status = {
			'sliding': false
		};
		this.options = {
			'scrollingAnchor': '.scrolling_anchor'
		};
		$.extend(this.options, pOptions);

		$(window).on('load', $.proxy(this._initScrollingAnchor, this));
	},

	/**
	 * init Scrolling Anchor
	 */
	_initScrollingAnchor: function(){
		var sa_action = function($sa){
			var isDisabled = $sa.hasClass('disabled');
			var isFixed = $sa.hasClass('scrolling_anchor_fixed');
			if (isDisabled && $sa.hasClass('scrolling_anchor_stop')) {
				// no scrolling action
			} else if (isDisabled && !isFixed) {
				// disabled된 객체가 원위치 오는 순간 disabled 활성화
				$sa.addClass('scrolling_anchor_stop');
			} else {
				if ($sa.hasClass('scrolling_anchor_stop')) {
					$sa.removeClass('scrolling_anchor_stop');
				}
				var $docScrollTop = $(document).scrollTop();
				var waypoint = $sa.parent().offset().top - this.vars.scrollAnchorTop;
				if (($docScrollTop > waypoint) && !isFixed) {
					$sa
						.addClass('scrolling_anchor_fixed')
						.css({'position':'fixed','top':this.vars.scrollAnchorTop+'px','left':$sa.parent().offset().left});
					this.vars.scrollAnchorTop += $sa.height(); // 라인 순서 주의
				}
				if (($docScrollTop <= 0 || $docScrollTop < waypoint + $sa.height()) && isFixed) {
					this.vars.scrollAnchorTop -= $sa.height(); // 라인 순서 주의
					$sa
						.removeClass('scrolling_anchor_fixed')
						.css({'position':'absolute','top':0,'left':0});
				}
			}
		}.bind(this);

		var that = this;
		$(this.options.scrollingAnchor).each(function(){
			var $this = $(this);
			var parentNode = $('<div></div>')
				.appendTo($this.parent())
				.attr({'id':'sa-'+that.vars.scrollAnchorIndex+'-wrap','data-index':that.vars.scrollAnchorIndex})
				.css({'position':'relative','min-height':$this.height()});
			$this
				.appendTo(parentNode)
				.css({'position':'absolute','top':0,'left':0,'z-index':(499+that.vars.scrollAnchorIndex)});
			that.vars.scrollAnchorIndex++;

			$(window)
				.scroll(function(){ sa_action($this); })
				.resize(function(){ sa_action($this); });
			sa_action($this); // 초기화시 정의된 액션 실행
		});
	}
};