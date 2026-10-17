"use strict";

(function () {
	$(document).ready(function () {
		var Carousel = {
			props: {
				current_slide: 0,
				total_slides: 3
			},
			init: function () {
				this.bindEvents();
				this.timeoutOb = setInterval(function () {
					Carousel.next();
				}, 3000);
				//ADDED INITIALIZER CODE
			},
			bindEvents: function () {
				$("#next").on("click", function (e) {
					Carousel.next();
				});
				$("#prev").on("click", function (e) {
					Carousel.previous();
				});
			},
			next: function () {
				this.props.current_slide = (this.props.current_slide + 1) % this.props.total_slides;
				this.update();
				//ADDED NEXT CODE
			},
			previous: function () {
				this.props.current_slide = this.props.current_slide == 0 ? this.props.total_slides - 1 : this.props.current_slide - 1;
				this.update();
				//ADD PREVIOUS CODE
			},
			update: function () {
				var carousel = $('#carousel-cells .slide-body');
				var slides = carousel.children();
				slides.each(function (i, item) {
					item.classList.remove('active');
				});
				slides[this.props.current_slide].classList.add('active');
				var slideWidth = slides[0].offsetWidth;
				carousel.animate({ 'left': -(slideWidth * this.props.current_slide) }, 500);
			}
		}
		$(function () {
			Carousel.init();
		});
		
		//FOR KEYBOARD RIGHT AND LEFT INPUT
		jQuery(document).bind('keyup', function (e) {
			if (e.keyCode == 39) {
				Carousel.next();
			}
			else if (e.keyCode == 37) {
				Carousel.previous();
			}
		});		
	});
})(window);