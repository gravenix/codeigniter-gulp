const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const minify = require('gulp-minify');
const fs = require('fs');
var config = {};

gulp.task('config', function(){
	try{
		config = JSON.parse(fs.readFileSync('project-config.json'));
	} catch(e){
		console.log("There is an error in your project-config.json file!");
		process.exit(1);
	}
	return gulp.src('.');
});

gulp.task('debug', function(){
	config.debug = true;
	return gulp.src('.');
});

gulp.task('build-config', function(){
	config.debug = false;
	config.dist_dir = "build/";
	return gulp.src('.');
});

gulp.task('sass', function(){
	return gulp.src('scss/*.scss')
	 .pipe(sass({
         outputStyle: config.debug?'nested':'compressed'
     }))
	 .pipe(gulp.dest(config.dist_dir+"/css"))
	 .pipe(browserSync.reload({
	 	stream: true
	 }))
});

gulp.task('html', function(){
	return gulp.src('app/**/*.+(php|html|htaccess)')
	 .pipe(gulp.dest(config.dist_dir))
	 .pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('fonts', function(){
	return gulp.src('fonts/*.otf')
	.pipe(gulp.dest(config.dist_dir+"/fonts"));
})

gulp.task('js-uncompressed', function(){
	return gulp.src(['js/*.js', '!js/*.min.js'])
	.pipe(minify({
		ext:{
			min: '.min.js'
		},
		noSource: !config.debug
	}))
	.pipe(gulp.dest(config.dist_dir+"/js"))
	.pipe(browserSync.reload({
		stream: true
	}))
});

gulp.task('js-minified', function(){
	return gulp.src(['js/*.min.js'])
	.pipe(gulp.dest(config.dist_dir+"/js"))
});

gulp.task('js', gulp.series('js-minified', 'js-uncompressed'));

gulp.task('watch', function(){
	browserSync.init({
		proxy: config.host,
		port: config.port
		//server: "./dist"
	})
	gulp.watch('scss/*.scss', gulp.series('sass'));
	gulp.watch('js/**/*.js', gulp.series('js'));
	gulp.watch('app/**/*.+(html|php|htaccess)', gulp.series('html'));
});

gulp.task('default', gulp.parallel('config', 'debug', 'sass','watch', 'js', 'html', 'fonts'));
gulp.task('build', gulp.parallel('build-config', 'sass', 'js', 'html', 'fonts'));