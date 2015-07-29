var gulp = require('gulp'),
  minify = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  rename = require("gulp-rename");

gulp.task('style', function () {
  return gulp.src('web/css/*.css')
    .pipe(minify())
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('mainjs', function () {
  return gulp.src('src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('clean', cb => del(['.tmp', 'dist/*', '!dist/.git'], {
  dot: true
}, cb));

gulp.task('default', ['clean'], function () {
  gulp.run('style');
  gulp.run('mainjs');
});