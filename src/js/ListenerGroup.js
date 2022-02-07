var ListenerGroup = (function(window, document){
	'use strict';

	function ListenerGroup(bindTarget){

		this._bindTarget 	= bindTarget;
		this._listeners 	= [];
	}
	ListenerGroup.prototype = {

		add: function(element, listenEvents, callback){

			var listeners = this._listeners,
				eventList = listenEvents.split(' '),
				boundCallback = callback.bind(this._bindTarget);

			for(var i = 0, ii = eventList.length; i < ii; ++i){

				var listenEvent = eventList[i];

				// Store listeners in a single array, 3 items at a time
				listeners.push(element, listenEvent, boundCallback);

				element.addEventListener(listenEvent, boundCallback);
			}
		},

		removeAll: function(){

			var listeners = this._listeners;

			for(var i = 0, ii = listeners.length; i < ii; i += 3){

				var element 		= listeners[i + 0];
				var listenEvent 	= listeners[i + 1];
				var boundCallback 	= listeners[i + 2];

				element.removeEventListener(listenEvent, boundCallback);
			}

			listeners.length = 0;
		},
	};

	return ListenerGroup;

})(window, document);