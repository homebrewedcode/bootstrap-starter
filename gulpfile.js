//based on https://css-tricks.com/gulp-for-beginners/

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

//place npm js dependencies into js folder, update sources as more may be added.
gulp.task('modules:js', function() {
    //list of js node module dependencies.  Bootstrap requires jquery and popper.js
    var sources = [
        './node_modules/jquery/dist/jquery.js',
        './node_modules/popper.js/dist/umd/popper.js',
        './node_modules/bootstrap/dist/js/bootstrap.js',
    ];
    gulp.src( sources ).pipe(gulp.dest('app/js'));
});

//clean js dependencies from folder, add as new ones are included in project
gulp.task('clean:dev', function() {
    var sources = [
        'app/js/jquery.js',
        'app/js/popper.js',
        'app/js/bootstrap.js'
    ];
    return del.sync(sources);
});

//clean js dependencies and repopulate
gulp.task('build:dev', function(callback) {
    runSequence(
        'clean:dev',
        'modules:js',
        callback
    );
});

//compile scss to css
gulp.task('sass', function(){
   return gulp.src('app/scss/**/*.scss') //applies to all files ending in .scss in app/scss root and children directories
       .pipe(sass()) //use gulp-sass
       .pipe(gulp.dest('app/css'))
       .pipe(browserSync.reload({ //reloads browser on creating new css file
           stream: true
       }))
});

//file watchers, also complies sass and reloads browser when changes detected
gulp.task('watch', ['browserSync', 'sass'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);

});

//setup live server, reloads on file changes
gulp.task('browserSync', function() {
   browserSync.init({
       server: {
           baseDir: 'app'
       },
   })
});

//concatenate and minify css and js for distribution requires comments in html files
gulp.task('useref', function() {
   return gulp.src('app/*.html')
       .pipe(useref())
       .pipe(gulpIf('*.js', uglify()))
       .pipe(gulpIf('*.css', cssnano()))
       .pipe(gulp.dest('dist'))
});

//minify and optimize images
gulp.task('images', function() {
   return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
       .pipe(cache(imagemin()))
       .pipe(gulp.dest('dist/images'))
});

//transfer fonts to distribution
gulp.task('fonts', function() {
   return gulp.src('app/fonts/**/*')
       .pipe(gulp.dest('dist/fonts'))
});

//cleanup files in distribution
gulp.task('clean:dist', function() {
   return del.sync('dist');
});

//cleanup cached files
gulp.task('cache:clear', function(callback) {
   return cache.clearAll(callback);
});

//run all production tasks
gulp.task('build', function(callback) {
   runSequence(
       'clean:dist',
       ['sass', 'useref', 'images', 'fonts'],
       callback
   );
});

//default task to run while developing, runs our suite of watch tasks.
gulp.task('default', function(callback) {
   runSequence(
       ['sass', 'browserSync', 'watch'],
       callback
   );
});



