var gulp = require('gulp');
var babel = require('gulp-babel');
var webpack = require('webpack-stream');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');
var runSequence = require('run-sequence');

gulp.task('babel:server', function() {
  gulp.src('src/server/**/*.js')
		.pipe(babel({ presets: ['es2015', 'stage-0'] }))
		.pipe(gulp.dest('dist/'));
  gulp.src('src/constants/**/*.js')
    .pipe(babel({ presets: ['es2015', 'stage-0'] }))
    .pipe(gulp.dest('dist/constants'));
  return gulp.src('src/config/**/*.js')
    .pipe(babel({ presets: ['es2015', 'stage-0'] }))
    .pipe(gulp.dest('dist/config'));
});

gulp.task('webpack:client', function() {
  return gulp.src('src/client/index.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('dist/public/javascripts/'));
});

gulp.task('copy', function() {
  gulp.src('src/server/views/**/*.*')
    .pipe(gulp.dest('dist/views'));
  gulp.src('src/config/config.json')
    .pipe(gulp.dest('dist/config/'));
  gulp.src('src/stylesheets/animate.min.css')
    .pipe(gulp.dest('dist/public/stylesheets/'));
});

gulp.task('sass', function() {
  return gulp.src('src/stylesheets/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/public/stylesheets'));
});

gulp.task('start', function() {
  nodemon({
    script: 'dist/bin/www.js',
    ext: 'js html',
    env: { NODE_ENV: 'development' },
  });
})

gulp.task('copy:watch', function() {
  gulp.watch('src/server/views/**/*.*', ['copy']);
  gulp.watch('src/config/config.json', ['copy']);
});

gulp.task('babel:server:watch', function() {
  gulp.watch('src/server/**/*.js', ['babel:server']);
  gulp.watch('src/constants/**/*.js', ['babel:server']);
  gulp.watch('src/config/**/*.js', ['babel:server']);
});

gulp.task('webpack:client:watch', function() {
  gulp.watch('src/client/**/*.js', ['webpack:client']);
});

gulp.task('sass:watch', function() {
  gulp.watch('src/stylesheets/**/*.scss', ['sass']);
});

gulp.task('build', [
  'copy',
  'babel:server',
  'webpack:client',
  'sass',
]);

gulp.task('watch', [
  'copy:watch',
  'babel:server:watch',
  'webpack:client:watch',
  'sass:watch',
]);

gulp.task('serve', function() {
  runSequence([
    'build',
  ], [
    'watch',
  ], [
    'start',
  ]);
});

gulp.task('default', ['build']);
