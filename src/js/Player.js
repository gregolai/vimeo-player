var Player = (function(window, document){

	function Player(dom, debug){

		this._dom 				= dom;
		this._playlist 			= new Playlist(this, dom.playlist);
		this._timeline 			= new Timeline(this, dom.video, dom.timeline.container);
		this._listeners 		= new ListenerGroup(this);
		
		if(debug){
			// debugging video event order
			VideoEventLogger.logAll(dom.video);
		}

		this._initListeners();
	}
	Player.prototype = {

		load: function(url, onLoad, onError){

			this._dom.frame.classList.add('loading');

			this._playlist.load(url, onLoad, onError);
		},

		onPlaylistSelectItem: function(item){

			// load video
			this.setVideo(item);
		},

		onTimelineHover: function(percent){

			var hoverElement = this._dom.timeline.hover;

			hoverElement.style.width = Util.clamp(percent, 0, 100) + '%';
		},

		setVideo: function(item){

			var dom = this._dom,
				videoElement = dom.video,
				info = dom.videoInfo;

			// set video sources
			this._setSources(item.sources);

			// set document title
			document.title = item.title;

			// set video info
			info.author.innerText 		= 'Created by ' + item.author;
			info.date.innerText 		= 'Uploaded on ' + Util.formatDate(item.upload_date);
			info.description.innerText 	= item.description;
			info.title.innerText 		= item.title;
			
			// load video
			videoElement.setAttribute('poster', item.poster);
			videoElement.width = 0;
			videoElement.height = 0;
			videoElement.load();

			this._playlist.setVideo(item);
		},

		seek: function(seconds){

			var videoElement = this._dom.video;

			videoElement.currentTime = Util.clamp(seconds, 0, videoElement.duration || 0)
		},

		_seekDelta: function(deltaSeconds){
			this.seek(this._dom.video.currentTime + deltaSeconds);
		},

		_play: function(){

			// prevent exception:
			// Uncaught (in promise) DOMException: The play() request was interrupted by a new load request.);
			var videoElement = this._dom.video;
			setTimeout(function(){

				if(videoElement.paused){
					videoElement.play();
				}
			}, 150);
		},

		_pause: function(){
			this._dom.video.pause();
		},

		_togglePlay: function(){

			var videoElement = this._dom.video;

			(videoElement.paused ? this._play() : this._pause());
		},

		_resize: function(){

			var videoElement = this._dom.video,
				frameElement = this._dom.frame;

			var frameWidth = frameElement.clientWidth,
				frameHeight = frameElement.clientHeight;

			var srcWidth = videoElement.videoWidth,
				srcHeight = videoElement.videoHeight;

			var dstLeft = 0,
				dstTop = 0,
				dstWidth = frameWidth,
				dstHeight = frameHeight;

			if(srcWidth > 0 && srcHeight > 0){

				// Letterbox mode
				// 
				// Thanks Microsoft:
				// https://msdn.microsoft.com/en-us/library/windows/desktop/bb530115

				if(Math.floor(srcWidth * frameHeight / srcHeight) <= frameWidth){

					// Match frame height
					dstWidth = Math.round(frameHeight * srcWidth / srcHeight);
					dstHeight = frameHeight;
				}
				else {

					// Match frame width
					dstWidth = frameWidth;
					dstHeight = Math.round(frameWidth * srcHeight / srcWidth);
				}

				dstLeft = Math.floor((frameWidth - dstWidth) * 0.5) + 'px';
				dstTop = Math.floor((frameHeight - dstHeight) * 0.5) + 'px';
			}

			videoElement.style.left = dstLeft;
			videoElement.style.top 	= dstTop;
			videoElement.width 		= dstWidth;
			videoElement.height 	= dstHeight;
		},


		_setNextVideo: function(){

			var playlist = this._playlist;

			playlist.setVideo(playlist.getNext());
		},

		_setPreviousVideo: function(){

			var playlist = this._playlist;

			playlist.setVideo(playlist.getPrev());
		},

		_enterFullscreen: function(){
			if(!document.fullscreenElement){
				this._dom.frame.requestFullscreen();
				return true;
			}
			return false;
		},

		_exitFullscreen: function(){
			document.exitFullscreen();
		},

		_toggleFullscreen: function(){

			if(!this._enterFullscreen()){
				this._exitFullscreen();
			}
		},

		_showControls: function(evt){

			var frameElement = this._dom.frame;

			frameElement.classList.remove('hide-controls');
		},

		_hideControls: function(){

			var frameElement = this._dom.frame,
				videoElement = this._dom.video;

			if(!this._timeline.isScrubbing()){

				if(!videoElement.paused){
					frameElement.classList.add('hide-controls');
				}
			}
		},

		_setSources: function(sources){

			var videoElement = this._dom.video,
				sourcesElements = this._dom.videoSources;

			for(var type in sourcesElements){

				var sourceElement = sourcesElements[type];
				var url = sources[type];

				if(url === undefined){
					if(sourceElement.parentNode){
						videoElement.removeChild(sourceElement);
					}
					sourceElement.removeAttribute('src');
				}
				else {
					if(!sourceElement.parentNode){
						videoElement.insertBefore(sourceElement, videoElement.firstChild);
					}
					sourceElement.setAttribute('src', url);
				}
			}
		},

		_updateBuffer: function(){

			var videoElement = this._dom.video,
				bufferBar = this._dom.timeline.buffer,
				duration = videoElement.duration || 0;

			var percent = 100;

			if(videoElement.ended){
				percent = 100;
			}
			else if(duration === 0){
				percent = 0;
			}
			else {
				var currentTime = videoElement.currentTime || 0,
					buffered = videoElement.buffered,
					bufferEnd = 0;

				for(var i = 0, ii = buffered.length; i < ii; ++i){

					var end = buffered.end(i);

					if(currentTime >= buffered.start(i) && currentTime <= end){
						bufferEnd = end;
					}
				}

				percent = bufferEnd / duration * 100;
			}

			bufferBar.style.width = percent + '%';
		},

		_setLoading: function(){
			var frameElement = this._dom.frame;

			frameElement.classList.remove('error');
			frameElement.classList.add('loading');
		},
		_clearLoading: function(){
			var frameElement = this._dom.frame;

			frameElement.classList.remove('loading');
		},

		_onKeyDown: (function(){

			function check(evt){

				switch(evt.key){
					case 'ArrowLeft':
						// Go back 5 seconds
						this._seekDelta(-5);
						return true;

					case 'ArrowRight':
						// Go forward 5 seconds
						this._seekDelta(+5);
						return true;

					case 'F':
						// ctrl + shift + f is keyboard shortcut to toggle fullscreen
						if(evt.ctrlKey && evt.shiftKey){
							this._toggleFullscreen();
						}
						return true;

					case ' ':
						// space toggles play/pause
						this._togglePlay();
						return true;
				}
				return false;
			}

			return function(evt){
				if(check.call(this, evt)) evt.preventDefault();
			};
		})(),

		_updateFullscreen: function(){

			var frameElement = this._dom.frame;

			if(document.fullscreenElement){
				frameElement.classList.add('fullscreen');
			}
			else {
				frameElement.classList.remove('fullscreen');
			}
			this._resize();
		},

		_updatePlaying: function(){

			var videoElement = this._dom.video,
				frameElement = this._dom.frame;

			frameElement.classList.remove('error');

			if(videoElement.paused){
				frameElement.classList.remove('playing');
				frameElement.classList.add('paused');
			}
			else {
				frameElement.classList.remove('paused');
				frameElement.classList.add('playing');
			}
		},

		_updateTime: function(evt){

			var videoElement = this._dom.video,
				progressBar = this._dom.timeline.progress,
				timeDisplay = this._dom.timeDisplay;

			var currentTime = videoElement.currentTime || 0,
				duration 	= videoElement.duration || 0,
				percent 	= duration !== 0 ? currentTime / duration * 100 : 0;

			timeDisplay.innerText = Util.formatTime(currentTime) + ' / ' + Util.formatTime(duration);

			progressBar.style.width = percent + '%';
		},

		_initListeners: function(){

			var dom = this._dom,
				videoElement = dom.video,
				frameElement = dom.frame,
				buttons = dom.buttons;

			var add = this._listeners.add.bind(this._listeners);

			add(videoElement, 'abort', this._updatePlaying);
			add(videoElement, 'abort', this._updateTime);
			add(videoElement, 'abort', this._setLoading);
			add(videoElement, 'click', this._togglePlay);
			add(videoElement, 'loadedmetadata', this._resize);
			add(videoElement, 'progress playing ended', this._updateBuffer);
			add(videoElement, 'play pause ended error', this._updatePlaying);
			add(videoElement, 'durationchange loadedmetadata seeking timeupdate', this._updateTime);
			add(videoElement, 'emptied seeking', this._setLoading);
			add(videoElement, 'canplay playing seeked timeupdate', this._clearLoading);

			// button events
			add(buttons.enterFullscreen, 'click', this._enterFullscreen);
			add(buttons.exitFullscreen, 'click', this._exitFullscreen);
			add(buttons.next, 'click', this._setNextVideo);
			add(buttons.pause, 'click', this._pause);
			add(buttons.play, 'click', this._play);
			add(buttons.prev, 'click', this._setPreviousVideo);

			// global events
			add(window, 'keydown', this._onKeyDown);
			add(window, 'resize', this._resize);
			add(document, 'fullscreenchange', this._updateFullscreen);

			// double click to toggle fullscreen
			add(frameElement, 'dblclick', this._toggleFullscreen);

			// autohide events
			add(videoElement, 'playing', this._hideControls);
			add(frameElement, 'mousemove', this._showControls);
			add(frameElement, 'mouseleave', this._hideControls);
		},
	};

	return Player;

})(window, document);