var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer');
	concat = require('gulp-concat'),
	plumber = require('gulp-plumber'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),

	server = require('gulp-live-server'); // if a temporary server is needed for the xhr

// If server is needed, this port can be used.
var SERVER_PORT = 9900;

// Minify flags
var EXPANDED = 0x1;
var MINIFIED = 0x2;

var SRC_DIR = 'src/';
var DIST_DIR = 'public/dist/';

var opts = {

	plumber: {
		errorHandler: function(err){
			console.log(err);
			this.emit('end');
		}
	},

	css: {
		flags: EXPANDED | MINIFIED, // keep both
		src: SRC_DIR + 'scss/main.scss',
		watch: SRC_DIR + 'scss/**/*.scss',
		dist: {
			directory: DIST_DIR + 'css/',
			filename: 'main.css',
		},
	},

	js: {
		flags: EXPANDED | MINIFIED, // keep both
		src: SRC_DIR + 'js/**/*.js',
		watch: SRC_DIR + 'js/**/*.js',
		dist: {
			directory: DIST_DIR + 'js/',
			filename: 'main.js',
		},
	},
};

gulp.task('css', function(){

	var directory 	= opts.css.dist.directory;
	var filename 	= opts.css.dist.filename;
	var flags 		= opts.css.flags;

	var stream =
		gulp.src(opts.css.src) 			// input
		.pipe(plumber(opts.plumber)); 	// prevent pipe breaking from errors

	if(flags & EXPANDED){

		stream = stream.pipe(sass({ outputStyle: 'expanded' })) 	// extended
			.pipe(autoprefixer('last 4 versions')) 					// autoprefixes for browsers
			.pipe(rename(filename)) 								// rename
			.pipe(gulp.dest(directory)); 							// output
	}

	if(flags & MINIFIED){

		stream = stream.pipe(sass({ outputStyle: 'compressed' })) 	// minify
			.pipe(autoprefixer('last 4 versions')) 					// autoprefixes for browsers
			.pipe(rename({ extname: '.min.css' })) 					// add .min.css
			.pipe(gulp.dest(directory)); 							// output
	}

	return stream;
});

gulp.task('js', function(){

	var directory 	= opts.js.dist.directory;
	var filename 	= opts.js.dist.filename;
	var flags 		= opts.js.flags;

	var stream =
		gulp.src(opts.js.src) 			// input
		.pipe(plumber(opts.plumber)) 	// prevent pipe breaking from errors
		.pipe(concat(filename)); 		// merge all js files. dependencies don't matter when you're
										// smart about not referencing variables until the scripts are loaded.

	if(flags & EXPANDED){

		stream = stream.pipe(gulp.dest(directory)); // output
	}

	if(flags & MINIFIED){

		stream = stream.pipe(uglify()) 				// minify
			.pipe(rename({ extname: '.min.js' })) 	// add .min.js
			.pipe(gulp.dest(directory)); 			// output
	}

	return stream;
});

gulp.task('watch', function(){

	gulp.watch(opts.css.watch, ['css']); 	// watch css files
	gulp.watch(opts.js.watch, ['js']); 		// watch js files
});

// If a server is needed for the xhr requests, run "gulp serve",
// then access "localhost:SERVER_PORT" in your browser, where SERVER_PORT
// is the value of the variable above.
gulp.task('serve', function(){

	var instance = server.static('public', SERVER_PORT);
	instance.start();
});

gulp.task('default', ['css', 'js', 'watch']);