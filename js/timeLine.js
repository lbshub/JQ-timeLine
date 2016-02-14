/**
 * LBS timeLine
 * Date: 2014-11-22
 * ====================================================
 * opts.$wrapBox timeLine包装容器 一个字符ID 默认'#timeline'
 * opts.$datesBox 时间容器 一个字符ID  默认'#dates'
 * opts.$contentsBox 内容容器 一个字符ID  默认'#contents'
 * opts.$next next箭头 一个字符ID  默认'#next'
 * opts.$prev prev箭头 一个字符ID  默认'#prev'
 * opts.$active 当前index的对象加类名  默认'.active'
 * opts.direction 方向 默认'top'
 * opts.index 初始索引 默认0
 * opts.start 滚动前执行函数
 * opts.end 滚动完成执行函数
 * ==================================
 * 需要引入jQuery 
 * ====================================================
 * this.index //当前时间点的索引值 
 * this.length //总的时间点个数
 * this.$datesBox //时间容器
 * this.$contentsBox //内容容器
 * this.update() //时间和内容有变化 更新this.length
 * ====================================================
 **/

;(function($) {
	if (window.jQuery === 'undefined') {
		alert('使用timeLine插件,需要加载jquery!');
		return;
	}
	var timeLine = function(opts) {
		var _opts = {
			$wrapBox: '#timeline',
			$datesBox: '#dates',
			$contentsBox: '#contents',
			$next: '#next',
			$prev: '#prev',
			$active: '.active',
			direction: 'top',
			index: 0,
			start: function() {},
			end: function() {}
		};
		$.extend(_opts, opts);

		this.$wrapBox = $(_opts.$wrapBox);
		this.$datesBox = $(_opts.$datesBox);
		this.$contentsBox = $(_opts.$contentsBox);
		this.$next = $(_opts.$next);
		this.$prev = $(_opts.$prev);
		this.dates = this.$datesBox.children('li');
		this.contents = this.$contentsBox.children('li');
		this.length = this.dates.length;
		this.wrapBoxW = this.$wrapBox.width();
		this.wrapBoxH = this.$wrapBox.height();
		this.dateW = this.dates.eq(0).width();
		this.dateH = this.dates.eq(0).height();
		this.contentW = this.contents.eq(0).width();
		this.contentH = this.contents.eq(0).height();
		this.direction = _opts.direction;
		this.index = _opts.index;
		this.oIndex = -1;
		this.isAnimate = true;
		this.centerW = this.wrapBoxW / 2 - this.dateW / 2;
		this.$active = _opts.$active.slice(1);
		this.centerH = this.wrapBoxH / 2 - this.dateH / 2;
		this.start = _opts.start;
		this.end = _opts.end;

		this._init();
	};
	timeLine.prototype = {
		_init: function() {
			if (this.direction == 'left') {
				this.$datesBox.width(this.dateW * this.length);
				this.$contentsBox.width(this.contentW * this.length);
			} else if (this.direction == 'top') {
				this.$datesBox.height(this.dateH * this.length);
				this.$contentsBox.height(this.contentH * this.length);
			}
			if (this.index > this.length - 1) this.index = this.length - 1;
			this._animate(this.index);
			this._bind();
		},
		update: function() {
			this.dates = this.$datesBox.children('li');
			this.contents = this.$contentsBox.children('li');
			this.length = this.dates.length;
			this._arrow(this.index);
			this._init();
		},
		_arrow: function(x) {
			x == 0 ? this.$prev.fadeOut() : this.$prev.fadeIn();
			x == this.length - 1 ? this.$next.fadeOut() : this.$next.fadeIn();
		},
		_animate: function(x) {
			if (x == this.oIndex || !this.isAnimate) return;
			this.start && this.start(x);
			this.isAnimate = false;
			this._arrow(x);
			var _this = this;
			if (this.direction == 'left') {
				this.$datesBox.animate({
					'left': this.centerW - x * this.dateW
				}, function() {
					_this.dates.eq(_this.oIndex).removeClass(_this.$active);
					_this.dates.eq(x).addClass(_this.$active);
				});
				this.$contentsBox.animate({
					'left': -x * this.contentsW
				}, function() {
					_this.contents.eq(_this.oIndex).removeClass(_this.$active);
					_this.contents.eq(x).addClass(_this.$active);
					_this.oIndex = x;
					_this.isAnimate = true;
					_this.end && _this.end(x);
				});
			} else if (this.direction == 'top') {
				this.$datesBox.animate({
					'top': this.centerH - x * this.dateH
				}, function() {
					_this.dates.eq(_this.oIndex).removeClass(_this.$active);
					_this.dates.eq(x).addClass(_this.$active);
				});
				this.$contentsBox.animate({
					'top': -x * this.contentH
				}, function() {
					_this.contents.eq(_this.oIndex).removeClass(_this.$active);
					_this.contents.eq(x).addClass(_this.$active);
					_this.oIndex = x;
					_this.isAnimate = true;
					_this.end && _this.end(x);
				});
			}
		},
		_bind: function() {
			var _this = this;
			this.$datesBox.delegate('li', 'click', function(e) {
				e.preventDefault();
				_this.index = $(this).index();
				_this._animate(_this.index);
			});
			this.$next.on('click', function(e) {
				e.preventDefault();
				if (_this.index >= _this.length - 1 || !_this.isAnimate) return;
				_this._animate(++_this.index);
			});
			this.$prev.on('click', function(e) {
				e.preventDefault();
				if (_this.index <= 0 || !_this.isAnimate) return;
				_this._animate(--_this.index);
			});
			$(document).on('keydown', function(e) {
				e.preventDefault();
				if (e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 34) {
					_this.$next.click();
				}
				if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 33) {
					_this.$prev.click();
				}
			});

			function mouseScroll(fn, s) {
				var time = +new Date(),
					x = 0,
					roll = function(e) {
						e = e || window.event;
						e.preventDefault ? e.preventDefault() : e.returnValue = false;
						x = e.wheelDelta ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
						if (+new Date() - time > (s || 500)) {
							time = new Date() - 0;
							fn(x);
						}
					}
				window.netscape ? _this.$wrapBox[0].addEventListener('DOMMouseScroll', roll, false) : _this.$wrapBox[0].onmousewheel = roll;
			}
			mouseScroll(function(x) {
				x < 0 ? _this.index++ : _this.index--;
				_this.index < 0 && (_this.index = 0);
				_this.index > _this.length - 1 && (_this.index = _this.length - 1);
				_this._animate(_this.index);
			});
		}
	}
	window.timeLine = timeLine;
}(jQuery));