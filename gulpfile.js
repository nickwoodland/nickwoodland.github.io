var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var jslint = require('gulp-jslint');

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('sass', function () {
  return gulp.src('./assets/scss/main.scss')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('js', function() {
  return gulp.src('./assets/js/custom/*.js')
    .pipe(jslint({}))
    .pipe(jslint.reporter( 'stylish' ))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('site.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./assets/js/'));
});


////// WATCH TASKS
gulp.task('sass:watch', function () {
  gulp.watch('./assets/scss/**/*.scss', ['sass']);
});
