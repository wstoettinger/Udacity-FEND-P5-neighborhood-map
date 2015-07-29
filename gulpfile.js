var gulp = require('gulp');
var clean = require('gulp-clean');
var minify = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");

gulp.task('images', function () {
  var imgSrc = './src/img/**/*',
    imgDst = './dist/img';

  gulp.src(imgSrc)
    .pipe(changed(imgDst))
    .pipe(imagemin())
    .pipe(gulp.dest(imgDst));
});

gulp.task('css', function () {
  return gulp.src('./src/css/*.css')
    .pipe(minify())
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('js', function () {
  return gulp.src('./src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('clean', function () {
  return gulp.src('./dist/**/*', {
      read: false
    })
    .pipe(clean());
});
gulp.task('default', ['clean'], function () {
  gulp.run('css');
  gulp.run('js');
});