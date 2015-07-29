var gulp = require('gulp');
var clean = require('gulp-clean');
var minify = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");

gulp.task('all', function () {
  return gulp.src('./src/**/*')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('img', function () {
  var imgSrc = './src/img/**/*',
    imgDst = './dist/img';

  gulp.src(imgSrc)
    //.pipe(changed(imgDst))
    .pipe(imagemin())
    .pipe(gulp.dest(imgDst));
});

gulp.task('css', function () {
  return gulp.src('./src/**/*.css')
    .pipe(minify())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('js', function () {
  return gulp.src('./src/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', function () {
  return gulp.src('./dist/**/*', {
      read: false
    })
    .pipe(clean());
});
gulp.task('default', ['clean'], function () {

  gulp.run('img');
  gulp.run('css');
  gulp.run('js');

  // in the end, copy all other files as well
  gulp.run('all');
});