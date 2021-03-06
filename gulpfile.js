var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var jslint = require('gulp-jslint');

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('sass', function () {
  return gulp.src(['./assets/bower_components/slick.js/slick/slick.scss','./assets/bower_components/slick.js/slick/slick-theme.scss','./assets/scss/site.scss'])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('site.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('js', function() {
  return gulp.src(['assets/bower_components/slick.js/slick/slick.min.js','assets/bower_components/three.js/build/three.min.js','assets/bower_components/velocity/velocity.min.js','assets/bower_components/velocity/velocity.ui.min.js','./assets/js/vendor/*.js','./assets/js/custom/plugins.js','./assets/js/custom/scrolljack.js','./assets/js/custom/space.js','./assets/js/custom/main.js'])
    //.pipe(jslint({}))
    //.pipe(jslint.reporter( 'stylish' ))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('site.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./assets/js/'));
});


////// WATCH TASKS
gulp.task('sass:watch', function () {
  gulp.watch('./assets/scss/**/*.scss', ['sass']);
});
