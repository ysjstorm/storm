/*
	jQuery Slideshow Plugin
	참고 : http://devheart.org/articles/tutorial-creating-a-jquery-plugin/
	image slide 참고 : https://newcircle.com/s/post/249/code_example_implementing_a_photo_slider_with_jquery
*/

(function($){
	$.simpleSlideShow = function(selector, settings){
		// settings
		var option = {
			'delay': 2000,
			'fadeSpeed': 500
		};
		if ( settings ){$.extend(option, settings);}

		// variables
		var obj = $(selector);
		var items = obj.children('li');
		var count = items.length;
		var i = 0;
		var time = null;
		time = setInterval(function(){settime()},option.delay);

		items.eq(0).show();

		// background
		items.each(function(i){
			$(this).css({
			"background-color":"#"+(i*22)+"eeaa"
			});
		});

		// run slideshow
		function settime(){
			items.eq(i).fadeOut(option.fadeSpeed);
			i = ( i+1 == count ) ? 0 : i+1;
			/*
			삼항 연산자
			(불리언 표현식) ? (참일 때 실행하는 문장) : (거짓일 때 실행하는 문장)
			i + 1 이 count와 같으면 i = 0
			count와 같지 않으면 i = i+1
			*/
			items.eq(i).fadeIn(option.fadeSpeed);
		}

		/* prev, next 버튼기능 연구중
		obj.mouseover(function(){
			//obj.preventDefault();
			//clearInterval(time);
			clearInterval(time);
		});
		obj.mouseout(function(){
			//alert("1234");
			//obj.preventDefault();
			setInterval(function(){settime()},option.delay);
		});*/

		function timestop(){
			clearInterval(time);
		}

		$(".slide_btn a").click(function(){
			timestop();
		});
		
		$(".prev").click(function(){
			items.eq(i).fadeOut(option.fadeSpeed);
			i = ( i-1 == count ) ? 0 : i-1;
			/* prev 버튼 기능 보안
			if( i-1 == count){
				i=0;
			}else if(i-1 <count){
				i-1;
			}
			*/
			items.eq(i).fadeIn(option.fadeSpeed);
		});
		$(".next").click(function(){
			items.eq(i).fadeOut(option.fadeSpeed);
			i = ( i+1 == count ) ? 0 : i+1;
			items.eq(i).fadeIn(option.fadeSpeed);
		});

		//썸네일 hover, out시 Interval
		obj.hover(function(){
			clearInterval(time);
		},function(){
			time = setInterval(function(){settime()},option.delay);
		});

		return this;
	};
})(jQuery);
