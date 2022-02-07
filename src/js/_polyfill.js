// KeyboardEvent.keyCode was deprecated in favor of KeyboardEvent.key.
// Here's a polyfill to use KeyboardEvent.key.
// 
(function(){
	if(!('KeyboardEvent' in window) || 'key' in KeyboardEvent.prototype){
		return;
	}

	var keys = {3:'Cancel',6:'Help',8:'Backspace',9:'Tab',12:'Clear',13:'Enter',16:'Shift',17:'Control',18:'Alt',19:'Pause',20:'CapsLock',27:'Escape',28:'Convert',29:'NonConvert',30:'Accept',31:'ModeChange',32:' ',33:'PageUp',34:'PageDown',35:'End',36:'Home',37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',41:'Select',42:'Print',43:'Execute',44:'PrintScreen',45:'Insert',46:'Delete',48:['0', ')'],49:['1', '!'],50:['2', '@'],51:['3', '#'],52:['4', '$'],53:['5', '%'],54:['6', '^'],55:['7', '&'],56:['8', '*'],57:['9', '('],91:'OS',93:'ContextMenu',144:'NumLock',145:'ScrollLock',181:'VolumeMute',182:'VolumeDown',183:'VolumeUp',186:[';', ':'],187:['=', '+'],188:[',', '<'],189:['-', '_'],190:['.', '>'],191:['/', '?'],192:['`', '~'],219:['[', '{'],220:['\\', '|'],221:[']', '}'],222:["'", '"'],224:'Meta',225:'AltGraph',246:'Attn',247:'CrSel',248:'ExSel',249:'EraseEof',250:'Play',251:'ZoomOut'};
	
	// Function keys (F1-24).
	var i;
	for(i = 1; i < 25; i++){
		keys[111 + i] = 'F' + i;
	}

	// Printable ASCII characters.
	var letter;
	for(i = 65; i < 91; i++){
		letter = String.fromCharCode(i);
		keys[i] = [letter.toLowerCase(), letter.toUpperCase()];
	}

	Object.defineProperty(KeyboardEvent.prototype, 'key', {
		get: function(){
			var key = keys[this.which || this.keyCode];
			if(Object.prototype.toString.call(arg) === '[object Array]'){
				key = key[+this.shiftKey];
			}
			return key;
		}
	});
})();

// Polyfill for window.requestAnimationFrame() functionality
// Source:
// https://gist.github.com/paulirish/1579671
// 
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
			|| window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());

// Polyfill for performance.now() and Date.now()
// Source:
// https://gist.github.com/paulirish/5438650
// 
(function(){
	if ("performance" in window == false) {
		window.performance = {};
	}

	Date.now = (Date.now || function () {  // thanks IE8
		return new Date().getTime();
	});

	if ("now" in window.performance == false){
		var nowOffset = Date.now();
		if (performance.timing && performance.timing.navigationStart){
			nowOffset = performance.timing.navigationStart
		}
		window.performance.now = function now(){
			return Date.now() - nowOffset;
		}
	}
})();

// Polyfill for Element.matches()
// Source:
// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
// 
if (!Element.prototype.matches) {
	Element.prototype.matches = 
		Element.prototype.matchesSelector || 
		Element.prototype.mozMatchesSelector ||
		Element.prototype.msMatchesSelector || 
		Element.prototype.oMatchesSelector || 
		Element.prototype.webkitMatchesSelector ||
		function(s) {
			var matches = (this.document || this.ownerDocument).querySelectorAll(s),
			i = matches.length;
			while (--i >= 0 && matches.item(i) !== this) {}
			return i > -1;
		};
}

// IE Polyfill for event handling, such as Element.addEventListener() and Element.removeEventListener()
// Source:
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// 
(function() {
	if (!Event.prototype.preventDefault) {
		Event.prototype.preventDefault=function() {
			this.returnValue=false;
		};
	}
	if (!Event.prototype.stopPropagation) {
		Event.prototype.stopPropagation=function() {
			this.cancelBubble=true;
		};
	}
	if (!Element.prototype.addEventListener) {
		var eventListeners=[];
		
		var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
			var self=this;
			var wrapper=function(e) {
				e.target=e.srcElement;
				e.currentTarget=self;
				if (typeof listener.handleEvent != 'undefined') {
					listener.handleEvent(e);
				} else {
					listener.call(self,e);
				}
			};
			if (type=="DOMContentLoaded") {
				var wrapper2=function(e) {
					if (document.readyState=="complete") {
						wrapper(e);
					}
				};
				document.attachEvent("onreadystatechange",wrapper2);
				eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
				
				if (document.readyState=="complete") {
					var e=new Event();
					e.srcElement=window;
					wrapper2(e);
				}
			} else {
				this.attachEvent("on"+type,wrapper);
				eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
			}
		};
		var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
			var counter=0;
			while (counter<eventListeners.length) {
				var eventListener=eventListeners[counter];
				if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
					if (type=="DOMContentLoaded") {
						this.detachEvent("onreadystatechange",eventListener.wrapper);
					} else {
						this.detachEvent("on"+type,eventListener.wrapper);
					}
					eventListeners.splice(counter, 1);
					break;
				}
				++counter;
			}
		};
		Element.prototype.addEventListener=addEventListener;
		Element.prototype.removeEventListener=removeEventListener;
		if (HTMLDocument) {
			HTMLDocument.prototype.addEventListener=addEventListener;
			HTMLDocument.prototype.removeEventListener=removeEventListener;
		}
		if (Window) {
			Window.prototype.addEventListener=addEventListener;
			Window.prototype.removeEventListener=removeEventListener;
		}
	}
})();

// Polyfill for the W3 Fullscreen API, such as Element.requestFullscreen() and Element.exitFullscreen()
// Source:
// https://github.com/neovov/Fullscreen-API-Polyfill
// 
// fullscreen-api-polyfill.js (latest commit # 56d1653)
// 
(function ( doc ) {
	// Use JavaScript strict mode
	"use strict";

	/*global Element, Promise */

	var pollute = true,
		api,
		vendor,
		apis = {
			// http://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html
			w3: {
				enabled: "fullscreenEnabled",
				element: "fullscreenElement",
				request: "requestFullscreen",
				exit:    "exitFullscreen",
				events: {
					change: "fullscreenchange",
					error:  "fullscreenerror"
				}
			},
			webkit: {
				enabled: "webkitFullscreenEnabled",
				element: "webkitCurrentFullScreenElement",
				request: "webkitRequestFullscreen",
				exit:    "webkitExitFullscreen",
				events: {
					change: "webkitfullscreenchange",
					error:  "webkitfullscreenerror"
				}
			},
			moz: {
				enabled: "mozFullScreenEnabled",
				element: "mozFullScreenElement",
				request: "mozRequestFullScreen",
				exit:    "mozCancelFullScreen",
				events: {
					change: "mozfullscreenchange",
					error:  "mozfullscreenerror"
				}
			},
			ms: {
				enabled: "msFullscreenEnabled",
				element: "msFullscreenElement",
				request: "msRequestFullscreen",
				exit:    "msExitFullscreen",
				events: {
					change: "MSFullscreenChange",
					error:  "MSFullscreenError"
				}
			}
		},
		w3 = apis.w3;

	// Loop through each vendor's specific API
	for (vendor in apis) {
		// Check if document has the "enabled" property
		if (apis[vendor].enabled in doc) {
			// It seems this browser support the fullscreen API
			api = apis[vendor];
			break;
		}
	}

	function dispatch( type, target ) {
		var event = doc.createEvent( "Event" );

		event.initEvent( type, true, false );
		target.dispatchEvent( event );
	} // end of dispatch()

	function handleChange( e ) {
		e.stopPropagation();
		e.stopImmediatePropagation();

		// Recopy the enabled and element values
		doc[w3.enabled] = doc[api.enabled];
		doc[w3.element] = doc[api.element];

		dispatch( w3.events.change, e.target );
	} // end of handleChange()

	function handleError( e ) {
		dispatch( w3.events.error, e.target );
	} // end of handleError()

	// Prepare a resolver to use for the requestFullscreen and exitFullscreen's promises
	// Use a closure since we need to check which method was used
	function createResolver(method) {
		return function resolver(resolve, reject) {
			// Reject the promise if asked to exitFullscreen and there is no element currently in fullscreen
			if (method === w3.exit && !doc[api.element]) {
				setTimeout(function() {
					reject(new TypeError());
				}, 1);
				return;
			}

			// When receiving an internal fullscreenchange event, fulfill the promise
			function change() {
				resolve();
				doc.removeEventListener(api.events.change, change, false);
			}

			// When receiving an internal fullscreenerror event, reject the promise
			function error() {
				reject(new TypeError());
				doc.removeEventListener(api.events.error, error, false);
			}

			doc.addEventListener(api.events.change, change, false);
			doc.addEventListener(api.events.error,  error,  false);
		};
	}

	// Pollute only if the API doesn't already exists
	if (pollute && !(w3.enabled in doc) && api) {
		// Add listeners for fullscreen events
		doc.addEventListener( api.events.change, handleChange, false );
		doc.addEventListener( api.events.error,  handleError,  false );

		// Copy the default value
		doc[w3.enabled] = doc[api.enabled];
		doc[w3.element] = doc[api.element];

		// Match the reference for exitFullscreen
		doc[w3.exit] = function() {
			var result = doc[api.exit]();
			return !result && window.Promise ? new Promise(createResolver(w3.exit)) : result;
		};

		// Add the request method to the Element's prototype
		Element.prototype[w3.request] = function () {
			var result = this[api.request].apply( this, arguments );
			return !result && window.Promise ? new Promise(createResolver(w3.request)) : result;
		};
	}

	// Return the API found (or undefined if the Fullscreen API is unavailable)
	return api;

}( document ));