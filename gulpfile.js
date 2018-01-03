//path
var trunk = 'web3_trunk/';
var release = 'web3_release/';
//gulp
const gulp = require('gulp');
// del
const del = require('del');
// sass
const sass = require('gulp-sass');
// clean css
const cleanCSS = require('gulp-clean-css');
// rename
const rename = require('gulp-rename');
// autoprefixer
const autoprefixer = require('gulp-autoprefixer');
// merge json
const mergeJson = require('gulp-merge-json');
//Удаляем папки с css
gulp.task('clean_css', function () {
    del.sync(trunk + '/modules/**/*.css');
    del.sync(trunk + '/modules/*/_css');
    del.sync(trunk + '/modules/scene/scenes/_css');
});
//Превратим scss в css
gulp.task('scss', ['clean_css'], function () {
    return gulp.src(trunk + 'modules/*/scss/*.scss')
            .pipe(sass({outputStyle: 'compact'}))
            .pipe(autoprefixer({
                browsers: ['last 2 version', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
            }))
            .pipe(rename(function (path) {
                path.dirname = path.dirname.replace('\\scss', '\\_css');
            }))
            .pipe(gulp.dest(trunk + 'modules/'));
});
gulp.task('scene_scss', ['scss'], function () {
    return gulp.src(trunk + 'modules/scene/scenes/scss/*.scss')
            .pipe(sass({outputStyle: 'compact'}))
            .pipe(autoprefixer({
                browsers: ['last 2 version', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
            }))
            .pipe(gulp.dest(trunk + 'modules/scene/scenes/_css/'));
});
gulp.task('clean_lang', function () {
    del.sync(trunk + '/_lang');
});
gulp.task('lang', ['clean_lang'], function () {
    // ru
    gulp.src(trunk + 'modules/*/lang/ru.json')
            .pipe(mergeJson('ru.json'))
            .pipe(gulp.dest(trunk + '_lang/'));
    // en
    gulp.src(trunk + 'modules/*/lang/en.json')
            .pipe(mergeJson('en.json'))
            .pipe(gulp.dest(trunk + '_lang/'));
});
// следим за изменением scss
// если перегружает систему - закомментим 
gulp.task('watch_css', ['scss', 'scene_scss'], function () {
    gulp.watch(trunk + 'modules/**/*.scss', ['scss', 'scene_scss']);
});
// следим за изменением lang
// если перегружает систему - закомментим 
gulp.task('watch_lang', ['lang'], function () {
    gulp.watch(trunk + 'modules/*/lang/*.json', ['lang']);
});