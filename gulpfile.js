const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint:js', () =>
  gulp.src('./src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()));

gulp.task('lint', ['lint:js']);
