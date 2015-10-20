var gulp = require('gulp');
var flatten = require('gulp-flatten');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var express = require('express');
var browserSync = require('browser-sync');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var minimist = require('minimist');
var minifyCss = require('gulp-minify-css');
var buffer = require('gulp-buffer');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');
var del = require('del');

var server;
var options = minimist(process.argv);
var environment = options.environment || 'development';


/**
 * COPY FILES TO DIST FOLDER
 */
	gulp.task('copy-files', function(){
		gulp.src('*.{html,ico,png}')
			.pipe(gulp.dest('dist'))
			.pipe(reload());
	});


/**
 * COPY ASSETS TO DIST/ASSETS FOLDER
 */
	gulp.task('copy-assets', function(){
		gulp.src('assets/**/*')
			.pipe(gulp.dest('dist/assets'))
			.pipe(reload());
	});


/**
 * OPTIMIZE IMAGES TO DIST/IMG FOLDER
 */
	gulp.task('optimize-images', function(){
		gulp.src('img/**/*.{jpg,png}')
			.pipe(environment === 'production' ? imagemin() : gutil.noop())
			.pipe(gulp.dest('dist/img'))
			.pipe(reload());
	});


/**
 * COMPILE AND OPTIONALLY MINIFY SASS TO DIST/CSS FOLDER
 */
	gulp.task('compile-sass', function(){
		gulp.src('scss/styles.scss')
			.pipe(environment === 'development' ? sourcemaps.init() : gutil.noop())
			.pipe(sass({
				includePaths:['scss/vendor/', 'node_modules/bootstrap-sass/assets/stylesheets/']
			})).on('error', handleError)
			//// Sourcecomments i stedet for sourcemap. Fjern linjen med sourcemaps.init...
			// .pipe(sass({
			// 	sourceComments: environment === 'development' ? 'map' : false
			// })).on('error', handleError)
			.pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
			.pipe(environment === 'production' ? minifyCss() : gutil.noop())
			.pipe(sourcemaps.write())
			.pipe(gulp.dest('dist/css'))
			.pipe(reload());
	});


/**
 * CONCAT AND OPTIONALLY MINIFY JS FILES WITH BROWSERIFY TO DIST/SCRIPTS FORLDER
 */

	gulp.task('scripts', function(){
		return browserify('./scripts/main.js', {debug: environment === 'development'})
			.bundle().on('error', handleError)
			.pipe(source('bundle.js'))
			.pipe(environment === 'production' ? buffer() : gutil.noop())
			.pipe(environment === 'production' ? uglify() : gutil.noop())
			.pipe(gulp.dest('dist/scripts'))
			.pipe(reload());
	});


/**
 * CLEAN OUT DIST FOLDER PRIOR TO NEW BUILD
 * May be automated in build task in gulp 4 with gulp.series
 */
	gulp.task('clean', function(){
		del('dist/**/*')
	});

/**
 * START SERVER AND BROWSERSYNC
 */
	gulp.task('server', function(){
		server = express();
		server.use(express.static('dist'));
		server.listen(8000);
		// browserSync({ proxy: 'localhost:8000', browser: "google chrome" });
		browserSync({ proxy: 'localhost:8000' });
	});


/**
 * WATCH CHANGES
 */
	gulp.task('watch', function(){
		gulp.watch('*.html', ['copy-files']);
		gulp.watch('assets/**/*', ['copy-assets']);
		gulp.watch('img/**/*[jpg,png]', ['optimize-images']);
		gulp.watch('scss/**/*.scss', ['compile-sass']);
		gulp.watch('scripts/main.js', ['scripts']);
	});


/**
 * BUILD PROJECT
 */
	gulp.task('build', ['copy-files', 'copy-assets', 'optimize-images', 'compile-sass', 'scripts']);


/**
 * DEFAULT TASK
 * 
 * Use 
 * gulp --environment produdtion   
 * to build optimized production version
 * 
 */
	gulp.task('default', ['build', 'watch', 'server']);



/**
 * HELPER FUNCTIONS
 */

	function handleError(err) {
		console.log(err.toString());
		this.emit('end');
	};

	function reload() {
		if (server) {
			return browserSync.reload({ stream: true});
		}
		return gutil.noop();
	}