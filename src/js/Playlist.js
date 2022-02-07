var Playlist = (function(window, document){
	'use strict';

	function Playlist(player, playlistElement){

		this._player 			= player;
		this._playlistElement 	= playlistElement;
		this._listeners 		= new ListenerGroup(this);
		this._items 			= [];
		this._currentItem 		= null;
	}
	Playlist.prototype = {

		load: function(url, onLoad, onError){

			var initList = this._initList.bind(this);

			function callback(items){
				initList(items);
				onLoad(items);
			}

			function errorCallback(statusCode, statusText){
				console.error(statusText);
				onError(statusText);
			}

			Util.getJSON(url, callback, errorCallback);
		},

		getNext: function(){

			var items = this._items,
				currentItem = this._currentItem;

			return currentItem ? items[currentItem.nextIndex] : items[0] || null;
		},

		setNext: function(){
			this.setVideo(this.getNext());
		},

		getPrev: function(){

			var items = this._items,
				currentItem = this._currentItem;

			return currentItem ? items[currentItem.prevIndex] : items[0] || null;
		},

		setPrev: function(){
			this.setVideo(this.getPrev());
		},

		setVideo: function(item, fromThumbClick){

			var oldItem = this._currentItem;

			if(item === oldItem){
				// prevent infinite loop
				return;
			}

			if(oldItem){
				oldItem.element.classList.remove('current');
			}

			item.element.classList.add('current');

			this._currentItem = item;

			this._player.setVideo(item);
		},

		_initList: function(items){

			var player = this._player;

			this._clearList();

			for(var i = 0, ii = items.length; i < ii; ++i){

				var item = items[i];

				// Set next and previous video items (wrap-around)
				item.nextIndex = (i < ii - 1 ? i + 1 : 0);
				item.prevIndex = (i > 0 ? i - 1 : ii - 1);

				item.element = document.createElement('div');
				item.element.classList.add('thumb');
				item.element.style.backgroundImage = 'url(' + item.thumb + ')';

				// add click listener to element
				this._listeners.add(item.element, 'click', this.setVideo.bind(this, item));

				// add element to playlist
				this._playlistElement.appendChild(item.element);
			}

			this._items = items;
		},

		_clearList: function(){

			var items = this._items;

			if(!items.length){
				return;
			}

			this._currentItem = null;

			// remove all click listeners
			this._listeners.removeAll();

			for(var i = 0, ii = items.length; i < ii; ++i){

				var item = items[i];

				// remove element from playlist
				this._playlistElement.removeChild(item.element);
			}

			items.length = 0;
		},
	};

	return Playlist;

})(window, document);