var gulp = require('gulp');

var tarima = require('../lib');

gulp.task('raw', function() {
  return gulp.src('src/**/*.*')
    .pipe(tarima())
    .pipe(gulp.dest('tmp/raw'));
});

gulp.task('join', function() {
  return gulp.src('src/**/*.js.*')
    .pipe(tarima('foo/bar/views.js'))
    .pipe(gulp.dest('tmp'));
});

gulp.task('default', ['join', 'raw']);
