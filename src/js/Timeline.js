var Timeline = (function(window, document){
	'use strict';

	function Timeline(player, videoElement, timelineElement){

		this._player 			= player;
		this._videoElement 		= videoElement;
		this._timelineElement 	= timelineElement;
		this._listeners 		= new ListenerGroup(this);

		// Cached dimensions - lazy load when needed
		this._left 		= 0;
		this._width 	= 0;
		this._scrubbing = false;

		this._initListeners();
	}
	Timeline.prototype = {
		
		isScrubbing: function(){
			return this._scrubbing;
		},

		_scrubStart: function(evt){

			this._scrubbing 	= true;

			this._scrubUpdate(evt);
		},
		_scrubUpdate: function(evt){

			if(!this._scrubbing){
				return;
			}

			if(this._width === 0){
				this._updateTimelineRect();
			}

			var player = this._player,
				duration = this._videoElement.duration || 0,
				seconds = duration * (evt.pageX - this._left) / this._width;

			player.seek(seconds);
		},

		_scrubEnd: function(){

			this._scrubbing = false;
		},

		_hoverUpdate: function(evt){

			if(this._width === 0){
				this._updateTimelineRect();
			}

			var percent = (evt.pageX - this._left) / this._width * 100;

			this._player.onTimelineHover(percent);
		},
		_hoverClear: function(){

			this._player.onTimelineHover(0);
		},

		// Cache timeline element dimensions to prevent dom thrashing
		// https://gist.github.com/paulirish/5d52fb081b3570c81e3a
		_updateTimelineRect: function(){

			// relative to the viewport
			var rect = this._timelineElement.getBoundingClientRect();

			// relative to the page
			this._left = Util.clientRectToPageX(rect);
			this._width = rect.width || 1;
		},

		_initListeners: function(){

			var timelineElement = this._timelineElement;

			var add = this._listeners.add.bind(this._listeners);

			// Scrub updates
			add(timelineElement, 'mousedown', this._scrubStart);
			add(window, 'mousemove', this._scrubUpdate);
			add(window, 'mouseup', this._scrubEnd);

			// Hover updates
			add(timelineElement, 'mouseenter', this._hoverUpdate);
			add(timelineElement, 'mousemove', this._hoverUpdate);
			add(timelineElement, 'mouseleave', this._hoverClear);

			// Refresh timeline rect size
			add(window, 'resize', this._updateTimelineRect);
		},

	};

	return Timeline;

})(window, document);