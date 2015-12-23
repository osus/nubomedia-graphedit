var gulp = require('gulp');   
//var livereload = require('gulp-livereload');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var shell = require('gulp-shell')
var del = require('del');
var runSequence = require('run-sequence');
var liveServer = require("live-server");

var srcPath = 'app/';
var dstPath = 'dist/';

// Paths that gulp should watch
var files = {
  js: [
    srcPath+'js/*.js',
    srcPath+'js/**/*.js'
  ],
  images:     [
    srcPath+'/images/**'
  ],
  css:         [
    srcPath+'css/*.css',
    srcPath+'css/**/*.css',
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
  ],
  fonts: [
    'node_modules/bootstrap/dist/fonts/*'
  ],
  vendor_js: [
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/jsplumb/dist/js/jsPlumb-1.7.9-min.js'
  ],
  html:          [
    srcPath+'index.html',
  ],
  static: [
    'app/electron/package.json',
    'app/electron/main.js'
  ]
};

function COPY(task, src, dst) {
  gulp.task(task, function () {
    gulp
      .src(src)
      .pipe(gulp.dest(dstPath + dst));
  });
}

// ------------
// Tasks

gulp.task('js', function() {
  return browserify(srcPath + 'js/index.js')
    .transform(babelify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    //.pipe(sourcemaps.init({loadMaps: true}))
    .on('error', gutil.log)
    //.pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dstPath + 'js'));
});

// ------------
COPY('images', files.images, 'images');
COPY('css', files.css, 'css');
COPY('fonts', files.fonts, 'fonts');
COPY('vendor_js', files.vendor_js, 'js');
COPY('html', files.html, '');
COPY('static', files.static, '');

// Watch task
gulp.task('watch', function() {
  gulp.watch(files.js, ['js']);
  gulp.watch(files.images, ['images']);
  gulp.watch(files.css, ['css']);
  gulp.watch(files.fonts, ['fonts']);
  gulp.watch(files.vendor_js, ['vendor_js']);
  gulp.watch(files.html, ['html']);
  gulp.watch(files.static, ['static']);

//  livereload.listen({basePath:dstPath});
//  gulp.watch(dstPath + '**').on('change', livereload.changed);

  liveServer.start({root:dstPath})
});

// ------------
// common executable tasks

gulp.task('clean', function() { return del(dstPath) });

gulp.task('build', ['js', 'images', 'css', 'fonts', 'vendor_js', 'html', 'static']);

gulp.task('rebuild', function(cb) { runSequence('clean', 'build', cb) });
gulp.task('default', function(cb) { runSequence('rebuild', 'watch', cb) });
gulp.task('electron', ['rebuild'], shell.task(['electron ' + dstPath]));
