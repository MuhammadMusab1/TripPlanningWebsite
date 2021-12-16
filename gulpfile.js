const {src, dest, parallel, watch} = require('gulp');
const gulpWebpack = require('webpack-stream')

function pagesTask() {
  return src('src/*.html').pipe(dest('dist'))
}

function scriptsTask() {
  return src('src/**/*.js')
  .pipe(gulpWebpack({mode: 'production', output: {filename: 'app.js'}}))
  .pipe(dest('dist'))
}

function stylesTask() {
  return src('src/*.css').pipe(dest('dist'))
}

function watchTask() {
  return watch(['src/*'], parallel(pagesTask, scriptsTask, stylesTask))
}

exports.default = parallel(pagesTask, scriptsTask, stylesTask)
exports.watch = watchTask
