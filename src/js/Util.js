var Util = (function(window, document){
	'use strict';
	
	return {

		// Disable cache when requesting resources from a url
		// 
		cacheBust: function(url){
			// Cache busting.
			// Source:
			// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
			return url + ((/\?/).test(url) ? '&' : '?') + (new Date()).getTime();
		},

		// Clamps a primitive value in the inclusive range [min, max]
		// 
		clamp: function(value, min, max){
			return value > max ? max : (value < min ? min : value);
		},

		// Gets page X offset  of an elements bounding client rect. Element's client rect
		// is from calling Element.getBoundingClientRect(), which has coordinates relative
		// to the viewport.
		//
		clientRectToPageX: function(clientRect){

			var body = document.body,
				docEl = document.documentElement,
				scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft,
				clientLeft = docEl.clientLeft || body.clientLeft || 0;

			return Math.round(clientRect.left + scrollLeft - clientLeft);
		},

		// Gets page Y offset of an elements bounding client rect. Element's client rect
		// is from calling Element.getBoundingClientRect(), which has coordinates relative
		// to the viewport.
		//
		clientRectToPageY: function(clientRect){

			var body = document.body,
				docEl = document.documentElement,
				scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop,
				clientTop = docEl.clientTop || body.clientTop || 0;

			return Math.round(clientRect.top + scrollLeft - clientLeft);
		},

		// Takes the UTC date format "YYYY-MM-DD hh:mm:ss" and converts it into a local date
		// in the format: MONTH_NAME MONTH_DAY, YEAR
		//
		// Example UTC:
		//  2016-09-02 04:59:59
		//
		// EST standard (UTC - 5h):
		//  => September 01, 2016
		//
		// EST daylight savings (UTC - 4h):
		//  => September 02, 2016
		//  
		formatDate: function(utcDate){

			var dt = utcDate.split(' '),
				d = dt[0].split('-'), // date parts (array)
				t = dt[1].split(':'), // time parts (array)
				utc = Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1], t[2]),
				date = new Date(utc);

			var opts = {
				year: 'numeric',
				month: 'long',
				day: '2-digit', // IE only supports 2-digit, so we'll just go with that
			};

			var localDate = date.toLocaleDateString('en-US', opts);

			return localDate
		},

		// Returns seconds in the string format of HH:MM:SS
		// 
		formatTime: (function(){

			var SECONDS_TO_HOURS 	= 1 / 3600;
			var SECONDS_TO_MINUTES 	= 1 / 60;

			return function(seconds){
				var h = Math.floor(seconds * SECONDS_TO_HOURS);
				var m = Math.floor(seconds * SECONDS_TO_MINUTES) % 60;
				var s = Math.floor(seconds) % 60;

				// Examples:
				//    0:00
				//    0:23
				//   13:48
				// 1:07:02
				// 6:19:55
				return (h > 0 ? h + ':' : '')
					+ (h > 0 ? (m < 10 ? '0' + m : m) : m) + ':'
					+ (s < 10 ? '0' + s : s);
			};
		})(),

		// A basic XHR implementation for geting a JSON file
		// 
		getJSON: function(url, callback, errorCallback){

			// Some people love the 90s (or IE) so much that we'll do this the long way. I mean,
			// they wouldn't be able to load this site if that's the case, so what's the point?
			// I suppose it's good practice to do it this way. I know the pain of client services
			// reporting a bug because a single client refuses to upgrade their browsers (ie: many colleges)
			var xhr = typeof XMLHttpRequest !== 'undefined' ? new XMLHttpRequest()
				: new ActiveXObject('Microsoft.XMLHTTP');
			
			xhr.open('GET', url, true);

			xhr.onreadystatechange = function(){
				// Reference:
				// https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
				if(xhr.readyState === 4){

					var statusCode = xhr.status;
					var statusText = xhr.statusText;

					if(statusCode === 200){

						var json;
						try {
							json = JSON.parse(xhr.responseText);
						}
						catch(e){
							// Parse error. Change status code to prevent success callback.
							statusCode = 0;
							statusText = 'Error parsing JSON file: ' + url + ' => ' + e;
						}

						if(statusCode === 200){
							callback(json); // success
							return;
						}
					}

					if(errorCallback){

						if(statusCode === 404){
							statusText = 'File not found: ' + url;
						}

						errorCallback(statusCode, statusText);
					}
				}
			};
			xhr.send();
		},
	};

})(window, document);


