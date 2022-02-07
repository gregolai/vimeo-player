Features
-----------
	Fullscreen mode.

	Keyboard shortcuts:
		Left Arrow 		- Go back 5 seconds
		Right Arrow 	- Go forward 5 seconds
		Space bar 		- Toggle play/pause state
		Ctrl+Shift+F 	- Toggle fullscreen mode

	A playlist at the bottom of 4 videos you can switch between.

	Buttons to go to next and previous video in playlist.

	Scrubbing/seeking to points in the video using the mouse cursor on the timeline.

	Auto-hides the controls when the mouse exits when playing.

	Clicking the video to toggle play/pause state.

	Double-clicking (if supported) toggles fullscreen mode.

	Sample video title, author, upload date, and description.

"Bugs"
-----------
	Autohiding of controls doesn't work in fullscreen mode, because there's no mouseenter or mouseleave event. A solution to this would be adding a timeout on mousemove to detect if the cursor is idle, but the scrubbing feature adds extra complexity.

	IE, Firefox, and Chrome all have their own ways of handling video events and there are many events that occur during the stages of video loading and playback. This leaves MANY possible avenues where playback could go wrong. If you want to see all HTML5 video events in the console as they occur, you can set "var debug" to true in index.html.

	Not mobile-friendly. This is because the mobile browser wants to use its own player when in fullscreen, so we'd need draw the video to canvas. It's possible, but would require a lot more time and work beyond the scope of this assigment.

	There are a lot more things I wanted to do with this assignment. I wanted to have settings that are set and restored using localStorage. I wanted a popup to show when the video ends for replaying or going to the next video. I wanted the setting for automatically playing through the playlist and an option for expanding the height of the video frame. I wanted to add text showing which video "sources" were available per video. In the end, I decided to keep it relatively simple.

Notes to view
-----------

This project requires a server to run under, because it makes an XMLHttpRequest to get ./public/assets/json/videos.json. If you do not have a server, you will need to run:

	npm install

..then run:

	gulp serve

..to run the server on port 9900. Then just open localhost:9900 in your browser.

If you want to manually compile the scss/js, you'll also need to run "npm install", as shown above, but then run:

	gulp js

..or:

	gulp css

If you run:

	gulp

..gulp will compile both and watch the scss/js directories for changes.
