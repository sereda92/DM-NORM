const gulp = require('gulp')

const fileInclude = require('gulp-file-include')
const sass = require('gulp-sass')(require('sass'))
const sassGlob = require('gulp-sass-glob')
const server = require('gulp-server-livereload')
const clean = require('gulp-clean')
const fs = require('fs')
const sourcemaps = require('gulp-sourcemaps')
const groupMedia = require('gulp-group-css-media-queries')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const babel = require('gulp-babel')
const imagemin = require('gulp-imagemin')
const changed = require('gulp-changed')
// const webp  = require('gulp-webp')
// import webp from 'gulp-webp'


const webpack = require('webpack-stream')

const { doesNotMatch } = require('assert')

gulp.task('clean', function(done){
    if(fs.existsSync('./dist/')){
        return gulp.src('./dist/', { read: false})
            .pipe(clean({force: true}))
    }
    done()
    
})

const fileIncludeSetting = {
    prefix: '@@',
    basepath: '@file'
}
const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false
        })
    }

}


gulp.task('html', function(){
    return gulp
        .src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
        .pipe(changed('./dist/'))
        .pipe(plumber(plumberNotify('HTML')))
        .pipe(fileInclude(fileIncludeSetting))
        .pipe(gulp.dest('./dist/'))
}) 


gulp.task('sass', function(){
    return gulp.src('./src/sass/*.sass')
        .pipe(changed('./dist/css/'))
        .pipe(plumber(plumberNotify('sass')))
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(groupMedia())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/css/'))
})

gulp.task('images', function(){
    return gulp.src('./src/img/**/*')
        .pipe(changed('./dist/img/'))
        .pipe(imagemin({verbose: true}))
        // .pipe(webp())
        .pipe(gulp.dest('./dist/img/'))
})

gulp.task('fonts', function(){
    return gulp.src('./src/fonts/**/*')
        .pipe(changed('./dist/fonts/'))
        .pipe(gulp.dest('./dist/fonts/'))
})
gulp.task('files', function(){
    return gulp.src('./src/files/**/*')
        .pipe(changed('./dist/files'))
        .pipe(gulp.dest('./dist/files/'))
})

gulp.task('js', function(){
    return gulp.src('./src/js/*.js')
        .pipe(changed('./dist/js'))
        .pipe(plumber(plumberNotify('js')))
        .pipe(babel())
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./dist/js'))
})

const serverOption = {
    livereload: true,
    open: true
}

gulp.task('server', function(){
    return gulp.src('./dist/')
        .pipe(server(serverOption))
})

gulp.task('watch', function(){
    gulp.watch('./src/sass/**/*.sass', gulp.parallel('sass'))
    gulp.watch('./src/**/*.html', gulp.parallel('html'))
    gulp.watch('./src/img/**/*', gulp.parallel('images'))
    gulp.watch('./src/fonts/**/*', gulp.parallel('fonts'))
    gulp.watch('./src/files/**/*', gulp.parallel('files'))
    gulp.watch('./src/js/**/*.js', gulp.parallel('js'))
})

gulp.task('default', gulp.series(
    'clean', 
    gulp.parallel('html', 'sass', 'images', 'fonts', 'files', 'js'),
    gulp.parallel('server', 'watch')
))
