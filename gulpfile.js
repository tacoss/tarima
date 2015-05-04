var gulp = require('gulp'),
    debug = require('gulp-debug');

var tarima = require('./lib');

gulp.task('default', function() {
  gulp.src('spec/sources/**/*.*')
    .pipe(debug({ title: 'T' }))
    .pipe(tarima())
    .pipe(gulp.dest('tmp_views'));
});
