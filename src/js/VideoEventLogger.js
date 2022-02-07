var VideoEventLogger = (function(window, document){

	// According to MDN DOCS:
	// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
	// 
	var VIDEO_EVENT_LIST = [
		// Sent when playback is aborted; for example, if the media is playing
		// and is restarted from the beginning, this event is sent.
		'abort',

		// Sent when enough data is available that the media can be played, at
		// least for a couple of frames. This corresponds to the HAVE_ENOUGH_DATA readyState.
		'canplay',

		// Sent when the ready state changes to CAN_PLAY_THROUGH, indicating that
		// the entire media can be played without interruption, assuming the download
		// rate remains at least at the current level. It will also be fired when
		// playback is toggled between paused and playing. Note: Manually setting
		// the currentTime will eventually fire a canplaythrough event in firefox.
		// Other browsers might not fire this event.
		'canplaythrough',

		// The metadata has loaded or changed, indicating a change in duration of the
		// media. This is sent, for example, when the media has loaded enough that the
		// duration is known.
		'durationchange',

		// The media has become empty; for example, this event is sent if the media has
		// already been loaded (or partially loaded), and the load() method is called
		// to reload it.
		'emptied',

		// EXPERIMENTAL - The user agent has encountered initialization data in the media data.
		'encrypted',

		// Sent when playback completes.
		'ended',

		// Sent when an error occurs.  The element's error attribute contains more information.
		// See Error handling for details.
		'error',

		// Sent when audio playing on a Firefox OS device is interrupted, either because
		// the app playing the audio is sent to the background, or audio in a higher priority
		// audio channel begins to play. See Using the AudioChannels API for more details.
		'interruptbegin',

		// Sent when previously interrupted audio on a Firefox OS device commences playing
		// again — when the interruption ends. This is when the associated app comes back to the
		// foreground, or when the higher priority audio finished playing.
		// See Using the AudioChannels API for more details.
		'interruptend',

		// The first frame of the media has finished loading.
		'loadeddata',

		// The media's metadata has finished loading; all attributes now contain as much
		// useful information as they're going to.
		'loadedmetadata',

		// Sent when loading of the media begins.
		'loadstart',

		// Sent when playback is paused.
		'pause',

		// Sent when playback of the media starts after having been paused; that is,
		// when playback is resumed after a prior pause event.
		'play',

		// Sent when the media begins to play (either for the first time, after having
		// been paused, or after ending and then restarting).
		'playing',

		// Sent periodically to inform interested parties of progress downloading the
		// media. Information about the current amount of the media that has been downloaded
		// is available in the media element's buffered attribute.
		'progress',

		// Sent when the playback speed changes.
		'ratechange',

		// Sent when a seek operation completes.
		'seeked',

		// Sent when a seek operation begins.
		'seeking',

		// Sent when the user agent is trying to fetch media data,
		// but data is unexpectedlynot forthcoming.
		'stalled',

		// Sent when loading of the media is suspended; this may happen either because the
		// download has completed or because it has been paused for any other reason.
		'suspend',

		// The time indicated by the element's currentTime attribute has changed.
		'timeupdate',

		// Sent when the audio volume changes (both when the volume is set and when
		// the muted attribute is changed).
		'volumechange',

		// Sent when the requested operation (such as playback) is delayed pending the
		// completion of another operation (such as a seek).
		'waiting',
	];

	// Used for monitoring video event flow.
	//
	return {
		logAll: function(videoElement){

			function log(evt){
				console.log(parseInt(evt.timeStamp) + ': VIDEO EVENT:', evt.type);
			}

			var list = VIDEO_EVENT_LIST;

			for(var i = 0, ii = list.length; i < ii; ++i){
				videoElement.addEventListener(list[i], log, false);
			}

		},
	};

})(window, document);