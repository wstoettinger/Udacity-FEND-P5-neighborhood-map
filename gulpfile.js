'use strict';

var gulp = require('gulp'),
  minify = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  imagemin = require('gulp-imagemin'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer');

// building js bundle with browserify
gulp.task('scripts', function () {
  return browserify({
      entries: [
        './src/js/main.js'
      ]
    })
    .bundle()
    .pipe(source('bundle.js'))
    //.pipe(buffer())
    //.pipe(uglify())
    .pipe(gulp.dest('./web/js/'));
});

// not used:
gulp.task('components', function () {
  return gulp.src('./src/components/*.html')
    //.pipe(uglify())
    .pipe(gulp.dest('./web/components/'));
});

gulp.task('css', function () {
  return gulp.src('./src/**/*.css')
    .pipe(minify())
    .pipe(gulp.dest('./web/'));
});

// copy the index files
gulp.task('index', function () {
  return gulp.src('./src/index.*')
    .pipe(gulp.dest('./web/'));
});

gulp.task('img', function () {
  var imgSrc = './src/img/**/*',
    imgDst = './web/img';

  gulp.src(imgSrc)
    //.pipe(changed(imgDst))
    .pipe(imagemin())
    .pipe(gulp.dest(imgDst));
});

gulp.task('default', ['css', 'scripts', 'index']);