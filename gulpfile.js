var gulp = require('gulp'),
    debug = require('gulp-debug');

var tarima = require('./lib');

gulp.task('raw', function() {
  return gulp.src('src/**/*.*')
    .pipe(debug({ title: 'BEFORE_RAW' }))
    .pipe(tarima())
    .pipe(debug({ title: 'AFTER_RAW' }))
    .pipe(gulp.dest('tmp/raw'));
});

gulp.task('join', function() {
  return gulp.src('src/**/*.js.*')
    .pipe(debug({ title: 'BEFORE_JOIN' }))
    .pipe(tarima('foo/bar/views.js'))
    .pipe(debug({ title: 'AFTER_JOIN' }))
    .pipe(gulp.dest('tmp'));
});

gulp.task('default', ['join', 'raw']);
