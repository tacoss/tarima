var gulp = require('gulp'),
    debug = require('gulp-debug');

var tarima = require('./lib');

gulp.task('raw', function() {
  return gulp.src('spec/views/**/*.*')
    .pipe(debug({ title: 'BEFORE_RAW' }))
    .pipe(tarima())
    .pipe(gulp.dest('tmp/raw'))
    .pipe(debug({ title: 'AFTER_RAW' }));
});

gulp.task('join', function() {
  return gulp.src('spec/views/**/*.js.*')
    .pipe(debug({ title: 'BEFORE_JOIN' }))
    .pipe(tarima('foo/bar/views.js'))
    .pipe(gulp.dest('tmp'))
    .pipe(debug({ title: 'AFTER_JOIN' }));
});

gulp.task('default', ['join', 'raw']);
